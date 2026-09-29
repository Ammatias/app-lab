import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, FileArchive, RotateCcw, Search, X } from 'lucide-react'
import {
  completeAccountableWriteoffHistoryEntry,
  fetchAccountableWriteoffHistory,
  restoreAccountableWriteoffHistoryEntry
} from '../../../entities/accountable-assets/api'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'

function matchesAsset(asset, query) {
  const normalized = String(query || '').trim().toLowerCase()
  if (!normalized) return true

  return [
    asset.inventory_number,
    asset.name,
    asset.quantity,
    asset.amount,
    asset.location_name,
    asset.location_text,
    ...(Array.isArray(asset.locations) ? asset.locations.map((location) => location.location_name || location.locationName || '') : [])
  ].some((value) => String(value || '').toLowerCase().includes(normalized))
}

function renderLocationLabel(asset) {
  const locations = Array.isArray(asset.locations)
    ? asset.locations
      .map((location) => String(location.location_name || location.locationName || '').trim())
      .filter(Boolean)
    : []
  if (locations.length > 1) return locations.join(' · ')

  const canonical = String(asset.location_name || '').trim()
  const raw = String(asset.location_text || '').trim()

  if (!canonical && !raw) return '—'
  if (!canonical || canonical === raw) return canonical || raw
  return `${canonical} (импорт: ${raw})`
}

function formatDate(value) {
  if (!value) return '—'

  try {
    return new Date(value).toLocaleDateString('ru-RU')
  } catch {
    return String(value)
  }
}

export function AccountableWriteoffModal({
  open,
  onClose,
  assets = [],
  onGenerate,
  generating,
  onChanged = null,
  pageMode = false,
  onBack = null
}) {
  const [query, setQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [showHistory, setShowHistory] = useState(pageMode)
  const [historyItems, setHistoryItems] = useState([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [restoringHistoryIds, setRestoringHistoryIds] = useState([])
  const [completingHistoryIds, setCompletingHistoryIds] = useState([])
  const isActive = pageMode || open

  useEffect(() => {
    if (!isActive) {
      setQuery('')
      setSelectedIds([])
      setShowHistory(pageMode)
    }
  }, [isActive, pageMode])

  useEffect(() => {
    setSelectedIds((prev) => prev.filter((id) => assets.some((asset) => asset.id === id)))
  }, [assets])

  useEffect(() => {
    if (!isActive || !showHistory) return

    loadHistory()
  }, [isActive, showHistory])

  const filteredAssets = useMemo(
    () => assets.filter((asset) => matchesAsset(asset, query)),
    [assets, query]
  )

  const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const allVisibleSelected = filteredAssets.length > 0 && filteredAssets.every((asset) => selectedIdSet.has(asset.id))

  const toggleAsset = (assetId) => {
    setSelectedIds((prev) => (
      prev.includes(assetId)
        ? prev.filter((item) => item !== assetId)
        : [...prev, assetId]
    ))
  }

  const toggleAllVisible = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev)

      if (allVisibleSelected) {
        filteredAssets.forEach((asset) => next.delete(asset.id))
      } else {
        filteredAssets.forEach((asset) => next.add(asset.id))
      }

      return Array.from(next)
    })
  }

  const handleGenerate = async () => {
    if (selectedIds.length === 0 || generating) return

    try {
      await onGenerate(selectedIds)
      if (!pageMode) {
        onClose()
      }
    } catch {
      // Parent handler shows the error to the user.
    }
  }

  const loadHistory = async () => {
    setLoadingHistory(true)
    try {
      const data = await fetchAccountableWriteoffHistory()
      setHistoryItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось загрузить историю списаний')
    } finally {
      setLoadingHistory(false)
    }
  }

  const restoringHistoryIdSet = useMemo(() => new Set(restoringHistoryIds), [restoringHistoryIds])
  const completingHistoryIdSet = useMemo(() => new Set(completingHistoryIds), [completingHistoryIds])

  const handleRestoreHistoryEntry = async (item) => {
    const confirmed = window.confirm(
      `Вернуть позицию из акта №${item.akt_number} в обычное состояние?\n\nНомер акта снова станет свободным.`
    )
    if (!confirmed) return

    setRestoringHistoryIds((prev) => [...prev, item.id])

    try {
      await restoreAccountableWriteoffHistoryEntry(item.id)
      setHistoryItems((prev) => prev.filter((entry) => entry.id !== item.id))
      if (typeof onChanged === 'function') {
        onChanged()
      }
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось вернуть позицию из истории списаний')
    } finally {
      setRestoringHistoryIds((prev) => prev.filter((entryId) => entryId !== item.id))
    }
  }

  const handleCompleteHistoryEntry = async (item) => {
    const confirmed = window.confirm(
      `Списать полностью позицию из акта №${item.akt_number}?\n\nОна уйдет из основного реестра в таблицу "Списанное".`
    )
    if (!confirmed) return

    setCompletingHistoryIds((prev) => [...prev, item.id])

    try {
      await completeAccountableWriteoffHistoryEntry(item.id)
      setHistoryItems((prev) => prev.filter((entry) => entry.id !== item.id))
      if (typeof onChanged === 'function') {
        onChanged()
      }
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось полностью списать позицию')
    } finally {
      setCompletingHistoryIds((prev) => prev.filter((entryId) => entryId !== item.id))
    }
  }

  const historySection = showHistory ? (
    <section className="glass-panel" style={{ padding: '18px 20px', display: 'grid', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style={{ fontSize: '1.02rem' }}>История списаний</strong>
        <button type="button" className="btn" onClick={() => setShowHistory(false)}>
          <X size={16} /> Скрыть
        </button>
      </div>

      {loadingHistory ? (
        <LoadingState />
      ) : historyItems.length === 0 ? (
        <EmptyState>История списаний пока пуста.</EmptyState>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '760px' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Акт</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Инв. №</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Наименование</th>
                <th style={{ padding: '12px 14px', textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Дата</th>
                <th style={{ padding: '12px 14px', textAlign: 'right', color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {historyItems.map((item) => (
                <tr key={item.id}>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{item.akt_number}</td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{item.inventory_number}</td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{item.name}</td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{formatDate(item.writeoff_date)}</td>
                  <td style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="btn"
                        onClick={() => handleRestoreHistoryEntry(item)}
                        disabled={restoringHistoryIdSet.has(item.id) || completingHistoryIdSet.has(item.id)}
                      >
                        <RotateCcw size={15} /> {restoringHistoryIdSet.has(item.id) ? 'Возврат...' : 'Вернуть'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => handleCompleteHistoryEntry(item)}
                        disabled={restoringHistoryIdSet.has(item.id) || completingHistoryIdSet.has(item.id)}
                      >
                        <CheckCircle2 size={15} /> {completingHistoryIdSet.has(item.id) ? 'Списание...' : 'Списать полностью'}
                      </button>
                    </div>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  ) : null

  const content = (
    <div style={{ display: 'grid', gap: '18px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontWeight: 700, fontSize: '1.05rem' }}>
              <FileArchive size={18} />
              <span>Списание по шаблонам</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', flexWrap: 'wrap' }}>
              <button type="button" className="btn" onClick={() => setShowHistory((prev) => !prev)}>
                {showHistory ? 'Скрыть историю' : 'История списаний'}
              </button>
              {!pageMode ? (
                <button type="button" className="btn" onClick={onClose}>
                  <X size={16} /> Отмена
                </button>
              ) : null}
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleGenerate}
                disabled={selectedIds.length === 0 || generating}
              >
                <FileArchive size={16} /> {generating ? 'Подготовка...' : 'Скачать ZIP'}
              </button>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '16px 18px', display: 'grid', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ position: 'relative', flex: '1 1 320px' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)'
                  }}
                />
                <input
                  className="input-glass"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Поиск по наименованию, инв. номеру, стоимости"
                  style={{ width: '100%', paddingLeft: '36px' }}
                />
              </label>

              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleAllVisible}
                  disabled={filteredAssets.length === 0}
                />
                <span>Выбрать все найденные</span>
              </label>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
              Выбрано: {selectedIds.length} из {assets.length}
            </div>

            {assets.length === 0 ? (
              <EmptyState>В основном реестре нет позиций для списания.</EmptyState>
            ) : filteredAssets.length === 0 ? (
              <EmptyState>По запросу в модалке ничего не найдено.</EmptyState>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {filteredAssets.map((asset) => (
                  <label
                    key={asset.id}
                    className="glass-panel"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'auto minmax(0, 1fr)',
                      gap: '12px',
                      padding: '12px 14px',
                      alignItems: 'start',
                      cursor: 'pointer'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIdSet.has(asset.id)}
                      onChange={() => toggleAsset(asset.id)}
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ display: 'grid', gap: '6px' }}>
                      <strong style={{ fontSize: '0.96rem' }}>{asset.name}</strong>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                        <span>Инв. №: {asset.inventory_number}</span>
                        <span>Кол-во: {asset.quantity || '1'}</span>
                        <span>Стоимость: {asset.amount || '—'}</span>
                        <span>Расположение: {renderLocationLabel(asset)}</span>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          {historySection}
        </div>
  )

  if (pageMode) {
    return (
      <UtilityPageShell
        eyebrow="Подотчет"
        title="Списание по шаблонам"
        description="Выбор позиций для генерации архива документов и встроенная история тестовых актов списания."
        onBack={onBack}
        maxWidth="980px"
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
      panelClassName="glass-panel modal-panel"
      panelStyle={{
        width: 'min(980px, calc(100vw - 32px))',
        maxHeight: 'calc(100vh - 48px)',
        overflow: 'auto',
        padding: '24px'
      }}
    >
      {content}
    </ModalShell>
  )
}
