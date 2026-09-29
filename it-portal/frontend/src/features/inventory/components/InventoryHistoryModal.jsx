import { useMemo, useRef, useState } from 'react'
import { Download, FileSpreadsheet, History, RotateCcw } from 'lucide-react'
import { buildInventoryHistoryExportUrl } from '../../../entities/inventory/api'
import { buildInventoryAliasMap, normalizeInventoryValue } from '../lib/normalization'
import { ScrollTopButton } from '../../../shared/ui/ScrollTopButton'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'
import { isHiddenPortalAccount } from '../../../shared/lib/portalAccounts'

const DEFAULT_FILTERS = {
  date_from: '',
  date_to: '',
  fio: '',
  room: '',
  printer_model_name: '',
  transaction_type: '',
  stock_type: ''
}

function getTransactionMeta(entry) {
  if (entry.transaction_type === 'installation') {
    return { label: 'Установка', color: '#fda4af', border: 'rgba(248, 113, 113, 0.28)', background: 'rgba(248, 113, 113, 0.12)' }
  }

  if (entry.transaction_type === 'replenishment') {
    return { label: 'Приход', color: '#4ade80', border: 'rgba(74, 222, 128, 0.24)', background: 'rgba(74, 222, 128, 0.12)' }
  }

  return { label: 'Корректировка', color: '#fde047', border: 'rgba(250, 204, 21, 0.24)', background: 'rgba(250, 204, 21, 0.12)' }
}

function getStockMeta(stockType) {
  return stockType === 'new'
    ? { label: 'НОВЫЙ', color: '#4ade80', border: 'rgba(74,222,128,0.2)', background: 'rgba(74,222,128,0.1)' }
    : { label: 'ЗАПРАВ.', color: 'var(--accent)', border: 'rgba(138,43,226,0.2)', background: 'rgba(138,43,226,0.1)' }
}

function formatChangeAmount(value) {
  if (value > 0) return `+${value}`
  return String(value)
}

function matchesDateRange(createdAt, dateFrom, dateTo) {
  const dateValue = String(createdAt || '').slice(0, 10)
  if (dateFrom && dateValue < dateFrom) return false
  if (dateTo && dateValue > dateTo) return false
  return true
}

function normalizedIncludes(value, needle) {
  if (!needle) return true
  return String(value || '').toLowerCase().includes(needle.toLowerCase())
}

function FilterField({ label, children }) {
  return (
    <label style={{ display: 'grid', gap: '6px' }}>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{label}</span>
      {children}
    </label>
  )
}

const FILTER_CONTROL_STYLE = {
  minHeight: '44px',
  fontSize: '0.95rem',
  paddingInline: '14px'
}

function SummaryCard({ label, value, hint, accent }) {
  return (
    <div className="glass-panel" style={{ padding: '14px 16px', border: `1px solid ${accent}`, background: 'rgba(255,255,255,0.03)', minHeight: '88px' }}>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.76rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
      <div style={{ marginTop: '10px', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-main)' }}>{value}</div>
      <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{hint}</div>
    </div>
  )
}

function ReportTable({ title, subtitle, columns, rows, emptyText }) {
  return (
    <div className="glass-panel" style={{ padding: '18px', background: 'rgba(255,255,255,0.025)' }}>
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontWeight: 600 }}>{title}</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>{subtitle}</div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              {columns.map((column) => (
                <th key={column.key} style={{ padding: '10px 8px', color: 'var(--text-muted)', fontSize: '0.78rem' }}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '20px 8px', color: 'var(--text-muted)' }}>{emptyText}</td>
              </tr>
            ) : rows.map((row, index) => (
              <tr key={`${title}-${index}`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                {columns.map((column) => (
                  <td key={column.key} style={{ padding: '10px 8px', verticalAlign: 'top' }}>{column.render ? column.render(row) : row[column.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function renderPerformer(entry) {
  const isHiddenPerformer = isHiddenPortalAccount({
    username: entry.performer_username,
    name: entry.performer_fio,
    email: entry.performer_email
  })
  if (isHiddenPerformer) {
    return (
      <div style={{ display: 'grid', gap: '4px' }}>
        <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>Система</span>
      </div>
    )
  }

  const title = entry.performer_fio || entry.performer_username || 'Система'
  const details = [entry.performer_username, entry.performer_email].filter(Boolean).join(' · ')

  return (
    <div style={{ display: 'grid', gap: '4px' }}>
      <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{title}</span>
      {details ? <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{details}</span> : null}
    </div>
  )
}

function renderDestination(entry) {
  if (entry.transaction_type !== 'installation') {
    return (
      <div style={{ display: 'grid', gap: '4px' }}>
        <span style={{ color: 'var(--text-main)' }}>Склад</span>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Изменение остатка без привязки к размещению принтера</span>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gap: '4px' }}>
      <span style={{ color: 'var(--text-main)' }}>
        {entry.fio || 'Общий принтер'}
        {entry.room ? <span style={{ color: 'var(--accent)', marginLeft: '6px' }}>к. {entry.room}</span> : null}
      </span>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{entry.normalizedPrinterModelName || entry.printer_model_name || 'Модель не указана'}</span>
    </div>
  )
}

export function InventoryHistoryModal({
  open,
  onClose,
  inventoryHistory = [],
  inventory = [],
  printers = [],
  aliases = [],
  loading = false,
  pageMode = false,
  onBack = null
}) {
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const modalScrollRef = useRef(null)

  const aliasMap = useMemo(() => buildInventoryAliasMap(aliases), [aliases])

  const normalizedHistory = useMemo(() => (
    (inventoryHistory || []).map((entry) => ({
      ...entry,
      normalizedPrinterModelName: normalizeInventoryValue(entry.printer_model_name, 'printer_model', aliasMap),
      normalizedCartridgeModelName: normalizeInventoryValue(entry.cartridge_name, 'cartridge_model', aliasMap),
      normalizedCartridgeTypeName: normalizeInventoryValue(entry.cartridge_type_name, 'cartridge_type', aliasMap)
    }))
  ), [inventoryHistory, aliasMap])

  const filteredHistory = useMemo(() => (
    normalizedHistory.filter((entry) => (
      matchesDateRange(entry.created_at, filters.date_from, filters.date_to)
      && normalizedIncludes(entry.fio, filters.fio)
      && normalizedIncludes(entry.room, filters.room)
      && normalizedIncludes(entry.normalizedPrinterModelName || entry.printer_model_name, filters.printer_model_name)
      && (!filters.transaction_type || entry.transaction_type === filters.transaction_type)
      && (!filters.stock_type || entry.stock_type === filters.stock_type)
    ))
  ), [normalizedHistory, filters])

  const summary = useMemo(() => {
    const installations = filteredHistory.filter((entry) => entry.transaction_type === 'installation').length
    const replenishments = filteredHistory.filter((entry) => entry.transaction_type === 'replenishment').length
    const adjustments = filteredHistory.filter((entry) => entry.transaction_type === 'adjustment').length
    const consumed = filteredHistory
      .filter((entry) => entry.transaction_type === 'installation')
      .reduce((total, entry) => total + Math.abs(entry.change_amount), 0)

    return { total: filteredHistory.length, installations, replenishments, adjustments, consumed }
  }, [filteredHistory])

  const consumptionRows = useMemo(() => {
    const now = Date.now()
    const day30 = 30 * 24 * 60 * 60 * 1000
    const day90 = 90 * 24 * 60 * 60 * 1000
    const grouped = new Map()

    for (const entry of normalizedHistory) {
      if (entry.transaction_type !== 'installation') continue
      const key = `${entry.normalizedCartridgeModelName}|${entry.normalizedCartridgeTypeName}`
      const existing = grouped.get(key) || {
        cartridgeModel: entry.normalizedCartridgeModelName || entry.cartridge_name,
        cartridgeType: entry.normalizedCartridgeTypeName || entry.cartridge_type_name,
        total: 0,
        last30: 0,
        last90: 0
      }

      existing.total += Math.abs(entry.change_amount || 0)

      const age = now - new Date(entry.created_at).getTime()
      if (age <= day30) existing.last30 += Math.abs(entry.change_amount || 0)
      if (age <= day90) existing.last90 += Math.abs(entry.change_amount || 0)

      grouped.set(key, existing)
    }

    return [...grouped.values()]
      .map((row) => ({
        ...row,
        avgPerWeek: Number((row.last90 / (90 / 7)).toFixed(2)),
        avgPerMonth: Number((row.last90 / 3).toFixed(2))
      }))
      .sort((a, b) => b.last90 - a.last90 || b.total - a.total)
      .slice(0, 12)
  }, [normalizedHistory])

  const printerUsageRows = useMemo(() => {
    const grouped = new Map()

    for (const entry of normalizedHistory) {
      if (entry.transaction_type !== 'installation') continue
      const placement = [
        entry.normalizedPrinterModelName || entry.printer_model_name || 'Неизвестная модель',
        entry.fio || 'Общий принтер',
        entry.room ? `к. ${entry.room}` : ''
      ].filter(Boolean).join(' · ')

      const existing = grouped.get(placement) || {
        placement,
        installs: 0,
        cartridgeType: entry.normalizedCartridgeTypeName || entry.cartridge_type_name || '—'
      }

      existing.installs += Math.abs(entry.change_amount || 0)
      grouped.set(placement, existing)
    }

    return [...grouped.values()]
      .sort((a, b) => b.installs - a.installs)
      .slice(0, 12)
  }, [normalizedHistory])

  const projectionRows = useMemo(() => {
    const now = Date.now()
    const last90Cutoff = 90 * 24 * 60 * 60 * 1000
    const consumptionByCartridge = new Map()

    for (const entry of normalizedHistory) {
      if (entry.transaction_type !== 'installation') continue
      const age = now - new Date(entry.created_at).getTime()
      if (age > last90Cutoff) continue

      const key = `${entry.normalizedCartridgeModelName}|${entry.normalizedCartridgeTypeName}`
      consumptionByCartridge.set(key, (consumptionByCartridge.get(key) || 0) + Math.abs(entry.change_amount || 0))
    }

    const stockByCartridge = new Map()

    for (const item of inventory || []) {
      const cartridgeModel = normalizeInventoryValue(item.name, 'cartridge_model', aliasMap)
      const cartridgeType = normalizeInventoryValue(item.cartridge_type_name, 'cartridge_type', aliasMap)
      const key = `${cartridgeModel}|${cartridgeType}`
      const existing = stockByCartridge.get(key) || {
        cartridgeModel,
        cartridgeType,
        totalStock: 0,
        newStock: 0,
        refilledStock: 0
      }

      existing.newStock += Number(item.new_count || 0)
      existing.refilledStock += Number(item.refilled_count || 0)
      existing.totalStock += Number(item.new_count || 0) + Number(item.refilled_count || 0)
      stockByCartridge.set(key, existing)
    }

    return [...stockByCartridge.values()]
      .map((row) => {
        const key = `${row.cartridgeModel}|${row.cartridgeType}`
        const consumed90 = consumptionByCartridge.get(key) || 0
        const dailyRate = consumed90 > 0 ? consumed90 / 90 : 0
        const daysLeft = dailyRate > 0 ? row.totalStock / dailyRate : null

        let status = 'Запаса достаточно'
        if (daysLeft !== null && daysLeft <= 14) status = 'Риск'
        else if (daysLeft !== null && daysLeft <= 30) status = 'Под контролем'
        else if (daysLeft === null) status = 'Нет расхода'

        return {
          ...row,
          consumed90,
          daysLeft,
          weeksLeft: daysLeft === null ? null : daysLeft / 7,
          status
        }
      })
      .sort((a, b) => {
        if (a.daysLeft === null && b.daysLeft === null) return a.totalStock - b.totalStock
        if (a.daysLeft === null) return 1
        if (b.daysLeft === null) return -1
        return a.daysLeft - b.daysLeft
      })
      .slice(0, 12)
  }, [inventory, normalizedHistory, aliasMap])

  const normalizedPrinters = useMemo(() => (
    (printers || []).map((printer) => ({
      ...printer,
      normalizedModelName: normalizeInventoryValue(printer.model_name, 'printer_model', aliasMap),
      normalizedCartridgeTypeName: normalizeInventoryValue(printer.cartridge_type_name, 'cartridge_type', aliasMap)
    }))
  ), [printers, aliasMap])

  const printerAliasRows = useMemo(() => normalizedPrinters
    .filter((printer) => printer.model_name && printer.normalizedModelName && printer.model_name.trim().replace(/\s+/g, ' ') !== printer.normalizedModelName.trim().replace(/\s+/g, ' '))
    .slice(0, 12), [normalizedPrinters])

  const resetFilters = () => setFilters(DEFAULT_FILTERS)
  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }))
  const handleExport = (format) => window.open(buildInventoryHistoryExportUrl(format, filters), '_blank', 'noopener,noreferrer')

  const content = (
    <div className="glass-panel" style={{ padding: '32px', background: 'rgba(20,20,32,0.98)', border: '1px solid rgba(138,43,226,0.3)', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
      <div className="history-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <History size={28} color="var(--accent)" />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.8rem' }}>Центр отчетов по картриджам</h2>
            <div style={{ marginTop: '6px', color: 'var(--text-muted)', fontSize: '0.92rem' }}>
              История, нормализация алиасов, расход по моделям и прогноз остатка в одном окне.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-primary compact" onClick={() => handleExport('xlsx')}>
            <FileSpreadsheet size={15} /> Экспорт XLSX
          </button>
          <button className="btn btn-secondary compact" onClick={() => handleExport('csv')}>
            <Download size={15} /> CSV
          </button>
          {!pageMode ? (
            <button className="btn btn-secondary compact" onClick={onClose} style={{ width: '40px', height: '40px', borderRadius: '50%', padding: 0, justifyContent: 'center', fontSize: '1.2rem' }}>
              ×
            </button>
          ) : null}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '12px', marginBottom: '18px' }}>
        <SummaryCard label="Записей" value={summary.total} hint="в текущей выборке журнала" accent="rgba(138,43,226,0.28)" />
        <SummaryCard label="Установок" value={summary.installations} hint="операции списания" accent="rgba(248,113,113,0.28)" />
        <SummaryCard label="Приход" value={summary.replenishments} hint="заведение стартовых партий" accent="rgba(74,222,128,0.28)" />
        <SummaryCard label="Корректировки" value={summary.adjustments} hint="ручные правки остатков" accent="rgba(250,204,21,0.28)" />
        <SummaryCard label="Списано" value={summary.consumed} hint="установлено по текущему фильтру" accent="rgba(45,212,191,0.28)" />
      </div>

      <div style={{ paddingRight: '8px', display: 'grid', gap: '18px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '18px' }}>
          <ReportTable
            title="Самые расходуемые картриджи"
            subtitle="Нормализованные модели картриджей по установкам за всю историю и за последние 90 дней."
            emptyText="Пока нет установок для расчета расхода."
            columns={[
              { key: 'cartridgeModel', label: 'Модель' },
              { key: 'cartridgeType', label: 'Тип' },
              { key: 'total', label: 'Всего' },
              { key: 'last30', label: '30 дн.' },
              { key: 'last90', label: '90 дн.' },
              { key: 'avgPerWeek', label: 'В нед.' }
            ]}
            rows={consumptionRows}
          />

          <ReportTable
            title="Принтеры с самым частым расходом"
            subtitle="Точки установки, где замены происходят чаще всего."
            emptyText="Нет установок для расчета."
            columns={[
              { key: 'placement', label: 'Принтер / место' },
              { key: 'cartridgeType', label: 'Тип картриджа' },
              { key: 'installs', label: 'Установок' }
            ]}
            rows={printerUsageRows}
          />
        </div>

        <ReportTable
          title="Прогноз остатков"
          subtitle="Простая оценка по текущему складу и установкам за последние 90 дней."
          emptyText="Недостаточно данных по складу."
          columns={[
            { key: 'cartridgeModel', label: 'Модель' },
            { key: 'cartridgeType', label: 'Тип' },
            { key: 'totalStock', label: 'Остаток' },
            { key: 'consumed90', label: 'Расход 90 дн.' },
            { key: 'daysLeft', label: 'Хватит на', render: (row) => row.daysLeft === null ? 'Нет расхода' : `${Math.max(1, Math.round(row.daysLeft))} дн.` },
            { key: 'weeksLeft', label: 'Недели', render: (row) => row.weeksLeft === null ? '—' : row.weeksLeft.toFixed(1) },
            { key: 'status', label: 'Статус', render: (row) => <span style={{ color: row.status === 'Риск' ? '#fda4af' : row.status === 'Под контролем' ? '#fde047' : '#86efac' }}>{row.status}</span> }
          ]}
          rows={projectionRows}
        />

        <div className="glass-panel" style={{ padding: '18px', background: 'rgba(255,255,255,0.025)' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: 600 }}>Журнал операций</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
              Ниже остается детальный журнал, а отчеты выше строятся на его основе.
            </div>
          </div>
          <div className="glass-panel" style={{ padding: '18px', marginBottom: '18px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(138,43,226,0.16)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <div style={{ fontWeight: 600 }}>Фильтры журнала</div>
              <button className="btn btn-secondary compact" onClick={resetFilters}>
                <RotateCcw size={14} /> Сбросить
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '12px' }}>
              <FilterField label="Период с">
                <input
                  className="input-glass"
                  style={FILTER_CONTROL_STYLE}
                  type="date"
                  value={filters.date_from}
                  onChange={(event) => handleFilterChange('date_from', event.target.value)}
                />
              </FilterField>
              <FilterField label="Период по">
                <input
                  className="input-glass"
                  style={FILTER_CONTROL_STYLE}
                  type="date"
                  value={filters.date_to}
                  onChange={(event) => handleFilterChange('date_to', event.target.value)}
                />
              </FilterField>
              <FilterField label="Сотрудник">
                <input
                  className="input-glass"
                  style={FILTER_CONTROL_STYLE}
                  value={filters.fio}
                  onChange={(event) => handleFilterChange('fio', event.target.value)}
                  placeholder="ФИО"
                />
              </FilterField>
              <FilterField label="Кабинет">
                <input
                  className="input-glass"
                  style={FILTER_CONTROL_STYLE}
                  value={filters.room}
                  onChange={(event) => handleFilterChange('room', event.target.value)}
                  placeholder="Напр. 214"
                />
              </FilterField>
              <FilterField label="Модель принтера">
                <input
                  className="input-glass"
                  style={FILTER_CONTROL_STYLE}
                  value={filters.printer_model_name}
                  onChange={(event) => handleFilterChange('printer_model_name', event.target.value)}
                  placeholder="HP LaserJet..."
                />
              </FilterField>
              <FilterField label="Операция">
                <select
                  className="input-glass"
                  style={FILTER_CONTROL_STYLE}
                  value={filters.transaction_type}
                  onChange={(event) => handleFilterChange('transaction_type', event.target.value)}
                >
                  <option value="">Все</option>
                  <option value="installation">Установка</option>
                  <option value="replenishment">Приход</option>
                  <option value="adjustment">Корректировка</option>
                </select>
              </FilterField>
              <FilterField label="Тип остатка">
                <select
                  className="input-glass"
                  style={FILTER_CONTROL_STYLE}
                  value={filters.stock_type}
                  onChange={(event) => handleFilterChange('stock_type', event.target.value)}
                >
                  <option value="">Все</option>
                  <option value="new">Новый</option>
                  <option value="refilled">Заправленный</option>
                </select>
              </FilterField>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="history-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Дата и время</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Операция</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Картридж</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Тип / Delta</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Куда / Откуда</th>
                  <th style={{ padding: '12px', color: 'var(--text-muted)' }}>Исполнитель</th>
                </tr>
              </thead>
              <tbody>
                {loading && filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Загружаем журнал операций...</td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>По текущим фильтрам записей нет</td>
                  </tr>
                ) : filteredHistory.map((entry) => {
                  const transactionMeta = getTransactionMeta(entry)
                  const stockMeta = getStockMeta(entry.stock_type)

                  return (
                    <tr key={entry.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', verticalAlign: 'top' }}>
                      <td style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>{new Date(entry.created_at).toLocaleString('ru-RU')}</td>
                      <td style={{ padding: '14px 12px' }}>
                        <span style={{ fontSize: '0.75rem', padding: '4px 10px', borderRadius: '999px', background: transactionMeta.background, color: transactionMeta.color, border: `1px solid ${transactionMeta.border}` }}>
                          {transactionMeta.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'grid', gap: '4px' }}>
                          <span style={{ fontWeight: 'bold', color: 'var(--accent)' }}>{entry.normalizedCartridgeModelName || entry.cartridge_name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Тип: {entry.normalizedCartridgeTypeName || entry.cartridge_type_name || 'не указан'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ display: 'grid', gap: '8px' }}>
                          <span style={{ width: 'fit-content', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: stockMeta.background, color: stockMeta.color, border: `1px solid ${stockMeta.border}` }}>
                            {stockMeta.label}
                          </span>
                          <span style={{ fontWeight: 600, color: entry.change_amount < 0 ? '#fda4af' : '#86efac' }}>{formatChangeAmount(entry.change_amount)}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>{renderDestination(entry)}</td>
                      <td style={{ padding: '14px 12px' }}>{renderPerformer(entry)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {!pageMode ? (
        <div className="history-modal-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '12px' }}>
          <button className="btn btn-primary" onClick={onClose}>Закрыть отчеты</button>
        </div>
      ) : null}

      <ScrollTopButton targetRef={modalScrollRef} />
    </div>
  )

  if (pageMode) {
    return (
      <UtilityPageShell
        eyebrow="Картриджи"
        title="Отчеты по картриджам"
        description="История операций, аналитика по расходу, прогноз остатков и детальный журнал с фильтрами."
        onBack={onBack}
        maxWidth="1440px"
        compact
      >
        {content}
      </UtilityPageShell>
    )
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      overlayStyle={{
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 300,
        padding: '24px 36px 40px',
        alignItems: 'flex-start',
        overflowY: 'auto'
      }}
      overlayRef={modalScrollRef}
      panelClassName="glass-panel modal-panel history-modal-panel"
      panelStyle={{
        padding: 0,
        maxWidth: '1440px',
        width: '100%',
        margin: '0 auto',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none'
      }}
    >
      {content}
    </ModalShell>
  )
}
