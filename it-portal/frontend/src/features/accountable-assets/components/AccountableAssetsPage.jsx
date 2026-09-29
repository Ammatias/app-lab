import { memo, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { FileArchive, FileSpreadsheet, History, Package, Pencil, Plus, RotateCcw, Undo2, X } from 'lucide-react'
import { containerVariants } from '../../../shared/lib/motion'
import { ActionIconButton } from '../../../shared/ui/ActionIconButton'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'
import {
  buildAccountableSummary,
  getAccountableWriteoffStatus,
  getSelectableWriteoffAssets
} from '../lib/accountablePresentation'

const summaryCardStyle = {
  padding: '10px 12px',
  display: 'grid',
  gap: '3px',
  minWidth: '128px',
  minHeight: '52px',
  alignContent: 'center'
}

const cellStyle = {
  padding: '12px 14px',
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  verticalAlign: 'top'
}

const headerCellStyle = {
  ...cellStyle,
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--text-muted)',
  background: 'rgba(255,255,255,0.03)'
}

const statusBadgeStyle = (status) => {
  const mode = status === 'pending' ? 'pending' : status === 'written_off' ? 'written_off' : 'active'
  const palette = {
    active: {
      border: 'rgba(134, 239, 172, 0.28)',
      background: 'rgba(20, 83, 45, 0.24)',
      color: '#bbf7d0'
    },
    pending: {
      border: 'rgba(250, 204, 21, 0.36)',
      background: 'rgba(113, 63, 18, 0.28)',
      color: '#fde68a'
    },
    written_off: {
      border: 'rgba(248, 113, 113, 0.32)',
      background: 'rgba(127, 29, 29, 0.3)',
      color: '#fecaca'
    }
  }[mode]

  return {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '112px',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '0.78rem',
  fontWeight: 600,
  border: `1px solid ${palette.border}`,
  background: palette.background,
  color: palette.color
  }
}

const sectionTitleStyle = {
  padding: '12px 14px 6px',
  fontWeight: 600
}

function formatDateTime(value) {
  if (!value) return '—'

  try {
    return new Date(value).toLocaleString('ru-RU')
  } catch {
    return String(value)
  }
}

function renderLocationCell(item) {
  const canonicalLocations = Array.isArray(item.locations)
    ? item.locations
      .map((location) => String(location.location_name || location.locationName || '').trim())
      .filter(Boolean)
    : []
  const canonical = String(item.location_name || '').trim()
  const raw = String(item.location_text || '').trim()

  if (canonicalLocations.length > 1) {
    return canonicalLocations.join(' · ')
  }

  if (!canonical && !raw) {
    return '—'
  }

  if (!canonical || canonical === raw) {
    return canonical || raw
  }

  return (
    <div style={{ display: 'grid', gap: '4px' }}>
      <strong>{canonical}</strong>
      <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
        Импорт: {raw}
      </span>
    </div>
  )
}

function renderLinkedEmployeeCell(item) {
  const employeeName = String(item.linked_employee_name || '').trim()
  const position = String(item.linked_position || '').trim()
  const locationName = String(item.linked_location_name || item.linked_cabinet || '').trim()
  const details = [position, locationName].filter(Boolean)

  if (!item.linked_equipment_device_id && !item.linked_employee_id && !employeeName) {
    return '—'
  }

  return (
    <div style={{ display: 'grid', gap: '4px' }}>
      <strong>{employeeName || 'Рабочее место без сотрудника'}</strong>
      {details.length ? (
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {details.join(' · ')}
        </span>
      ) : null}
    </div>
  )
}

function renderSnapshotFields(snapshot) {
  if (!snapshot) return '—'

  return [
    snapshot.inventory_number || '—',
    snapshot.quantity || '—',
    snapshot.amount || '—',
    snapshot.location_text || '—',
    snapshot.writeoff_note || '—'
  ].join(' / ')
}

function DiffTable({ title, items, emptyLabel }) {
  return (
    <div className="glass-panel" style={{ padding: '10px 10px 4px', overflow: 'hidden' }}>
      <div style={sectionTitleStyle}>{title}</div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
          <thead>
            <tr>
              <th style={headerCellStyle}>Наименование</th>
              <th style={headerCellStyle}>До</th>
              <th style={headerCellStyle}>После</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${title}-${item.name}`}>
                <td style={cellStyle}>
                  <strong>{item.name}</strong>
                </td>
                <td style={cellStyle}>{renderSnapshotFields(item.before)}</td>
                <td style={cellStyle}>{renderSnapshotFields(item.after)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {items.length === 0 ? (
        <div style={{ padding: '22px 10px 18px' }}>
          <EmptyState>{emptyLabel}</EmptyState>
        </div>
      ) : null}
    </div>
  )
}

export function AccountableImportsModal({
  open,
  onClose,
  importBatches = [],
  loadingImportBatches,
  importDiff,
  loadingImportDiff,
  selectedLeftBatchId,
  selectedRightBatchId,
  rollingBackBatchId,
  onSelectBatches,
  onRollbackBatch,
  onImport,
  importing,
  pageMode = false,
  onBack = null
}) {
  const content = (
    <div style={{ display: 'grid', gap: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.05rem' }}>
            <History size={18} />
            <span>Работа с импортами</span>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="button" onClick={onImport} disabled={importing}>
              <Package size={16} /> {importing ? 'Импорт...' : 'Импорт XLSX'}
            </button>
            {!pageMode ? (
              <button type="button" className="btn" onClick={onClose}>
                <X size={16} /> Закрыть
              </button>
            ) : null}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '16px 18px', display: 'grid', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <strong>История импортов</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Все импортные снимки и откаты
            </span>
          </div>

          {loadingImportBatches ? (
            <LoadingState />
          ) : importBatches.length === 0 ? (
            <EmptyState>История импортов пока пуста.</EmptyState>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
                <thead>
                  <tr>
                    <th style={headerCellStyle}>#</th>
                    <th style={headerCellStyle}>Дата</th>
                    <th style={headerCellStyle}>Файл</th>
                    <th style={headerCellStyle}>Тип</th>
                    <th style={headerCellStyle}>Позиции</th>
                    <th style={headerCellStyle}>Новые</th>
                    <th style={headerCellStyle}>Изменены</th>
                    <th style={headerCellStyle}>Без изм.</th>
                    <th style={headerCellStyle}>Исчезли</th>
                    <th style={headerCellStyle}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {importBatches.map((batch) => (
                    <tr key={batch.id}>
                      <td style={cellStyle}>#{batch.id}</td>
                      <td style={cellStyle}>{formatDateTime(batch.created_at)}</td>
                      <td style={cellStyle}>
                        <div style={{ display: 'grid', gap: '4px' }}>
                          <strong>{batch.source_file}</strong>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{batch.source_sheet}</span>
                        </div>
                      </td>
                      <td style={cellStyle}>
                        {batch.operation_kind === 'rollback' ? `Откат от #${batch.rollback_source_batch_id}` : 'Импорт'}
                      </td>
                      <td style={cellStyle}>{batch.imported_count}</td>
                      <td style={cellStyle}>{batch.new_count}</td>
                      <td style={cellStyle}>{batch.updated_count}</td>
                      <td style={cellStyle}>{batch.unchanged_count}</td>
                      <td style={cellStyle}>{batch.removed_count}</td>
                      <td style={cellStyle}>
                        <button
                          className="btn"
                          type="button"
                          onClick={() => onRollbackBatch(batch.id)}
                          disabled={rollingBackBatchId === batch.id}
                        >
                          <Undo2 size={14} /> {rollingBackBatchId === batch.id ? 'Откат...' : 'Откатить'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass-panel" style={{ padding: '16px 18px', display: 'grid', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <strong>Сравнение двух импортов</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Новые, исчезнувшие и изменившиеся позиции по связке инв. номера и наименования
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <label style={{ display: 'grid', gap: '6px', minWidth: '260px' }}>
              <span>Левый импорт</span>
              <select
                className="input-glass"
                value={selectedLeftBatchId || ''}
                onChange={(event) => onSelectBatches({ leftBatchId: Number(event.target.value) })}
              >
                {importBatches.map((batch) => (
                  <option key={`left-${batch.id}`} value={batch.id}>
                    #{batch.id} {batch.source_file}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'grid', gap: '6px', minWidth: '260px' }}>
              <span>Правый импорт</span>
              <select
                className="input-glass"
                value={selectedRightBatchId || ''}
                onChange={(event) => onSelectBatches({ rightBatchId: Number(event.target.value) })}
              >
                {importBatches.map((batch) => (
                  <option key={`right-${batch.id}`} value={batch.id}>
                    #{batch.id} {batch.source_file}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {loadingImportDiff ? (
            <LoadingState />
          ) : !importDiff ? (
            <EmptyState>Для сравнения нужно хотя бы два разных импорта.</EmptyState>
          ) : (
            <>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                <div className="glass-panel" style={summaryCardStyle}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Новые</span>
                  <strong style={{ fontSize: '1.8rem', lineHeight: 1.1 }}>{importDiff.new_items.length}</strong>
                </div>
                <div className="glass-panel" style={summaryCardStyle}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Исчезнувшие</span>
                  <strong style={{ fontSize: '1.8rem', lineHeight: 1.1 }}>{importDiff.removed_items.length}</strong>
                </div>
                <div className="glass-panel" style={summaryCardStyle}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Изменившиеся</span>
                  <strong style={{ fontSize: '1.8rem', lineHeight: 1.1 }}>{importDiff.changed_items.length}</strong>
                </div>
              </div>

              <DiffTable
                title="Новые позиции"
                items={importDiff.new_items}
                emptyLabel="Новых позиций между выбранными импортами нет."
              />
              <DiffTable
                title="Исчезнувшие позиции"
                items={importDiff.removed_items}
                emptyLabel="Исчезнувших позиций между выбранными импортами нет."
              />
              <DiffTable
                title="Изменившиеся позиции"
                items={importDiff.changed_items}
                emptyLabel="Изменившихся позиций между выбранными импортами нет."
              />
            </>
          )}
        </div>
      </div>
  )

  if (pageMode) {
    return (
      <UtilityPageShell
        eyebrow="Подотчет"
        title="История импортов"
        description="Снимки импортов, сравнение двух загрузок, diff по изменениям и быстрый откат реестра к выбранному состоянию."
        onBack={onBack}
        maxWidth="1320px"
      >
        {content}
      </UtilityPageShell>
    )
  }

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      panelClassName="glass-panel modal-panel"
      panelStyle={{
        width: 'min(1320px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 48px)',
        overflow: 'auto',
        padding: '24px'
      }}
    >
      {content}
    </ModalShell>
  )
}

const AccountableAssetsPageComponent = ({
  assets,
  writtenOffAssets = [],
  loading,
  searchQuery,
  filters,
  onFiltersChange,
  importBatches,
  loadingImportBatches,
  importDiff,
  loadingImportDiff,
  selectedLeftBatchId,
  selectedRightBatchId,
  rollingBackBatchId,
  onSelectBatches,
  onRollbackBatch,
  onImport,
  importing,
  generatingWriteoffArchive,
  onGenerateWriteoffArchive,
  onOpenWriteoffPage,
  onCreate,
  onEdit
}) => {
  const [showAllActiveAssets, setShowAllActiveAssets] = useState(false)

  const selectableWriteoffAssets = useMemo(
    () => getSelectableWriteoffAssets(assets),
    [assets]
  )

  const visibleRegistryAssets = useMemo(
    () => showAllActiveAssets ? assets : assets.slice(0, 10),
    [assets, showAllActiveAssets]
  )

  const hiddenRegistryAssetsCount = Math.max(assets.length - visibleRegistryAssets.length, 0)

  const summary = useMemo(
    () => buildAccountableSummary(assets, writtenOffAssets),
    [assets, writtenOffAssets]
  )

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="content-stack"
      style={{ gap: '20px' }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'stretch' }}>
        <div className="glass-panel" style={summaryCardStyle}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>В текущем реестре</span>
          <strong style={{ fontSize: '1.15rem', lineHeight: 1.05 }}>{summary.total}</strong>
        </div>
        <div className="glass-panel" style={summaryCardStyle}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>На списании</span>
          <strong style={{ fontSize: '1.15rem', lineHeight: 1.05 }}>{summary.pending}</strong>
        </div>
        <div className="glass-panel" style={summaryCardStyle}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Списано полностью</span>
          <strong style={{ fontSize: '1.15rem', lineHeight: 1.05 }}>{summary.completed}</strong>
        </div>
        <div className="glass-panel" style={summaryCardStyle}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Списано в XLSX</span>
          <strong style={{ fontSize: '1.15rem', lineHeight: 1.05 }}>{summary.importedWrittenOff}</strong>
        </div>
        <div className="glass-panel" style={summaryCardStyle}>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.74rem' }}>Без расположения</span>
          <strong style={{ fontSize: '1.15rem', lineHeight: 1.05 }}>{summary.withoutLocation}</strong>
        </div>
        <button
          className="btn"
          type="button"
          onClick={() => {
            if (onOpenWriteoffPage) {
              onOpenWriteoffPage()
            }
          }}
          disabled={selectableWriteoffAssets.length === 0 || generatingWriteoffArchive}
          style={{ minHeight: '52px', alignSelf: 'stretch' }}
        >
          <FileArchive size={16} /> {generatingWriteoffArchive ? 'Подготовка...' : 'Списание по шаблонам'}
        </button>
      </div>

      <div className="glass-panel" style={{ padding: '16px 18px', display: 'grid', gap: '14px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={filters.onlyWithoutLocation}
              onChange={(event) => onFiltersChange({ onlyWithoutLocation: event.target.checked })}
            />
            <span>Без расположения</span>
          </label>
          <input
            className="input-glass"
            value={filters.locationFilter}
            onChange={(event) => onFiltersChange({ locationFilter: event.target.value })}
            placeholder="Фильтр по расположению"
            style={{ width: 'min(280px, 100%)' }}
          />
          <button
            className="btn"
            type="button"
            onClick={() => onFiltersChange({
              onlyWithoutLocation: false,
              locationFilter: ''
            })}
          >
            <RotateCcw size={16} /> Сбросить
          </button>
          <div style={{ flex: 1 }} />
          <button className="btn btn-primary" type="button" onClick={onCreate}>
            <Plus size={16} /> Добавить вручную
          </button>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Серверный поиск: {searchQuery ? `по "${searchQuery}"` : 'без текстового фильтра'}
        </div>
      </div>

      {loading ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <LoadingState />
        </div>
      ) : assets.length === 0 ? (
        <div className="glass-panel" style={{ padding: '32px' }}>
          <EmptyState>
            <div style={{ display: 'grid', gap: '14px', justifyItems: 'center' }}>
              <FileSpreadsheet size={28} />
              <span>Подотчет пока пуст или по текущим фильтрам ничего не найдено.</span>
              <button className="btn btn-primary" onClick={onImport} disabled={importing}>
                <Package size={18} /> {importing ? 'Импорт...' : 'Импорт XLSX'}
              </button>
            </div>
          </EmptyState>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '10px 10px 4px', overflow: 'hidden' }}>
          <div style={sectionTitleStyle}>Основной реестр</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Инв. №</th>
                  <th style={headerCellStyle}>Наименование</th>
                  <th style={{ ...headerCellStyle, width: '100px' }}>Кол-во</th>
                  <th style={{ ...headerCellStyle, width: '140px' }}>Стоимость</th>
                  <th style={{ ...headerCellStyle, width: '180px' }}>Расположение</th>
                  <th style={{ ...headerCellStyle, width: '220px' }}>Сотрудник / место</th>
                  <th style={{ ...headerCellStyle, width: '140px' }}>Списание</th>
                  <th style={{ ...headerCellStyle, width: '70px' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {visibleRegistryAssets.map((item) => {
                  const writeoffStatus = getAccountableWriteoffStatus(item)

                  return (
                    <tr key={item.id}>
                    <td style={cellStyle}><div style={{ fontWeight: 600 }}>{item.inventory_number}</div></td>
                    <td style={cellStyle}>
                      <div style={{ display: 'grid', gap: '6px' }}>
                        <strong style={{ fontSize: '0.96rem' }}>{item.name}</strong>
                        {item.note ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            Примечание: {item.note}
                          </span>
                        ) : null}
                        {item.writeoff_note ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            Списание: {item.writeoff_note}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td style={cellStyle}>{item.quantity || '—'}</td>
                    <td style={cellStyle}>{item.amount || '—'}</td>
                    <td style={cellStyle}>{renderLocationCell(item)}</td>
                    <td style={cellStyle}>{renderLinkedEmployeeCell(item)}</td>
                    <td style={cellStyle}>
                      <span style={statusBadgeStyle(writeoffStatus.mode)}>
                        {writeoffStatus.label}
                      </span>
                    </td>
                    <td style={cellStyle}>
                      <ActionIconButton onClick={() => onEdit(item)} title="Редактировать" scale={1.05} rotate={0}>
                        <Pencil size={14} />
                      </ActionIconButton>
                    </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {assets.length === 0 ? (
            <div style={{ padding: '22px 10px 18px' }}>
              <EmptyState>В основной таблице по текущим фильтрам записей не найдено.</EmptyState>
            </div>
          ) : null}
          {hiddenRegistryAssetsCount > 0 || showAllActiveAssets ? (
            <div style={{ padding: '12px 10px 14px', display: 'flex', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn"
                onClick={() => setShowAllActiveAssets((prev) => !prev)}
              >
                {showAllActiveAssets ? 'Показать первые 10' : `Раскрыть еще ${hiddenRegistryAssetsCount}`}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {writtenOffAssets.length > 0 || assets.length > 0 ? (
        <div className="glass-panel" style={{ padding: '10px 10px 4px', overflow: 'hidden' }}>
          <div style={{ ...sectionTitleStyle, display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
            <strong>Списанное</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>{writtenOffAssets.length} шт.</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '980px' }}>
              <thead>
                <tr>
                  <th style={headerCellStyle}>Инв. №</th>
                  <th style={headerCellStyle}>Наименование</th>
                  <th style={{ ...headerCellStyle, width: '100px' }}>Кол-во</th>
                  <th style={{ ...headerCellStyle, width: '140px' }}>Стоимость</th>
                  <th style={{ ...headerCellStyle, width: '180px' }}>Расположение</th>
                  <th style={{ ...headerCellStyle, width: '120px' }}>Акт</th>
                  <th style={{ ...headerCellStyle, width: '140px' }}>Дата списания</th>
                  <th style={{ ...headerCellStyle, width: '140px' }}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {writtenOffAssets.map((item) => (
                  <tr key={item.id}>
                    <td style={cellStyle}><div style={{ fontWeight: 600 }}>{item.inventory_number}</div></td>
                    <td style={cellStyle}>
                      <div style={{ display: 'grid', gap: '6px' }}>
                        <strong style={{ fontSize: '0.96rem' }}>{item.name}</strong>
                        {item.note ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            Примечание: {item.note}
                          </span>
                        ) : null}
                        {item.writeoff_note ? (
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                            Списание: {item.writeoff_note}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td style={cellStyle}>{item.quantity || '—'}</td>
                    <td style={cellStyle}>{item.amount || '—'}</td>
                    <td style={cellStyle}>{item.location_name || item.location_text || '—'}</td>
                    <td style={cellStyle}>{item.akt_number}</td>
                    <td style={cellStyle}>{formatDateTime(item.writeoff_date)}</td>
                    <td style={cellStyle}><span style={statusBadgeStyle('written_off')}>Списано</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {writtenOffAssets.length === 0 ? (
            <div style={{ padding: '22px 10px 18px' }}>
              <EmptyState>
                Полностью списанных позиций пока нет.
              </EmptyState>
            </div>
          ) : null}
        </div>
      ) : null}

    </motion.div>
  )
}

export default memo(AccountableAssetsPageComponent)
