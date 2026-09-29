import { AlertTriangle, PackageCheck } from 'lucide-react'
import { useMemo } from 'react'
import { parseHomeWidgetSettings, stringifyHomeWidgetSettings } from '../lib/homeWidgetSettings'

function buildUrgentInventoryItems(inventory, settings) {
  return (inventory || [])
    .map((item) => {
      const total = Number(item.new_count || 0) + Number(item.refilled_count || 0)
      const criticalLimit = Number(item.critical_limit ?? 2)
      const printerCount = Number(item.printer_count || 0)
      const isCritical = total <= criticalLimit
      const isNear = total <= (criticalLimit + 2)

      return {
        ...item,
        totalStock: total,
        criticalLimit,
        printerCount,
        isCritical,
        isNear
      }
    })
    .filter((item) => (
      settings.include_near_limit ? item.isNear : item.isCritical
    ))
    .sort((left, right) => {
      if (left.isCritical !== right.isCritical) return left.isCritical ? -1 : 1
      if (left.totalStock !== right.totalStock) return left.totalStock - right.totalStock
      if (left.printerCount !== right.printerCount) return right.printerCount - left.printerCount
      return String(left.cartridge_type_name || left.name || '').localeCompare(String(right.cartridge_type_name || right.name || ''), 'ru-RU')
    })
}

export function HomeUrgentCartridgesWidget({
  widget,
  inventory = [],
  isHomeEditMode,
  onUpdateHomeWidget
}) {
  const settings = useMemo(() => parseHomeWidgetSettings(widget), [widget])
  const allUrgentItems = useMemo(
    () => buildUrgentInventoryItems(inventory, settings),
    [inventory, settings]
  )
  const urgentItems = useMemo(
    () => allUrgentItems.slice(0, settings.max_items),
    [allUrgentItems, settings.max_items]
  )

  const criticalCount = allUrgentItems.filter((item) => item.isCritical).length
  const hasInventory = inventory.length > 0

  const updateSettings = (patch) => (
    onUpdateHomeWidget(widget, {
      settings_json: stringifyHomeWidgetSettings(widget.widget_type, {
        ...settings,
        ...patch
      })
    })
  )

  return (
    <div className="home-urgent-widget">
      {urgentItems.length > 0 ? (
        <>
          <div className="home-urgent-widget-summary">
            <span>{criticalCount > 0 ? `Критичных: ${criticalCount}` : 'Критичных нет'}</span>
            <strong>Показано: {urgentItems.length} из {allUrgentItems.length}</strong>
          </div>

          <div className="home-urgent-widget-list">
            {urgentItems.map((item) => (
              <article
                key={`urgent-cartridge-${item.id}`}
                className={`home-urgent-card ${item.isCritical ? 'is-critical' : 'is-near'}`}
              >
                <div className="home-urgent-card-copy">
                  <strong>{item.cartridge_type_name || item.name}</strong>
                  <span>{item.name}</span>
                  <small>
                    Порог: {item.criticalLimit} · Принтеров: {item.printerCount}
                  </small>
                </div>

                <div className="home-urgent-card-stock">
                  <b>{item.totalStock}</b>
                  <span>{item.new_count} нов. / {item.refilled_count} запр.</span>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="home-widget-empty">
          {hasInventory
            ? 'Критичных остатков сейчас нет. Виджет можно оставить как зелёный индикатор порядка или включить показ «почти критично».'
            : 'Склад картриджей пока пуст. Когда позиции появятся, виджет начнет автоматически подсвечивать срочные остатки.'}
        </div>
      )}

      {isHomeEditMode ? (
        <div className="home-widget-config-panel">
          <div className="home-widget-config-head">
            <strong>Настройки виджета</strong>
            <span>Показывает самые слабые позиции по текущему складу.</span>
          </div>

          <div className="home-widget-chip-row">
            {[3, 4, 5, 6, 8].map((count) => (
              <button
                key={`urgent-count-${count}`}
                type="button"
                className={`home-widget-mini-chip ${settings.max_items === count ? 'is-active' : ''}`}
                onClick={() => updateSettings({ max_items: count })}
              >
                {count} поз.
              </button>
            ))}
          </div>

          <label className="home-widget-toggle-row">
            <input
              type="checkbox"
              checked={settings.include_near_limit}
              onChange={(event) => updateSettings({ include_near_limit: event.target.checked })}
            />
            <span>Показывать и «почти критично», если остаток близок к порогу</span>
          </label>
        </div>
      ) : null}

      {!isHomeEditMode && urgentItems.length === 0 ? (
        <div className="home-urgent-widget-ok">
          <PackageCheck size={14} /> Склад держится спокойно
        </div>
      ) : null}

      {!isHomeEditMode && urgentItems.length > 0 && criticalCount > 0 ? (
        <div className="home-urgent-widget-alert">
          <AlertTriangle size={14} /> Нужен контроль пополнения
        </div>
      ) : null}
    </div>
  )
}
