import { CalendarRange, GripVertical, Trash2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { HOME_WIDGET_DEFINITION_MAP, HOME_WIDGET_WIDTH_OPTIONS } from '../config/homeWidgets'
import { HomeAdminTeamWidget } from './HomeAdminTeamWidget'
import { HomeFavoriteContactsWidget } from './HomeFavoriteContactsWidget'
import { HomeMonthCalendarWidget } from './HomeMonthCalendarWidget'
import { HomeNetworkTopWidget } from './HomeNetworkTopWidget'
import { HomeTacticalAttentionWidget } from './HomeTacticalAttentionWidget'
import { HomeUrgentCartridgesWidget } from './HomeUrgentCartridgesWidget'
import { HomeVkWorkspaceWidget } from './HomeVkWorkspaceWidget'

function renderWidgetBody(widget, { homeWidgetData, isHomeEditMode, onUpdateHomeWidget }) {
  if (widget.widget_type === 'month_calendar') {
    return <HomeMonthCalendarWidget widget={widget} />
  }

  if (widget.widget_type === 'favorite_contacts') {
    return (
      <HomeFavoriteContactsWidget
        widget={widget}
        employees={homeWidgetData?.employees}
        phonebook={homeWidgetData?.phonebook}
        isHomeEditMode={isHomeEditMode}
        onUpdateHomeWidget={onUpdateHomeWidget}
      />
    )
  }

  if (widget.widget_type === 'urgent_cartridges') {
    return (
      <HomeUrgentCartridgesWidget
        widget={widget}
        inventory={homeWidgetData?.inventory}
        isHomeEditMode={isHomeEditMode}
        onUpdateHomeWidget={onUpdateHomeWidget}
      />
    )
  }

  if (widget.widget_type === 'admin_team') {
    return (
      <HomeAdminTeamWidget
        widget={widget}
        employees={homeWidgetData?.employees}
        vacationsOverview={homeWidgetData?.vacationsOverview}
        portalPresence={homeWidgetData?.portalPresence}
        isHomeEditMode={isHomeEditMode}
        onUpdateHomeWidget={onUpdateHomeWidget}
      />
    )
  }

  if (widget.widget_type === 'vk_workspace') {
    return (
      <HomeVkWorkspaceWidget
        widget={widget}
        user={homeWidgetData?.user}
        isHomeEditMode={isHomeEditMode}
        onUpdateHomeWidget={onUpdateHomeWidget}
      />
    )
  }

  if (widget.widget_type === 'network_top') {
    return (
      <HomeNetworkTopWidget
        phonebook={homeWidgetData?.phonebook}
        limitingContactId={homeWidgetData?.limitingContactId}
        onApplyNetworkLimit={homeWidgetData?.onApplyNetworkLimit}
        onClearNetworkLimit={homeWidgetData?.onClearNetworkLimit}
      />
    )
  }

  if (widget.widget_type === 'tactical_attention') {
    return <HomeTacticalAttentionWidget phonebook={homeWidgetData?.phonebook} />
  }

  return (
    <div className="home-widget-fallback">
      Этот виджет пока не поддерживается в интерфейсе.
    </div>
  )
}

export function HomeWidgetCard({
  widget,
  idx,
  homeWidgetData,
  isHomeEditMode,
  draggedHomeItemId,
  isDropPreview,
  isDraggable,
  onDragStart,
  onDrag,
  onDragOver,
  onDrop,
  onDragEnd,
  onUpdateHomeWidget,
  onDeleteHomeWidget
}) {
  const widgetDefinition = HOME_WIDGET_DEFINITION_MAP[widget.widget_type]
  const Icon = widgetDefinition?.Icon || CalendarRange
  const activeWidthMode = widget.width_mode || widgetDefinition?.widthMode || 'wide'
  const widthOptions = HOME_WIDGET_WIDTH_OPTIONS.filter((option) => (
    (widgetDefinition?.widthOptions || HOME_WIDGET_WIDTH_OPTIONS.map((item) => item.value)).includes(option.value)
  ))

  return (
    <motion.div
      layout
      className={`home-neon-widget-card glass-panel is-${activeWidthMode} ${isDraggable ? 'is-draggable' : ''} ${draggedHomeItemId === widget.itemKey ? 'is-dragging' : ''} ${isDropPreview ? 'is-drop-preview' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      draggable={isDraggable}
      onDragStart={isDraggable ? (event) => onDragStart(event, widget.itemKey) : undefined}
      onDrag={isDraggable ? onDrag : undefined}
      onDragOver={isDraggable ? (event) => onDragOver(event, widget.itemKey) : undefined}
      onDrop={isDraggable ? (event) => onDrop(event, widget.itemKey) : undefined}
      onDragEnd={isDraggable ? onDragEnd : undefined}
      transition={{
        delay: idx * 0.04,
        layout: { type: 'spring', stiffness: 420, damping: 34, mass: 0.92 }
      }}
    >
      <div className="home-neon-widget-head">
        <div className="home-neon-widget-title">
          <span className="home-neon-widget-icon">
            <Icon size={18} />
          </span>
          <div>
            <strong>{widget.title}</strong>
            <span>{widgetDefinition?.description || 'Пользовательский виджет домашней страницы'}</span>
          </div>
        </div>
        {(isHomeEditMode || isDraggable) && (
          <div className="home-neon-widget-actions">
            {isDraggable && (
              <button
                type="button"
                className="home-card-icon-btn home-card-drag-handle"
                title="Перетащить"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                aria-label="Перетащить виджет"
              >
                <GripVertical size={14} />
              </button>
            )}
            {isHomeEditMode && (
              <>
                <button
                  type="button"
                  className="home-card-icon-btn"
                  title="Удалить виджет"
                  onClick={() => onDeleteHomeWidget(widget)}
                >
                  <Trash2 size={14} />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {isHomeEditMode && (
        <div className="home-widget-width-switch" role="group" aria-label="Размер виджета">
          {widthOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`home-widget-width-switch-btn ${activeWidthMode === option.value ? 'is-active' : ''} ${widgetDefinition?.widthMode === option.value ? 'is-recommended' : ''}`}
              onClick={() => onUpdateHomeWidget(widget, { width_mode: option.value })}
              title={widgetDefinition?.widthMode === option.value ? 'Рекомендуемый размер для этого виджета' : option.description}
            >
              {option.shortLabel}
            </button>
          ))}
        </div>
      )}

      {renderWidgetBody(widget, { homeWidgetData, isHomeEditMode, onUpdateHomeWidget })}
    </motion.div>
  )
}
