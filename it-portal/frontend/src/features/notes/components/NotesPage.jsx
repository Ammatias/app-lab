import { memo, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertTriangle,
  Bell,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Flag,
  Grip,
  Lock,
  Share2,
  StickyNote,
  Trash2,
  Unlock,
  UserRound
} from 'lucide-react'
import { motion } from 'framer-motion'
import { containerVariants } from '../../../shared/lib/motion'
import { matchSearchValues } from '../../../shared/lib/search'
import { getPortalAccountDisplayName, isHiddenPortalAccount } from '../../../shared/lib/portalAccounts'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { ModalShell } from '../../../shared/ui/ModalShell'
import {
  buildNoteUpdatePayload,
  clampCanvasX,
  clampCanvasY,
  getAutoScrollDelta,
  getNextNoteZIndex,
  isNoteInsideZone,
  NOTE_CARD_HEIGHT,
  NOTE_CARD_WIDTH,
  snapNotePosition
} from '../lib/board'

const NOTE_COLORS = [
  { value: 'sun', label: 'Солнце' },
  { value: 'mint', label: 'Мята' },
  { value: 'sky', label: 'Небо' },
  { value: 'lavender', label: 'Лаванда' },
  { value: 'rose', label: 'Роза' },
  { value: 'slate', label: 'Графит' }
]

const TASK_PRIORITIES = [
  { value: 'low', label: 'Низкий', icon: Flag },
  { value: 'normal', label: 'Обычный', icon: Flag },
  { value: 'high', label: 'Высокий', icon: AlertTriangle },
  { value: 'urgent', label: 'Срочно', icon: AlertTriangle }
]

const REMINDER_INTERVAL_OPTIONS = [
  { value: 15, label: '15 минут' },
  { value: 30, label: '30 минут' },
  { value: 60, label: '1 час' },
  { value: 180, label: '3 часа' },
  { value: 1440, label: '1 день' }
]

const EMPTY_NOTE_DRAFT = {
  title: '',
  content: '',
  color: 'slate',
  kind: 'note',
  status: 'open',
  taskPriority: 'normal',
  dueAt: '',
  reminderEnabled: false,
  reminderDate: '',
  reminderTime: '',
  reminderRepeatCount: 1,
  reminderRepeatIntervalMinutes: 60,
  dueNotificationEnabled: true,
  assignedUsernames: [],
  sharedUsernames: [],
  notifyOnChanges: false,
  pos_x: 0,
  pos_y: 0,
  z_index: 1,
  is_locked: false
}

const createEmptyDraft = (assigneeOptions = []) => {
  const defaultAssignee = assigneeOptions[0]?.username

  return {
    ...EMPTY_NOTE_DRAFT,
    assignedUsernames: defaultAssignee ? [defaultAssignee] : []
  }
}

const padDatePart = (value) => String(value).padStart(2, '0')

const toDateTimeLocalInput = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return [
    date.getFullYear(),
    padDatePart(date.getMonth() + 1),
    padDatePart(date.getDate())
  ].join('-') + `T${padDatePart(date.getHours())}:${padDatePart(date.getMinutes())}`
}

const fromDateTimeLocalInput = (value) => {
  if (!value) return null

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null

  return date.toISOString()
}

const toDateInput = (value) => {
  const localValue = toDateTimeLocalInput(value)
  return localValue ? localValue.slice(0, 10) : ''
}

const toTimeInput = (value) => {
  const localValue = toDateTimeLocalInput(value)
  return localValue ? localValue.slice(11, 16) : ''
}

const fromDateAndTimeInputs = (dateValue, timeValue) => {
  if (!dateValue || !timeValue) return null
  return fromDateTimeLocalInput(`${dateValue}T${timeValue}`)
}

const createDraftFromNote = (note) => ({
  title: note?.title || '',
  content: note?.content || '',
  color: note?.color || 'slate',
  kind: note?.kind || 'note',
  status: note?.status || 'open',
  taskPriority: note?.task_priority || 'normal',
  dueAt: toDateTimeLocalInput(note?.due_at),
  reminderEnabled: Boolean(note?.reminder_enabled),
  reminderDate: toDateInput(note?.reminder_at),
  reminderTime: toTimeInput(note?.reminder_at),
  reminderRepeatCount: note?.reminder_repeat_count || 1,
  reminderRepeatIntervalMinutes: note?.reminder_repeat_interval_minutes || 60,
  dueNotificationEnabled: note?.due_notification_enabled !== false,
  assignedUsernames: (note?.assignees || []).map((assignee) => assignee.username),
  sharedUsernames: (note?.shares || []).map((share) => share.username),
  notifyOnChanges: Boolean(note?.notify_on_changes),
  pos_x: note?.pos_x || 0,
  pos_y: note?.pos_y || 0,
  z_index: note?.z_index || 1,
  is_locked: note?.is_locked || false
})

const formatUpdatedAt = (value) => {
  if (!value) return 'без даты'

  try {
    return new Date(value).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch {
    return 'без даты'
  }
}

const getStatusMeta = (status) => {
  if (status === 'done') {
    return { label: 'Готово', icon: CheckCircle2 }
  }

  if (status === 'in_progress') {
    return { label: 'В работе', icon: Clock3 }
  }

  return { label: 'Без статуса', icon: StickyNote }
}

const getPriorityMeta = (priority) => (
  TASK_PRIORITIES.find((item) => item.value === priority) || TASK_PRIORITIES[1]
)

const formatTaskDateTime = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const isSameLocalDate = (left, right) => (
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate()
)

const getTaskScheduleMeta = (note, now = new Date()) => {
  if (note.kind !== 'task' || !note.due_at) {
    return { hasDueDate: false, isOverdue: false, isDueToday: false, isUpcoming: false }
  }

  const dueDate = new Date(note.due_at)
  if (Number.isNaN(dueDate.getTime())) {
    return { hasDueDate: false, isOverdue: false, isDueToday: false, isUpcoming: false }
  }

  const isDone = note.status === 'done'
  return {
    hasDueDate: true,
    isOverdue: !isDone && dueDate.getTime() < now.getTime(),
    isDueToday: !isDone && isSameLocalDate(dueDate, now),
    isUpcoming: !isDone && dueDate.getTime() >= now.getTime()
  }
}

const parseTaskParagraphs = (content) => (
  (content || '')
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => {
      const matched = paragraph.match(/^\[(x| )\]\s*(.*)$/i)
      if (!matched) {
        return { checked: false, text: paragraph }
      }

      return {
        checked: matched[1].toLowerCase() === 'x',
        text: matched[2].trim()
      }
    })
)

const serializeTaskParagraphs = (items) => (
  items
    .filter((item) => item.text.trim())
    .map((item) => `[${item.checked ? 'x' : ' '}] ${item.text.trim()}`)
    .join('\n')
)

const getAvatarLabel = (value) => {
  const source = (value || '').trim()
  if (!source) return '?'

  const parts = source.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

const SimpleMarkdown = ({ children }) => {
  if (!children) return null

  const lines = children.split('\n')
  const nodes = []
  let listItems = []

  const flushList = (keyPrefix) => {
    if (!listItems.length) return

    nodes.push(
      <ul key={`${keyPrefix}-list`}>
        {listItems.map((item, index) => (
          <li key={`${keyPrefix}-${index}`}>{item}</li>
        ))}
      </ul>
    )
    listItems = []
  }

  lines.forEach((line, index) => {
    if (line.startsWith('- ') || line.startsWith('* ')) {
      listItems.push(line.substring(2))
      return
    }

    flushList(`line-${index}`)

    if (line.startsWith('### ')) {
      nodes.push(<h3 key={index}>{line.replace('### ', '')}</h3>)
      return
    }

    if (line.startsWith('## ')) {
      nodes.push(<h2 key={index}>{line.replace('## ', '')}</h2>)
      return
    }

    if (line.startsWith('# ')) {
      nodes.push(<h1 key={index}>{line.replace('# ', '')}</h1>)
      return
    }

    const escaped = line.replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const styled = escaped
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/_(.*?)_/g, '<em>$1</em>')

    nodes.push(
      <p
        key={index}
        style={{ margin: '4px 0' }}
        dangerouslySetInnerHTML={{ __html: styled || '&nbsp;' }}
      />
    )
  })

  flushList('final')

  return <div className="notes-markdown-rendered">{nodes}</div>
}

const BoardZone = memo(({ zone, onUpdate, onDelete }) => {
  const [localSize, setLocalSize] = useState({ width: zone.width, height: zone.height })
  const resizeCleanupRef = useRef(null)

  useEffect(() => {
    setLocalSize({ width: zone.width, height: zone.height })
  }, [zone.width, zone.height])

  useEffect(() => () => {
    resizeCleanupRef.current?.()
  }, [])

  const handleDragEnd = (_, info) => {
    const nextX = clampCanvasX(zone.pos_x + info.offset.x)
    const nextY = clampCanvasY(zone.pos_y + info.offset.y)

    if (nextX !== zone.pos_x || nextY !== zone.pos_y) {
      onUpdate(zone.id, { pos_x: nextX, pos_y: nextY })
    }
  }

  const handleResizeStart = (event) => {
    event.preventDefault()
    event.stopPropagation()

    const startX = event.clientX
    const startY = event.clientY
    const startWidth = localSize.width
    const startHeight = localSize.height

    const cleanup = () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
      resizeCleanupRef.current = null
    }

    const handleMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX
      const deltaY = moveEvent.clientY - startY

      setLocalSize({
        width: Math.max(180, startWidth + deltaX),
        height: Math.max(120, startHeight + deltaY)
      })
    }

    const handleUp = (upEvent) => {
      const deltaX = upEvent.clientX - startX
      const deltaY = upEvent.clientY - startY

      cleanup()
      onUpdate(zone.id, {
        width: Math.max(180, startWidth + deltaX),
        height: Math.max(120, startHeight + deltaY)
      })
    }

    resizeCleanupRef.current?.()
    resizeCleanupRef.current = cleanup

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }

  return (
    <motion.div
      layout
      drag
      dragMomentum={false}
      initial={false}
      onDragEnd={handleDragEnd}
      animate={{
        x: zone.pos_x,
        y: zone.pos_y,
        width: localSize.width,
        height: localSize.height
      }}
      transition={{ type: 'spring', stiffness: 150, damping: 25 }}
      whileDrag={{ scale: 1.005, zIndex: 500 }}
      className={`notes-board-zone is-${zone.color}`}
      style={{ position: 'absolute' }}
    >
      <div className="notes-board-zone-label">
        <span>{zone.title}</span>
        <button
          className="notes-board-zone-delete"
          onClick={(event) => {
            event.stopPropagation()
            onDelete(zone)
          }}
          title="Удалить зону"
        >
          <Trash2 size={14} />
        </button>
      </div>

      <div className="notes-board-zone-resizer" onMouseDown={handleResizeStart} />
    </motion.div>
  )
})

function NotesEditorModal({
  open,
  mode,
  draft,
  shareOptions = [],
  assigneeOptions = [],
  canManageShares,
  canDelete,
  saving,
  deleting,
  onDraftChange,
  onToggleShare,
  onToggleAssignee,
  onClose,
  onSubmit,
  onDelete
}) {
  const hasShares = draft.sharedUsernames.length > 0

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)', zIndex: 2000 }}
      panelClassName={`glass-panel modal-panel notes-editor-modal is-${draft.color} ${draft.kind === 'task' ? 'is-task' : 'is-note'}`}
      panelStyle={{ width: draft.kind === 'task' ? 'min(1180px, calc(100vw - 32px))' : 'min(860px, calc(100vw - 32px))', zIndex: 2001 }}
    >
      <form className={`notes-editor-layout ${draft.kind === 'task' ? 'is-task' : 'is-note'}`} onSubmit={onSubmit}>
        <div className="notes-editor-header">
          <div>
            <div className="notes-editor-eyebrow">{mode === 'create' ? 'Новая заметка' : 'Редактирование'}</div>
            <h2>{draft.kind === 'task' ? 'Задача' : 'Заметка'}</h2>
          </div>
          <button type="button" className="btn" onClick={onClose}>Закрыть</button>
        </div>

        <div className="notes-editor-grid">
          <label className="notes-field notes-field--wide notes-field--title">
            <span>Заголовок</span>
            <input
              className="input-glass"
              value={draft.title}
              onChange={(event) => onDraftChange('title', event.target.value)}
              placeholder="Например: Проверить доступ"
            />
          </label>

          <label className="notes-field notes-field--type">
            <span>Тип</span>
            <select className="input-glass" value={draft.kind} onChange={(event) => onDraftChange('kind', event.target.value)}>
              <option value="note">Заметка</option>
              <option value="task">Задача</option>
            </select>
          </label>

          <label className="notes-field notes-field--status">
            <span>Статус</span>
            <select className="input-glass" value={draft.status} onChange={(event) => onDraftChange('status', event.target.value)}>
              <option value="open">Без статуса</option>
              <option value="in_progress">В работе</option>
              <option value="done">Готово</option>
            </select>
          </label>

          {draft.kind === 'task' ? (
            <>
              <label className="notes-field notes-field--priority">
                <span>Приоритет</span>
                <select
                  className="input-glass"
                  value={draft.taskPriority}
                  onChange={(event) => onDraftChange('taskPriority', event.target.value)}
                >
                  {TASK_PRIORITIES.map((priority) => (
                    <option key={priority.value} value={priority.value}>{priority.label}</option>
                  ))}
                </select>
              </label>

              <label className="notes-field notes-field--due">
                <span>Срок</span>
                <input
                  type="datetime-local"
                  className="input-glass"
                  value={draft.dueAt}
                  onChange={(event) => onDraftChange('dueAt', event.target.value)}
                />
              </label>

              <label className="notes-share-notify notes-field--reminder-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(draft.reminderEnabled)}
                  onChange={(event) => onDraftChange('reminderEnabled', event.target.checked)}
                />
                <span>Напомнить</span>
              </label>

              <label className="notes-field notes-field--reminder-date">
                <span>Дата напоминания</span>
                <input
                  type="date"
                  className="input-glass"
                  value={draft.reminderDate}
                  onChange={(event) => onDraftChange('reminderDate', event.target.value)}
                  disabled={!draft.reminderEnabled}
                />
              </label>

              <label className="notes-field notes-field--reminder-time">
                <span>Время напоминания</span>
                <input
                  type="time"
                  className="input-glass"
                  value={draft.reminderTime}
                  onChange={(event) => onDraftChange('reminderTime', event.target.value)}
                  disabled={!draft.reminderEnabled}
                />
              </label>

              <div className="notes-field notes-field--wide notes-field--notification-settings">
                <span>Настройки уведомлений</span>
                <div className="notes-notification-settings">
                  <label className="notes-field">
                    <span>Сколько раз</span>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="input-glass"
                      value={draft.reminderRepeatCount}
                      onChange={(event) => onDraftChange('reminderRepeatCount', event.target.value)}
                      disabled={!draft.reminderEnabled}
                    />
                  </label>

                  <label className="notes-field">
                    <span>Повторять каждые</span>
                    <select
                      className="input-glass"
                      value={draft.reminderRepeatIntervalMinutes}
                      onChange={(event) => onDraftChange('reminderRepeatIntervalMinutes', event.target.value)}
                      disabled={!draft.reminderEnabled}
                    >
                      {REMINDER_INTERVAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="notes-share-notify">
                    <input
                      type="checkbox"
                      checked={Boolean(draft.dueNotificationEnabled)}
                      onChange={(event) => onDraftChange('dueNotificationEnabled', event.target.checked)}
                    />
                    <span>Уведомить при наступлении срока</span>
                  </label>
                </div>
              </div>

              {assigneeOptions.length > 0 ? (
                <div className="notes-field notes-field--wide notes-field--assignees">
                  <span>Исполнители</span>
                  <div className="notes-share-grid">
                    {assigneeOptions.map((option) => (
                      <label key={option.username} className="notes-share-option">
                        <input
                          type="checkbox"
                          checked={draft.assignedUsernames.includes(option.username)}
                          onChange={() => onToggleAssignee(option.username)}
                          disabled={!canManageShares}
                        />
                        <div>
                          <strong>{option.name}</strong>
                          <span>{option.username}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <small className="notes-field-hint">
                    Можно назначить задачу себе, нескольким администраторам или всей рабочей группе.
                  </small>
                </div>
              ) : null}
            </>
          ) : null}

          <label className="notes-field notes-field--wide notes-field--text">
            <span>Текст</span>
            <textarea
              className="input-glass notes-textarea"
              value={draft.content}
              onChange={(event) => onDraftChange('content', event.target.value)}
              placeholder="Коротко запишите, что важно не забыть."
            />
            {draft.kind === 'task' ? (
              <small className="notes-field-hint">
                Каждый непустой абзац станет отдельным пунктом задачи. Состояние галочки хранится внутри текста заметки.
              </small>
            ) : null}
          </label>

          {draft.kind !== 'task' && shareOptions.length > 0 ? (
            <div className="notes-field notes-field--wide notes-field--shares">
              <span>Поделиться</span>
              <div className="notes-share-grid">
                {shareOptions.map((option) => (
                  <label key={option.username} className="notes-share-option">
                    <input
                      type="checkbox"
                      checked={draft.sharedUsernames.includes(option.username)}
                      onChange={() => onToggleShare(option.username)}
                      disabled={!canManageShares}
                    />
                    <div>
                      <strong>{option.name}</strong>
                      <span>{option.username}</span>
                    </div>
                  </label>
                ))}
              </div>
              <small className="notes-field-hint">
                {canManageShares ? 'Отметьте, кому открыть заметку.' : 'Кто видит заметку, меняет только владелец.'}
              </small>
            </div>
          ) : null}

          {draft.kind !== 'task' && canManageShares && hasShares ? (
            <label className="notes-share-notify notes-field--share-notify">
              <input
                type="checkbox"
                checked={Boolean(draft.notifyOnChanges)}
                onChange={(event) => onDraftChange('notifyOnChanges', event.target.checked)}
              />
              <span>Уведомить при изменении</span>
            </label>
          ) : null}

          <div className="notes-field notes-field--wide notes-field--color">
            <span>Цвет</span>
            <div className="notes-color-picker">
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`notes-color-swatch is-${color.value} ${draft.color === color.value ? 'is-active' : ''}`}
                  onClick={() => onDraftChange('color', color.value)}
                  title={color.label}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="notes-editor-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Сохраняю...' : 'Сохранить'}
          </button>

          {canDelete ? (
            <button type="button" className="btn notes-delete-btn" onClick={onDelete} disabled={deleting}>
              <Trash2 size={16} /> {deleting ? 'Удаляю...' : 'Удалить'}
            </button>
          ) : null}

          <button type="button" className="btn" onClick={onClose}>Отмена</button>
        </div>
      </form>
    </ModalShell>
  )
}

const NotesCard = memo(({
  note,
  noteZones,
  shareOptions,
  assigneeOptions,
  showZones,
  isDragging,
  onEdit,
  onBringToFront,
  onStartDrag,
  onQuickUpdate
}) => {
  const statusMeta = getStatusMeta(note.status)
  const StatusIcon = statusMeta.icon
  const priorityMeta = getPriorityMeta(note.task_priority)
  const PriorityIcon = priorityMeta.icon
  const scheduleMeta = getTaskScheduleMeta(note)
  const [isEditing, setIsEditing] = useState(false)
  const taskItems = useMemo(() => parseTaskParagraphs(note.content), [note.content])
  const isInlineContentEditing = isEditing && note.kind !== 'task'

  const isInZone = useMemo(
    () => isNoteInsideZone(note, showZones ? noteZones : []),
    [note, noteZones, showZones]
  )

  const sharedUsers = (note.shares || []).map((share) => {
    const matchedOption = shareOptions.find((option) => option.username === share.username)
    const account = {
      username: share.username,
      name: matchedOption?.name || share.username
    }

    if (isHiddenPortalAccount(account)) return null

    return {
      username: share.username,
      name: getPortalAccountDisplayName(account)
    }
  }).filter(Boolean)
  const assignedUsers = (note.assignees || []).map((assignee) => {
    const matchedOption = assigneeOptions.find((option) => option.username === assignee.username)
    const account = {
      username: assignee.username,
      name: matchedOption?.name || assignee.username
    }

    if (isHiddenPortalAccount(account)) return null

    return {
      username: assignee.username,
      name: getPortalAccountDisplayName(account)
    }
  }).filter(Boolean)
  const shareCount = sharedUsers.length
  const assigneeCount = assignedUsers.length

  const applyQuickPatch = (patch, options = {}) => {
    onQuickUpdate(note.id, patch, options)
  }

  const handleTitleBlur = (event) => {
    setIsEditing(false)
    const nextTitle = event.currentTarget.innerText.trim()

    if (nextTitle && nextTitle !== note.title) {
      applyQuickPatch({ title: nextTitle })
    }
  }

  const handleContentBlur = (event) => {
    setIsEditing(false)
    const nextContent = event.currentTarget.innerText.trim()

    if (nextContent !== (note.content || '')) {
      applyQuickPatch({ content: nextContent })
    }
  }

  const handleToggleLock = (event) => {
    event.stopPropagation()
    applyQuickPatch({ is_locked: !note.is_locked })
  }

  const handleColorChange = (event, color) => {
    event.stopPropagation()
    if (color !== note.color) {
      applyQuickPatch({ color })
    }
  }

  const handleTaskToggle = (itemIndex) => {
    if (!note.can_edit) return

    const nextItems = taskItems.map((item, index) => (
      index === itemIndex
        ? { ...item, checked: !item.checked }
        : item
    ))

    applyQuickPatch({ content: serializeTaskParagraphs(nextItems) })
  }

  const handleTaskTextBlur = (itemIndex, event) => {
    setIsEditing(false)
    const nextText = event.currentTarget.innerText.trim()
    const currentText = taskItems[itemIndex]?.text || ''

    if (nextText === currentText) return

    const nextItems = taskItems.map((item, index) => (
      index === itemIndex
        ? { ...item, text: nextText }
        : item
    ))

    applyQuickPatch({ content: serializeTaskParagraphs(nextItems) })
  }

  const handleDragHandlePointerDown = (event) => {
    if (isEditing || note.is_locked) return
    onStartDrag(note.id, event)
  }

  return (
    <article
      className={`glass-panel notes-card is-${note.color} ${isInZone ? 'is-in-zone' : ''} ${isDragging ? 'is-dragging' : ''} ${note.is_locked ? 'is-locked' : ''}`}
      style={{
        position: 'absolute',
        width: NOTE_CARD_WIDTH,
        left: note.pos_x || 0,
        top: note.pos_y || 0,
        zIndex: note.z_index || 1
      }}
      onPointerDown={() => onBringToFront(note.id)}
    >
      {isInZone ? <div className="notes-card-zone-badge">Срочно!</div> : null}

      <div
        className="notes-card-topline notes-card-drag-handle"
        onPointerDown={handleDragHandlePointerDown}
      >
        <div className="notes-card-badges">
          <span className="notes-pill">{note.kind === 'task' ? 'Задача' : 'Заметка'}</span>
          {note.kind === 'task' && note.task_priority !== 'normal' ? (
            <span className={`notes-pill is-priority is-${note.task_priority}`}>
              <PriorityIcon size={14} />
              {priorityMeta.label}
            </span>
          ) : null}
          {note.status !== 'open' ? (
            <span className={`notes-pill is-status is-${note.status}`}>
              <StatusIcon size={14} />
              {statusMeta.label}
            </span>
          ) : null}
          {note.kind === 'task' && note.due_at ? (
            <span className={`notes-pill is-due ${scheduleMeta.isOverdue ? 'is-overdue' : scheduleMeta.isDueToday ? 'is-today' : ''}`}>
              <CalendarClock size={14} />
              {scheduleMeta.isOverdue ? 'Просрочено' : scheduleMeta.isDueToday ? 'Сегодня' : 'Срок'} {formatTaskDateTime(note.due_at)}
            </span>
          ) : null}
          {note.kind === 'task' && note.reminder_enabled && note.reminder_at ? (
            <span className="notes-pill is-reminder">
              <Bell size={14} />
              {formatTaskDateTime(note.reminder_at)}
              {note.reminder_repeat_count > 1 ? ` · ${note.reminder_repeat_count}x` : ''}
            </span>
          ) : null}
        </div>

        <span className="notes-card-updated">{formatUpdatedAt(note.updated_at)}</span>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className="notes-grip" title="Тянуть карточку">
            <Grip size={15} />
          </span>

          {note.can_edit ? (
            <button
              type="button"
              className={`notes-lock-btn ${note.is_locked ? 'is-locked' : ''}`}
              onPointerDown={(event) => event.stopPropagation()}
              onClick={handleToggleLock}
              title={note.is_locked ? 'Разблокировать перемещение' : 'Заблокировать перемещение'}
            >
              {note.is_locked ? <Lock size={16} /> : <Unlock size={16} />}
            </button>
          ) : null}
        </div>
      </div>

      <h3
        contentEditable={note.can_edit}
        suppressContentEditableWarning
        onFocus={() => setIsEditing(true)}
        onBlur={handleTitleBlur}
      >
        {note.title}
      </h3>

      <div className="notes-card-markdown-area">
        {isInlineContentEditing ? (
          <p
            contentEditable={note.can_edit}
            suppressContentEditableWarning
            onFocus={() => setIsEditing(true)}
            onBlur={handleContentBlur}
            className="notes-card-inline-content"
          >
            {note.content || (note.can_edit ? '' : 'Пока пусто.')}
          </p>
        ) : (
          note.kind === 'task' ? (
            <div className="notes-task-list" onClick={() => note.can_edit && taskItems.length === 0 && onEdit(note)}>
              {taskItems.map((item, index) => (
                <div key={`${note.id}-${index}`} className={`notes-task-item ${item.checked ? 'is-done' : ''}`}>
                  <input
                    type="checkbox"
                    checked={item.checked}
                    onPointerDown={(event) => event.stopPropagation()}
                    onChange={() => handleTaskToggle(index)}
                    disabled={!note.can_edit}
                  />
                  <div
                    className="notes-task-text"
                    contentEditable={note.can_edit}
                    suppressContentEditableWarning
                    onPointerDown={(event) => event.stopPropagation()}
                    onFocus={() => setIsEditing(true)}
                    onBlur={(event) => handleTaskTextBlur(index, event)}
                  >
                    {item.text}
                  </div>
                </div>
              ))}
              {taskItems.length === 0 && !note.can_edit ? 'Пока пусто.' : null}
              {taskItems.length === 0 && note.can_edit ? <span className="notes-edit-hint">Откройте карточку и добавьте пункты задачи.</span> : null}
            </div>
          ) : (
            <div className="notes-markdown-rendered" onClick={() => note.can_edit && setIsEditing(true)}>
              <SimpleMarkdown>{note.content || ''}</SimpleMarkdown>
              {!note.content && !note.can_edit ? 'Пока пусто.' : null}
              {!note.content && note.can_edit ? <span className="notes-edit-hint">Кликните, чтобы добавить текст...</span> : null}
            </div>
          )
        )}
      </div>

      <div className="notes-card-footer notes-card-drag-handle" onPointerDown={handleDragHandlePointerDown}>
        <div className="notes-card-footer-meta">
          {!note.is_owner ? (
            <span className="notes-owner">
              <UserRound size={14} />
              {getPortalAccountDisplayName({
                username: note.owner_username,
                name: note.owner_name
              })}
            </span>
          ) : null}

          {shareCount > 0 ? (
            <div className="notes-shared-group">
              <span className="notes-owner">
                <Share2 size={14} />
                {shareCount === 1 ? 'Общая' : `Общая · ${shareCount}`}
              </span>
              <div className="notes-shared-avatars">
                {sharedUsers.map((user) => (
                  <span
                    key={user.username}
                    className="notes-shared-avatar"
                    title={user.username}
                    aria-label={user.username}
                  >
                    {getAvatarLabel(user.name || user.username)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {note.kind === 'task' && assigneeCount > 0 ? (
            <div className="notes-shared-group">
              <span className="notes-owner">
                <UserRound size={14} />
                {assigneeCount === 1 ? 'Исполнитель' : `Исполнители · ${assigneeCount}`}
              </span>
              <div className="notes-shared-avatars">
                {assignedUsers.map((user) => (
                  <span
                    key={user.username}
                    className="notes-shared-avatar is-assignee"
                    title={user.username}
                    aria-label={user.username}
                  >
                    {getAvatarLabel(user.name || user.username)}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {note.can_edit ? (
            <div className="notes-color-picker-mini" onPointerDown={(event) => event.stopPropagation()}>
              {NOTE_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`notes-color-swatch-sm is-${color.value} ${note.color === color.value ? 'is-active' : ''}`}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => handleColorChange(event, color.value)}
                  title={color.label}
                />
              ))}
            </div>
          ) : null}

          <button
            type="button"
            className="notes-card-edit"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onEdit(note)}
          >
            Открыть
          </button>
          {note.is_locked ? <span className="notes-drag-caption">Зафиксировано</span> : null}
        </div>
      </div>
    </article>
  )
})

const NotesPageComponent = ({
  notes,
  noteZones = [],
  searchQuery,
  shareOptions = [],
  assigneeOptions = [],
  createRequestToken,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
  onCreateZone,
  onUpdateZone,
  onDeleteZone
}) => {
  const [kindFilter, setKindFilter] = useState('all')
  const [scopeFilter, setScopeFilter] = useState('all')
  const [taskTimeFilter, setTaskTimeFilter] = useState('all')
  const [showZones, setShowZones] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [draggingNoteId, setDraggingNoteId] = useState(null)
  const [boardNotes, setBoardNotes] = useState(notes)
  const [editorState, setEditorState] = useState({
    open: false,
    mode: 'create',
    noteId: null,
    draft: createEmptyDraft(assigneeOptions)
  })

  const boardNotesRef = useRef(notes)
  const noteSaveTimersRef = useRef({})
  const pendingNotePatchesRef = useRef({})
  const dragSessionRef = useRef(null)

  useEffect(() => {
    setBoardNotes(notes)
  }, [notes])

  useEffect(() => {
    boardNotesRef.current = boardNotes
  }, [boardNotes])

  useEffect(() => () => {
    Object.values(noteSaveTimersRef.current).forEach((timerId) => window.clearTimeout(timerId))
  }, [])

  useEffect(() => () => {
    const dragSession = dragSessionRef.current
    dragSession?.cleanup?.()
  }, [])

  useEffect(() => {
    if (!createRequestToken) return

    setEditorState({
      open: true,
      mode: 'create',
      noteId: null,
      draft: createEmptyDraft(assigneeOptions)
    })
  }, [createRequestToken])

  const filteredNotes = useMemo(() => (
    boardNotes
      .filter((note) => (
        matchSearchValues([
          note.title,
          note.content,
          note.owner_name,
          note.owner_username,
          note.kind === 'task' ? 'задача task' : 'заметка note',
          note.status,
          note.task_priority,
          formatTaskDateTime(note.due_at),
          formatTaskDateTime(note.reminder_at),
          note.reminder_repeat_count,
          note.reminder_repeat_interval_minutes,
          ...(note.shares || []).map((share) => share.username),
          ...(note.assignees || []).map((assignee) => assignee.username)
        ].filter((value) => !isHiddenPortalAccount({ username: value, name: value })), searchQuery)
      ))
      .filter((note) => (kindFilter === 'all' ? true : note.kind === kindFilter))
      .filter((note) => {
        if (taskTimeFilter === 'all') return true
        if (note.kind !== 'task') return false

        const scheduleMeta = getTaskScheduleMeta(note)
        if (taskTimeFilter === 'overdue') return scheduleMeta.isOverdue
        if (taskTimeFilter === 'today') return scheduleMeta.isDueToday
        if (taskTimeFilter === 'upcoming') return scheduleMeta.isUpcoming
        if (taskTimeFilter === 'no_due') return !scheduleMeta.hasDueDate
        return true
      })
      .filter((note) => {
        if (scopeFilter === 'mine') return note.is_owner
        if (scopeFilter === 'shared') return !note.is_owner
        return true
      })
      .sort((left, right) => {
        const zIndexDelta = (left.z_index || 0) - (right.z_index || 0)
        if (zIndexDelta !== 0) return zIndexDelta
        return left.id - right.id
      })
  ), [boardNotes, kindFilter, scopeFilter, searchQuery, taskTimeFilter])

  const summary = useMemo(() => {
    const now = new Date()
    return {
      total: boardNotes.length,
      mine: boardNotes.filter((note) => note.is_owner).length,
      shared: boardNotes.filter((note) => !note.is_owner).length,
      tasksOpen: boardNotes.filter((note) => note.kind === 'task' && note.status === 'open').length,
      tasksInProgress: boardNotes.filter((note) => note.kind === 'task' && note.status === 'in_progress').length,
      tasksDone: boardNotes.filter((note) => note.kind === 'task' && note.status === 'done').length,
      tasksOverdue: boardNotes.filter((note) => getTaskScheduleMeta(note, now).isOverdue).length,
      tasksToday: boardNotes.filter((note) => getTaskScheduleMeta(note, now).isDueToday).length
    }
  }, [boardNotes])

  const maxBoardHeight = useMemo(() => {
    let maxY = 0

    for (const note of filteredNotes) {
      const noteBottom = (note.pos_y || 0) + NOTE_CARD_HEIGHT
      if (noteBottom > maxY) {
        maxY = noteBottom
      }
    }

    if (showZones) {
      for (const zone of noteZones) {
        const zoneBottom = (zone.pos_y || 0) + (zone.height || 400)
        if (zoneBottom > maxY) {
          maxY = zoneBottom
        }
      }
    }

    return Math.max(720, maxY + 120)
  }, [filteredNotes, noteZones, showZones])

  const activeNote = useMemo(() => {
    if (!editorState.noteId) return null
    return boardNotes.find((note) => note.id === editorState.noteId) || null
  }, [boardNotes, editorState.noteId])

  const applyLocalNotePatch = (noteId, patch) => {
    setBoardNotes((currentNotes) => currentNotes.map((note) => (
      note.id === noteId
        ? {
          ...note,
          ...patch,
          updated_at: patch.updated_at || note.updated_at
        }
        : note
    )))
  }

  const scheduleNotePersist = (noteId, patch, { persistDelay = 140 } = {}) => {
    pendingNotePatchesRef.current[noteId] = {
      ...(pendingNotePatchesRef.current[noteId] || {}),
      ...patch
    }

    const currentTimerId = noteSaveTimersRef.current[noteId]
    if (currentTimerId) {
      window.clearTimeout(currentTimerId)
    }

    noteSaveTimersRef.current[noteId] = window.setTimeout(async () => {
      const currentNote = boardNotesRef.current.find((note) => note.id === noteId)
      const pendingPatch = pendingNotePatchesRef.current[noteId]

      delete noteSaveTimersRef.current[noteId]
      delete pendingNotePatchesRef.current[noteId]

      if (!currentNote || !pendingPatch) return

      try {
        await onUpdateNote(noteId, buildNoteUpdatePayload(currentNote, pendingPatch), {
          refresh: false,
          silent: true
        })
      } catch {
        // Ошибка уже логируется в App; следующий refreshNotes приведет локальное состояние в норму.
      }
    }, persistDelay)
  }

  const resolveBringToFrontPatch = (noteId, patch = {}) => {
    const currentNotes = boardNotesRef.current
    const note = currentNotes.find((item) => item.id === noteId)
    if (!note) return patch

    const currentMaxZIndex = getNextNoteZIndex(currentNotes) - 1
    const candidateZIndex = patch.z_index ?? note.z_index ?? 1

    if (candidateZIndex >= currentMaxZIndex) {
      return patch
    }

    return {
      ...patch,
      z_index: currentMaxZIndex + 1
    }
  }

  const handleBringToFront = (noteId) => {
    const currentNote = boardNotesRef.current.find((note) => note.id === noteId)
    if (!currentNote) return

    const nextPatch = resolveBringToFrontPatch(noteId)
    if (nextPatch.z_index == null || nextPatch.z_index === currentNote.z_index) {
      return
    }

    applyLocalNotePatch(noteId, nextPatch)
    scheduleNotePersist(noteId, nextPatch)
  }

  const handleQuickUpdate = (noteId, patch, options = {}) => {
    const nextPatch = options.bringToFront ? resolveBringToFrontPatch(noteId, patch) : patch
    applyLocalNotePatch(noteId, nextPatch)
    scheduleNotePersist(noteId, nextPatch, options)
  }

  const finishNoteDrag = (noteId) => {
    const currentNote = boardNotesRef.current.find((note) => note.id === noteId)
    if (!currentNote) return

    const snappedPosition = snapNotePosition(
      currentNote.pos_x,
      currentNote.pos_y,
      noteZones,
      showZones
    )

    applyLocalNotePatch(noteId, snappedPosition)
    scheduleNotePersist(noteId, snappedPosition, { persistDelay: 80 })
  }

  const startNoteDrag = (noteId, event) => {
    const note = boardNotesRef.current.find((item) => item.id === noteId)
    if (!note || note.is_locked) return

    event.preventDefault()
    event.stopPropagation()
    dragSessionRef.current?.cleanup?.()

    handleBringToFront(noteId)
    setDraggingNoteId(noteId)

    const startPageX = event.clientX + window.scrollX
    const startPageY = event.clientY + window.scrollY
    const startPosX = note.pos_x || 0
    const startPosY = note.pos_y || 0
    const latestPointerRef = {
      clientX: event.clientX,
      clientY: event.clientY
    }
    let autoScrollFrameId = null

    document.body.classList.add('notes-is-dragging')

    const updateDragPosition = () => {
      const nextPageX = latestPointerRef.clientX + window.scrollX
      const nextPageY = latestPointerRef.clientY + window.scrollY
      const deltaX = nextPageX - startPageX
      const deltaY = nextPageY - startPageY

      applyLocalNotePatch(noteId, {
        pos_x: clampCanvasX(startPosX + deltaX),
        pos_y: clampCanvasY(startPosY + deltaY)
      })
    }

    const tickAutoScroll = () => {
      const autoScrollDelta = getAutoScrollDelta(latestPointerRef.clientY, window.innerHeight)
      if (autoScrollDelta !== 0) {
        window.scrollBy({ top: autoScrollDelta, behavior: 'auto' })
        updateDragPosition()
      }

      autoScrollFrameId = window.requestAnimationFrame(tickAutoScroll)
    }

    const cleanup = () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      if (autoScrollFrameId != null) {
        window.cancelAnimationFrame(autoScrollFrameId)
      }
      document.body.classList.remove('notes-is-dragging')
      dragSessionRef.current = null
      setDraggingNoteId(null)
    }

    const handlePointerMove = (moveEvent) => {
      latestPointerRef.clientX = moveEvent.clientX
      latestPointerRef.clientY = moveEvent.clientY
      updateDragPosition()
    }

    const handlePointerUp = () => {
      cleanup()
      finishNoteDrag(noteId)
    }

    dragSessionRef.current = { noteId, cleanup }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    autoScrollFrameId = window.requestAnimationFrame(tickAutoScroll)
  }

  const openEdit = (note) => {
    setEditorState({
      open: true,
      mode: 'edit',
      noteId: note.id,
      draft: createDraftFromNote(note)
    })
  }

  const handleDraftChange = (field, value) => {
    setEditorState((previousState) => ({
      ...previousState,
      draft: {
        ...previousState.draft,
        [field]: value
      }
    }))
  }

  const handleToggleShare = (username) => {
    setEditorState((previousState) => {
      const hasUser = previousState.draft.sharedUsernames.includes(username)
      const sharedUsernames = hasUser
        ? previousState.draft.sharedUsernames.filter((item) => item !== username)
        : [...previousState.draft.sharedUsernames, username]

      return {
        ...previousState,
        draft: {
          ...previousState.draft,
          sharedUsernames,
          notifyOnChanges: sharedUsernames.length === 0 ? false : previousState.draft.notifyOnChanges
        }
      }
    })
  }

  const handleToggleAssignee = (username) => {
    setEditorState((previousState) => {
      const hasUser = previousState.draft.assignedUsernames.includes(username)
      const assignedUsernames = hasUser
        ? previousState.draft.assignedUsernames.filter((item) => item !== username)
        : [...previousState.draft.assignedUsernames, username]

      return {
        ...previousState,
        draft: {
          ...previousState.draft,
          assignedUsernames
        }
      }
    })
  }

  const closeEditor = () => {
    if (saving || deleting) return
    setEditorState((previousState) => ({ ...previousState, open: false }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const isTask = editorState.draft.kind === 'task'
    const sharedUsernames = isTask ? [] : editorState.draft.sharedUsernames
    const dueAt = isTask ? fromDateTimeLocalInput(editorState.draft.dueAt) : null
    const reminderAt = isTask && editorState.draft.reminderEnabled
      ? fromDateAndTimeInputs(editorState.draft.reminderDate, editorState.draft.reminderTime)
      : null
    const reminderRepeatCount = Math.min(10, Math.max(1, Number.parseInt(editorState.draft.reminderRepeatCount, 10) || 1))
    const reminderRepeatIntervalMinutes = Math.min(
      10080,
      Math.max(5, Number.parseInt(editorState.draft.reminderRepeatIntervalMinutes, 10) || 60)
    )
    const payload = {
      title: editorState.draft.title,
      content: editorState.draft.content,
      color: editorState.draft.color,
      kind: editorState.draft.kind,
      status: editorState.draft.status,
      task_priority: isTask ? editorState.draft.taskPriority : 'normal',
      due_at: dueAt,
      reminder_enabled: Boolean(isTask && editorState.draft.reminderEnabled && reminderAt),
      reminder_at: reminderAt,
      reminder_repeat_count: isTask ? reminderRepeatCount : 1,
      reminder_repeat_interval_minutes: isTask ? reminderRepeatIntervalMinutes : 60,
      due_notification_enabled: Boolean(isTask && editorState.draft.dueNotificationEnabled),
      assigned_usernames: isTask ? editorState.draft.assignedUsernames : [],
      notify_on_changes: sharedUsernames.length > 0 ? Boolean(editorState.draft.notifyOnChanges) : false,
      shared_usernames: sharedUsernames,
      pos_x: editorState.draft.pos_x,
      pos_y: editorState.draft.pos_y,
      z_index: editorState.draft.z_index,
      is_locked: editorState.draft.is_locked
    }

    setSaving(true)

    try {
      if (editorState.mode === 'create') {
        await onCreateNote(payload)
      } else if (editorState.noteId) {
        await onUpdateNote(editorState.noteId, payload)
      }

      setEditorState({
        open: false,
        mode: 'create',
        noteId: null,
        draft: createEmptyDraft(assigneeOptions)
      })
    } catch {
      // Ошибка уже показана в App.
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!activeNote) return
    if (!window.confirm('Удалить заметку?')) return

    setDeleting(true)

    try {
      await onDeleteNote(activeNote)
      setEditorState({
        open: false,
        mode: 'create',
        noteId: null,
        draft: createEmptyDraft(assigneeOptions)
      })
    } catch {
      // Ошибка уже показана в App.
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="content-stack notes-board-page"
      >
        <section className="notes-board-toolbar">
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div className="notes-board-hero-stats">
              <span><strong>{summary.total}</strong> всего</span>
              <span><strong>{summary.mine}</strong> личных</span>
              <span><strong>{summary.shared}</strong> общих</span>
              {summary.tasksOverdue > 0 ? <span className="is-danger"><strong>{summary.tasksOverdue}</strong> просрочено</span> : null}
              {summary.tasksToday > 0 ? <span><strong>{summary.tasksToday}</strong> сегодня</span> : null}
              {summary.tasksOpen > 0 ? <span><strong>{summary.tasksOpen}</strong> в ожидании</span> : null}
              {summary.tasksInProgress > 0 ? <span><strong>{summary.tasksInProgress}</strong> в работе</span> : null}
            </div>

            <div className="notes-toolbar-actions">
              <button
                type="button"
                className={`btn btn-sm ${showZones ? 'is-active' : ''}`}
                onClick={() => {
                  if (!showZones && noteZones.length === 0) {
                    onCreateZone({ title: 'Срочно', color: 'rose', pos_x: 20, pos_y: 20, width: 400, height: 400 })
                  }
                  setShowZones((currentValue) => !currentValue)
                }}
              >
                {showZones ? 'Скрыть магнитную зону' : 'Показать магнитную зону'}
              </button>

            </div>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div className="glass-panel notes-filter-group">
              <button type="button" className={`notes-filter-btn ${kindFilter === 'all' ? 'is-active' : ''}`} onClick={() => setKindFilter('all')}>Все</button>
              <button type="button" className={`notes-filter-btn ${kindFilter === 'note' ? 'is-active' : ''}`} onClick={() => setKindFilter('note')}>Заметки</button>
              <button type="button" className={`notes-filter-btn ${kindFilter === 'task' ? 'is-active' : ''}`} onClick={() => setKindFilter('task')}>Задачи</button>
            </div>

            <div className="glass-panel notes-filter-group">
              <button type="button" className={`notes-filter-btn ${taskTimeFilter === 'all' ? 'is-active' : ''}`} onClick={() => setTaskTimeFilter('all')}>Все сроки</button>
              <button type="button" className={`notes-filter-btn ${taskTimeFilter === 'overdue' ? 'is-active' : ''}`} onClick={() => setTaskTimeFilter('overdue')}>Просрочены</button>
              <button type="button" className={`notes-filter-btn ${taskTimeFilter === 'today' ? 'is-active' : ''}`} onClick={() => setTaskTimeFilter('today')}>Сегодня</button>
              <button type="button" className={`notes-filter-btn ${taskTimeFilter === 'upcoming' ? 'is-active' : ''}`} onClick={() => setTaskTimeFilter('upcoming')}>Будущие</button>
            </div>

            <div className="glass-panel notes-filter-group">
              <button type="button" className={`notes-filter-btn ${scopeFilter === 'all' ? 'is-active' : ''}`} onClick={() => setScopeFilter('all')}>Все</button>
              <button type="button" className={`notes-filter-btn ${scopeFilter === 'mine' ? 'is-active' : ''}`} onClick={() => setScopeFilter('mine')}>Мои</button>
              <button type="button" className={`notes-filter-btn ${scopeFilter === 'shared' ? 'is-active' : ''}`} onClick={() => setScopeFilter('shared')}>Общие</button>
            </div>
          </div>
        </section>

        <section className={`notes-board-canvas ${draggingNoteId ? 'is-dragging' : ''}`} style={{ minHeight: `${maxBoardHeight}px` }}>
          {showZones ? noteZones.map((zone) => (
            <BoardZone key={zone.id} zone={zone} onUpdate={onUpdateZone} onDelete={onDeleteZone} />
          )) : null}

          {filteredNotes.map((note) => (
            <NotesCard
              key={note.id}
              note={note}
              noteZones={noteZones}
              shareOptions={shareOptions}
              assigneeOptions={assigneeOptions}
              showZones={showZones}
              isDragging={draggingNoteId === note.id}
              onEdit={openEdit}
              onBringToFront={handleBringToFront}
              onStartDrag={startNoteDrag}
              onQuickUpdate={handleQuickUpdate}
            />
          ))}
        </section>

        {filteredNotes.length === 0 ? (
          <div className="notes-empty-container" style={{ pointerEvents: 'none' }}>
            <EmptyState panel={true}>
              {boardNotes.length === 0 ? 'Здесь пока пусто. Создайте первую заметку.' : 'Ничего не найдено. Измените параметры поиска.'}
            </EmptyState>
          </div>
        ) : null}
      </motion.div>

      <NotesEditorModal
        open={editorState.open}
        mode={editorState.mode}
        draft={editorState.draft}
        shareOptions={shareOptions}
        assigneeOptions={assigneeOptions}
        canManageShares={editorState.mode === 'create' || Boolean(activeNote?.can_manage_shares)}
        canDelete={Boolean(activeNote?.can_delete)}
        saving={saving}
        deleting={deleting}
        onDraftChange={handleDraftChange}
        onToggleShare={handleToggleShare}
        onToggleAssignee={handleToggleAssignee}
        onClose={closeEditor}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />
    </>
  )
}

export default memo(NotesPageComponent)
