import { useEffect, useMemo, useState } from 'react'
import {
  BellRing,
  CheckCheck,
  History,
  Info,
  RefreshCw,
  Save,
  Settings2,
  ShieldAlert,
  TriangleAlert,
  Volume2,
  VolumeX,
  X
} from 'lucide-react'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'
import { DEFAULT_NOTIFICATION_PREFERENCES } from '../../../entities/notifications/api'
import { playNotificationSound } from '../lib/playNotificationSound'

const SOUND_OPTIONS = [
  { value: 'aurora', label: 'Мягкий' },
  { value: 'pulse', label: 'Пульс' },
  { value: 'glide', label: 'Легкий' }
]

const PRIORITY_OPTIONS = [
  { value: 'info', label: 'Спокойно' },
  { value: 'warning', label: 'Важно' },
  { value: 'critical', label: 'Срочно' }
]

const CHANNEL_OPTIONS = [
  { value: 'center', label: 'Центр', hint: 'Показывать в центре уведомлений.' },
  { value: 'toast', label: 'Всплывашка', hint: 'Показывать поверх интерфейса.' },
  { value: 'vk_teams', label: 'VK Teams', hint: 'Дублировать событие адресно по логину администратора.' }
]

const SNOOZE_OPTIONS = [
  { days: 1, label: '1 день' },
  { days: 3, label: '3 дня' },
  { days: 7, label: 'Неделя' },
  { days: 30, label: 'Месяц' }
]

function priorityMeta(priority) {
  if (priority === 'critical') {
    return {
      icon: ShieldAlert,
      label: 'Критично',
      color: '#fda4af',
      background: 'rgba(248, 113, 113, 0.12)',
      border: 'rgba(248, 113, 113, 0.22)'
    }
  }

  if (priority === 'warning') {
    return {
      icon: TriangleAlert,
      label: 'Внимание',
      color: '#fde047',
      background: 'rgba(250, 204, 21, 0.12)',
      border: 'rgba(250, 204, 21, 0.22)'
    }
  }

  return {
    icon: Info,
    label: 'Инфо',
    color: '#93c5fd',
    background: 'rgba(96, 165, 250, 0.12)',
    border: 'rgba(96, 165, 250, 0.22)'
  }
}

function formatTimestamp(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function inventoryLabel(item) {
  return item.title.replace(/^Проверьте остаток:\s*/i, '').trim() || item.title
}

function buildNotificationCards(items) {
  const cards = []
  const inventoryGroups = new Map()

  items.forEach((item) => {
    if (item.event_kind === 'inventory_stock') {
      const key = `${item.event_kind}:${item.priority}:${item.channels}:${item.is_read ? 'read' : 'unread'}`
      if (!inventoryGroups.has(key)) {
        inventoryGroups.set(key, [])
      }
      inventoryGroups.get(key).push(item)
      return
    }

    cards.push({
      ...item,
      notification_ids: [item.notification_id],
      display_title: item.title,
      display_message: item.message,
      is_grouped: false
    })
  })

  inventoryGroups.forEach((groupItems) => {
    if (groupItems.length === 1) {
      const item = groupItems[0]
      cards.push({
        ...item,
        notification_ids: [item.notification_id],
        display_title: item.title,
        display_message: item.message,
        is_grouped: false
      })
      return
    }

    const names = groupItems.map(inventoryLabel)
    const head = names.slice(0, 4).join(', ')
    const rest = names.length > 4 ? ` и еще ${names.length - 4}` : ''
    const representative = groupItems[0]
    const isCritical = representative.priority === 'critical'

    cards.push({
      ...representative,
      notification_id: representative.notification_id,
      notification_ids: groupItems.map((item) => item.notification_id),
      display_title: isCritical
        ? `Срочно пополнить картриджи: ${groupItems.length} позиций`
        : `Под риском остатки картриджей: ${groupItems.length} позиций`,
      display_message: `${head}${rest}. Откройте отчеты по картриджам, чтобы проверить остатки и прогноз.`,
      action_tab: 'cartridges',
      action_search_query: '',
      is_grouped: true
    })
  })

  return cards.sort((left, right) => {
    if (left.is_read !== right.is_read) return left.is_read ? 1 : -1

    const priorityOrder = { critical: 0, warning: 1, info: 2 }
    const leftPriority = priorityOrder[left.priority] ?? 9
    const rightPriority = priorityOrder[right.priority] ?? 9
    if (leftPriority !== rightPriority) return leftPriority - rightPriority

    return new Date(right.updated_at || right.created_at).getTime() - new Date(left.updated_at || left.created_at).getTime()
  })
}

function SummaryCard({ label, value, accent }) {
  return (
    <div className="portal-notification-summary-card" style={{ borderColor: accent }}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function RuleCard({ rule, onChange, onSave, saving }) {
  const isEcp = rule.event_kind === 'ecp_expiry'
  const isInventory = rule.event_kind === 'inventory_stock'
  const isNotes = rule.event_kind === 'notes_activity'
  const isVacation = rule.event_kind === 'vacation_schedule'
  const activeChannels = new Set((rule.channels || '').split(',').map((value) => value.trim()).filter(Boolean))
  const ruleHint = isEcp
    ? 'Срок действия подписи'
    : isInventory
      ? 'Остатки картриджей'
      : isNotes
        ? 'Шаринг заметок и этапы задач'
      : 'Общие напоминания об отпусках'

  const toggleChannel = (channel, checked) => {
    const next = new Set(activeChannels)
    if (checked) {
      next.add(channel)
    } else {
      next.delete(channel)
    }

    onChange(rule.event_kind, 'channels', Array.from(next).join(','))
  }

  return (
    <div className="portal-notification-rule-card">
      <div className="portal-notification-rule-head">
        <div>
          <strong>{rule.title}</strong>
          <span>{ruleHint}</span>
        </div>
        <label className="portal-notification-toggle">
          <input
            type="checkbox"
            checked={rule.enabled}
            onChange={(event) => onChange(rule.event_kind, 'enabled', event.target.checked)}
          />
          <span>{rule.enabled ? 'Активно' : 'Выключено'}</span>
        </label>
      </div>

      <div className="portal-notification-rule-grid">
        <label className="portal-notification-field">
          <span>Насколько это важно</span>
          <select
            className="input-glass"
            value={rule.priority}
            onChange={(event) => onChange(rule.event_kind, 'priority', event.target.value)}
          >
            {PRIORITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>

        <div className="portal-notification-field portal-notification-field--wide">
          <span>Куда отправлять</span>
          <div className="portal-notification-channel-list">
            {CHANNEL_OPTIONS.map((channel) => (
              <label key={channel.value} className="portal-notification-channel-option">
                <input
                  type="checkbox"
                  checked={activeChannels.has(channel.value)}
                  onChange={(event) => toggleChannel(channel.value, event.target.checked)}
                />
                <strong>{channel.label}</strong>
                <span>{channel.hint}</span>
              </label>
            ))}
          </div>
        </div>

        {isEcp && (
          <label className="portal-notification-field portal-notification-field--wide">
            <span>За сколько дней напоминать</span>
            <input
              className="input-glass"
              value={rule.ecp_thresholds || ''}
              onChange={(event) => onChange(rule.event_kind, 'ecp_thresholds', event.target.value)}
              placeholder="30,14,7,1"
            />
          </label>
        )}

        {isInventory && (
          <>
            <label className="portal-notification-field">
              <span>Предупредить заранее, дней</span>
              <input
                className="input-glass"
                type="number"
                min="1"
                value={rule.inventory_warning_days ?? ''}
                onChange={(event) => onChange(rule.event_kind, 'inventory_warning_days', event.target.value)}
              />
            </label>
            <label className="portal-notification-field">
              <span>Считать срочным, дней</span>
              <input
                className="input-glass"
                type="number"
                min="1"
                value={rule.inventory_critical_days ?? ''}
                onChange={(event) => onChange(rule.event_kind, 'inventory_critical_days', event.target.value)}
              />
            </label>
          </>
        )}

        {isNotes && (
          <div className="portal-notification-rule-placeholder">
            Уведомления приходят, когда вам расшарили заметку или задачу, когда задача переведена в работу, выполнена, переоткрыта или когда другой человек изменил общую карточку.
          </div>
        )}

        {isVacation && (
          <div className="portal-notification-rule-placeholder">
            Это общие напоминания для команды администраторов портала. В уведомлении всегда указываются кто уходит в отпуск или выходит на работу, дата ухода и дата возвращения.
          </div>
        )}
      </div>

      <div className="portal-notification-rule-actions">
        <button className="btn btn-primary compact" disabled={saving} onClick={() => onSave(rule)}>
          <Save size={14} /> {saving ? 'Сохраняю...' : 'Сохранить правило'}
        </button>
      </div>
    </div>
  )
}

export function NotificationsModal({
  open,
  onClose,
  overview = {},
  loading,
  savingPreferences,
  savingRuleKind,
  onRefresh,
  onSavePreferences,
  onSaveRule,
  onMarkRead,
  onMarkAllRead,
  onHide,
  onOpenNotification,
  pageMode = false,
  onBack = null
}) {
  const isActive = pageMode || open
  const [prefsDraft, setPrefsDraft] = useState(DEFAULT_NOTIFICATION_PREFERENCES)
  const [rulesDraft, setRulesDraft] = useState({})
  const [prefsDirty, setPrefsDirty] = useState(false)
  const [rulesDirty, setRulesDirty] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setPrefsDirty(false)
      setRulesDirty(false)
      setShowSettings(false)
      setShowHistory(false)
      return
    }

    if (!prefsDirty) {
      setPrefsDraft(overview.preferences || DEFAULT_NOTIFICATION_PREFERENCES)
    }

    if (!rulesDirty) {
      setRulesDraft(
        Object.fromEntries((overview.rules || []).map((rule) => [rule.event_kind, { ...rule }]))
      )
    }
  }, [isActive, overview.preferences, overview.rules, prefsDirty, rulesDirty])

  const rules = useMemo(
    () => ['ecp_expiry', 'inventory_stock', 'notes_activity', 'vacation_schedule']
      .map((key) => rulesDraft[key])
      .filter(Boolean),
    [rulesDraft]
  )

  const currentNotifications = useMemo(
    () => (overview.notifications || []).filter((item) => !item.is_read),
    [overview.notifications]
  )
  const historyNotifications = overview.history || []

  const notificationCards = useMemo(() => buildNotificationCards(currentNotifications), [currentNotifications])
  const historyCards = useMemo(() => buildNotificationCards(historyNotifications), [historyNotifications])

  const updatePreference = (field, value) => {
    setPrefsDirty(true)
    setPrefsDraft((prev) => ({ ...prev, [field]: value }))
  }

  const handleRuleChange = (eventKind, field, value) => {
    setRulesDirty(true)
    setRulesDraft((prev) => ({
      ...prev,
      [eventKind]: {
        ...prev[eventKind],
        [field]: field.includes('days') ? value : value
      }
    }))
  }

  const handleSavePreferences = async () => {
    await onSavePreferences({
      ...prefsDraft,
      sound_volume: Number(prefsDraft.sound_volume || 0)
    })
    setPrefsDirty(false)
  }

  const handleSaveRule = async (rule) => {
    await onSaveRule(rule.event_kind, {
      enabled: Boolean(rule.enabled),
      channels: rule.channels || 'center',
      priority: rule.priority,
      ecp_thresholds: rule.ecp_thresholds || null,
      inventory_warning_days: rule.inventory_warning_days === '' || rule.inventory_warning_days === null ? null : Number(rule.inventory_warning_days),
      inventory_critical_days: rule.inventory_critical_days === '' || rule.inventory_critical_days === null ? null : Number(rule.inventory_critical_days)
    })
    setRulesDirty(false)
  }

  const renderNotificationCard = (item) => {
    const meta = priorityMeta(item.priority)
    const Icon = meta.icon

    return (
      <div key={`${item.event_kind}:${item.notification_ids.join('-')}`} className={`portal-notification-item ${item.is_read ? 'is-read' : 'is-unread'}`}>
        <div className="portal-notification-item-head">
          <div className="portal-notification-badge" style={{ color: meta.color, background: meta.background, borderColor: meta.border }}>
            <Icon size={14} /> {meta.label}
          </div>
          <div className="portal-notification-item-head-side">
            {item.is_grouped ? (
              <div className="portal-notification-group-pill">Группа: {item.notification_ids.length}</div>
            ) : null}
            <div className="portal-notification-item-time">{formatTimestamp(item.updated_at || item.created_at)}</div>
          </div>
        </div>

        <div className="portal-notification-item-body">
          <strong>{item.display_title}</strong>
          <p>{item.display_message}</p>
        </div>

        <div className="portal-notification-item-actions">
          <button className="btn btn-primary compact" onClick={() => onOpenNotification(item)}>
            <BellRing size={14} /> Открыть
          </button>
          {!item.is_read && (
            <button className="btn btn-secondary compact" onClick={() => onMarkRead(item)}>
              <CheckCheck size={14} /> Прочитано
            </button>
          )}
          {!item.is_read && (
            <div className="portal-notification-snooze-row">
              {SNOOZE_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  className="btn btn-secondary compact"
                  onClick={() => onHide(item, option.days)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const content = (
    <div className="glass-panel portal-profile-modal portal-notifications-modal" style={{ padding: '20px' }}>
      <div className="portal-profile-modal-header">
        <div>
          <div className="portal-profile-modal-eyebrow">Уведомления</div>
          <h2>Центр уведомлений</h2>
        </div>
        <div className="portal-notification-head-actions">
          <button
            type="button"
            className={`btn btn-secondary compact ${showHistory ? 'is-active' : ''}`}
            onClick={() => setShowHistory((prev) => !prev)}
            title="История уведомлений"
          >
            <History size={15} /> История {historyCards.length ? `(${historyCards.length})` : ''}
          </button>
          <button
            type="button"
            className={`btn btn-secondary compact ${showSettings ? 'is-active' : ''}`}
            onClick={() => setShowSettings((prev) => !prev)}
            title="Настройки уведомлений"
          >
            <Settings2 size={15} />
          </button>
          {!pageMode ? (
            <button type="button" className="btn portal-profile-modal-close" onClick={onClose} title="Закрыть">
              <X size={16} />
            </button>
          ) : null}
        </div>
      </div>

      <div className="portal-notification-summary-grid">
        <SummaryCard label="Непрочитанные" value={overview.unread_count || 0} accent="rgba(140, 199, 255, 0.22)" />
        <SummaryCard label="Критичные" value={overview.summary?.active_critical || 0} accent="rgba(248, 113, 113, 0.22)" />
        <SummaryCard label="Предупреждения" value={overview.summary?.active_warning || 0} accent="rgba(250, 204, 21, 0.22)" />
      </div>

      <div className="portal-notifications-modal-body">
        <section className="portal-profile-modal-section">
          <div className="portal-notification-section-head">
            <div>
              <div className="portal-profile-modal-section-title">Текущие уведомления</div>
              <div className="portal-notification-section-subtitle">Сразу видны новые и непрочитанные события. После отметки они уходят в историю.</div>
            </div>
            <div className="portal-notification-toolbar">
              <button className="btn btn-secondary compact" onClick={onRefresh} disabled={loading}>
                <RefreshCw size={14} /> {loading ? 'Обновляю...' : 'Обновить'}
              </button>
              <button className="btn btn-secondary compact" onClick={onMarkAllRead} disabled={!currentNotifications.length}>
                <CheckCheck size={14} /> Прочитать все
              </button>
            </div>
          </div>
        </section>

        <section className="portal-profile-modal-section">
          <div className="portal-notification-section-head">
            <div>
              <div className="portal-profile-modal-section-title">Уведомления</div>
              <div className="portal-notification-section-subtitle">Все новые уведомления сразу появляются здесь, во всплывающем окне и потом остаются в истории.</div>
            </div>
          </div>

          <div className="portal-notification-list">
            {notificationCards.length === 0 ? (
              <div className="portal-notification-empty">Новых всплывающих уведомлений сейчас нет.</div>
            ) : notificationCards.map(renderNotificationCard)}
          </div>
        </section>

        {showHistory && (
          <section className="portal-profile-modal-section">
            <div className="portal-notification-section-head">
              <div>
                <div className="portal-profile-modal-section-title">История</div>
                <div className="portal-notification-section-subtitle">Прочитанные уведомления. История очищается автоматически спустя 90 дней.</div>
              </div>
              <button className="btn btn-secondary compact" onClick={() => setShowHistory(false)}>
                Скрыть
              </button>
            </div>

            <div className="portal-notification-list">
              {historyCards.length === 0 ? (
                <div className="portal-notification-empty">История пока пустая.</div>
              ) : historyCards.map(renderNotificationCard)}
            </div>
          </section>
        )}

        {showSettings && (
          <>
            <section className="portal-profile-modal-section">
              <div className="portal-notification-section-head">
                <div>
                  <div className="portal-profile-modal-section-title">Настройки</div>
                  <div className="portal-notification-section-subtitle">Что и как показывать именно вам.</div>
                </div>
                <button className="btn btn-primary compact" onClick={handleSavePreferences} disabled={savingPreferences}>
                  <Save size={14} /> {savingPreferences ? 'Сохраняю...' : 'Сохранить настройки'}
                </button>
              </div>

              <div className="portal-notification-preferences-grid">
                <label className="portal-notification-toggle-card">
                  <input
                    type="checkbox"
                    checked={Boolean(prefsDraft.toast_enabled)}
                    onChange={(event) => updatePreference('toast_enabled', event.target.checked)}
                  />
                  <strong>Всплывающие уведомления</strong>
                  <span>Показывать всплывающие поверх интерфейса.</span>
                </label>

                <label className="portal-notification-toggle-card">
                  <input
                    type="checkbox"
                    checked={Boolean(prefsDraft.sound_enabled)}
                    onChange={(event) => updatePreference('sound_enabled', event.target.checked)}
                  />
                  <strong>Звук уведомлений</strong>
                  <span>Короткий современный звук при новом важном событии.</span>
                </label>

                <label className="portal-notification-toggle-card">
                  <input
                    type="checkbox"
                    checked={Boolean(prefsDraft.ecp_enabled)}
                    onChange={(event) => updatePreference('ecp_enabled', event.target.checked)}
                  />
                  <strong>ЭЦП</strong>
                  <span>Получать напоминания по срокам окончания подписи.</span>
                </label>

                <label className="portal-notification-toggle-card">
                  <input
                    type="checkbox"
                    checked={Boolean(prefsDraft.inventory_enabled)}
                    onChange={(event) => updatePreference('inventory_enabled', event.target.checked)}
                  />
                  <strong>Картриджи</strong>
                  <span>Получать сигналы о риске нехватки и критическом остатке.</span>
                </label>

                <label className="portal-notification-toggle-card">
                  <input
                    type="checkbox"
                    checked={Boolean(prefsDraft.notes_enabled)}
                    onChange={(event) => updatePreference('notes_enabled', event.target.checked)}
                  />
                  <strong>Заметки и задачи</strong>
                  <span>Общие заметки, обновления общих карточек и смена статусов задач.</span>
                </label>

                <label className="portal-notification-toggle-card">
                  <input
                    type="checkbox"
                    checked={Boolean(prefsDraft.digest_enabled)}
                    onChange={(event) => updatePreference('digest_enabled', event.target.checked)}
                  />
                  <strong>Тихая сводка</strong>
                  <span>Собирать спокойные напоминания в одну общую подборку.</span>
                </label>

                <label className="portal-notification-toggle-card">
                  <input
                    type="checkbox"
                    checked={Boolean(prefsDraft.vacation_enabled)}
                    onChange={(event) => updatePreference('vacation_enabled', event.target.checked)}
                  />
                  <strong>Отпуска</strong>
                  <span>Показывать общие напоминания по отпускам администраторов портала.</span>
                </label>
              </div>

              <div className="portal-notification-settings-row">
                <label className="portal-notification-field">
                  <span>Звук</span>
                  <select
                    className="input-glass"
                    value={prefsDraft.toast_sound || 'aurora'}
                    onChange={(event) => updatePreference('toast_sound', event.target.value)}
                  >
                    {SOUND_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>

                <label className="portal-notification-field">
                  <span>Громкость</span>
                  <input
                    className="input-glass"
                    type="range"
                    min="0"
                    max="100"
                    value={prefsDraft.sound_volume ?? 72}
                    onChange={(event) => updatePreference('sound_volume', Number(event.target.value))}
                  />
                </label>

                <button
                  className="btn btn-secondary compact"
                  onClick={() => playNotificationSound({
                    preset: prefsDraft.toast_sound,
                    volume: prefsDraft.sound_volume
                  })}
                >
                  {prefsDraft.sound_enabled ? <Volume2 size={14} /> : <VolumeX size={14} />} Прослушать
                </button>
              </div>
            </section>
            <section className="portal-profile-modal-section">
              <div className="portal-notification-section-head">
                <div>
                  <div className="portal-profile-modal-section-title">Правила срабатывания</div>
                  <div className="portal-notification-section-subtitle">Когда напоминать и насколько настойчиво это делать.</div>
                </div>
              </div>

              <div className="portal-notification-rules-stack">
                {rules.map((rule) => (
                  <RuleCard
                    key={rule.event_kind}
                    rule={rule}
                    onChange={handleRuleChange}
                    onSave={handleSaveRule}
                    saving={savingRuleKind === rule.event_kind}
                  />
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )

  if (pageMode) {
    return (
      <UtilityPageShell
        eyebrow="Уведомления"
        title="Центр уведомлений"
        description="Текущие события, история, персональные настройки и правила срабатывания в одном месте."
        onBack={onBack}
        maxWidth="1040px"
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
        background: 'rgba(0,0,0,0.72)',
        backdropFilter: 'blur(10px)',
        zIndex: 320,
        padding: '28px 24px 36px',
        alignItems: 'flex-start',
        overflowY: 'auto'
      }}
      panelClassName="glass-panel modal-panel portal-profile-modal portal-notifications-modal"
      panelStyle={{
        width: 'min(1040px, calc(100vw - 24px))',
        margin: '0 auto',
        padding: 0
      }}
    >
      {content}
    </ModalShell>
  )
}
