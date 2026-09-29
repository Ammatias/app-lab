import { HOME_WIDGET_DEFINITION_MAP, HOME_WIDGET_DEFINITIONS, HOME_WIDGET_WIDTH_OPTIONS } from '../config/homeWidgets'

export function HomeWidgetPicker({
  draft,
  loading,
  groupContextLabel,
  onChange,
  onSubmit,
  onCancel
}) {
  const activeWidgetDefinition = HOME_WIDGET_DEFINITION_MAP[draft.widgetType] || HOME_WIDGET_DEFINITIONS[0]
  const widthOptions = HOME_WIDGET_WIDTH_OPTIONS.filter((option) => (
    (activeWidgetDefinition?.widthOptions || HOME_WIDGET_WIDTH_OPTIONS.map((item) => item.value)).includes(option.value)
  ))

  return (
    <form className="glass-panel home-widget-picker" onSubmit={onSubmit}>
      <div className="home-widget-picker-header">
        <div>
          <strong>Добавить виджет</strong>
          <p>{groupContextLabel}</p>
        </div>
      </div>

      <div className="home-widget-picker-grid">
        {HOME_WIDGET_DEFINITIONS.map((widget) => {
          const isActive = draft.widgetType === widget.type
          const Icon = widget.Icon

          return (
            <button
              key={widget.type}
              type="button"
              className={`home-widget-option ${isActive ? 'is-active' : ''}`}
              onClick={() => onChange({ widgetType: widget.type, widthMode: widget.widthMode || 'wide' })}
            >
              <span className="home-widget-option-icon">
                <Icon size={18} />
              </span>
              <span className="home-widget-option-copy">
                <strong>{widget.title}</strong>
                <span>{widget.description}</span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="home-widget-size-picker">
        <div className="home-widget-size-picker-header">
          <strong>Размер виджета</strong>
          <span>Стартовый размер зависит от типа. Для выбранного виджета рекомендуем {activeWidgetDefinition?.widthMode || 'wide'}.</span>
        </div>
        <div className="home-widget-size-grid">
          {widthOptions.map((option) => {
            const isActive = (draft.widthMode || activeWidgetDefinition?.widthMode || 'wide') === option.value
            const isRecommended = activeWidgetDefinition?.widthMode === option.value

            return (
              <button
                key={option.value}
                type="button"
                className={`home-widget-size-option ${isActive ? 'is-active' : ''}`}
                onClick={() => onChange({ widthMode: option.value })}
              >
                <strong>{option.title}{isRecommended ? ' · рекомендуется' : ''}</strong>
                <span>{option.description}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="home-widget-picker-actions">
        <button type="button" className="btn" onClick={onCancel}>
          Отмена
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Создаю...' : 'Добавить виджет'}
        </button>
      </div>
    </form>
  )
}
