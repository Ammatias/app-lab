import { forwardRef } from 'react'
import { Search, Trash2 } from 'lucide-react'

export const GlobalSearchBar = forwardRef(function GlobalSearchBar({
  value,
  onChange,
  onClear,
  weatherState,
  weatherMeta,
  WeatherIcon,
  clockTime
}, ref) {
  return (
    <div className="global-search-row">
      <div className="global-search-meta">
        <div className="global-search-clock">{clockTime}</div>

        <div className="global-search-weather">
          <span className="global-search-weather-city">Демо-город</span>
          <span className="global-search-weather-temp">
            {weatherState?.loading && weatherState?.temperature === null
              ? '...'
              : weatherState?.temperature !== null && weatherState?.temperature !== undefined
                ? `${Math.round(weatherState.temperature)}°`
                : '--'}
          </span>
          <span className="global-search-weather-status">
            <WeatherIcon size={13} />
            <span>{weatherState?.error || weatherMeta?.label || 'Open-Meteo'}</span>
            {weatherState?.windSpeed !== null && weatherState?.windSpeed !== undefined ? (
              <span>{Math.round(weatherState.windSpeed)} м/с</span>
            ) : null}
          </span>
        </div>
      </div>

      <div className="global-search-box">
        <div className="glass-panel global-search-panel">
          <Search size={14} color="var(--accent)" style={{ marginRight: '8px', opacity: 0.7 }} />
          <input
            ref={ref}
            type="text"
            placeholder="Сверх-поиск везде..."
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className="global-search-input"
          />
          {value && (
            <button onClick={onClear} className="icon-plain-btn">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
})
