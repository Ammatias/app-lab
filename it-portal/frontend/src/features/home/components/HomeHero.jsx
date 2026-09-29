import { Check, FolderPlus, Pencil, Plus, Shield } from 'lucide-react'
import { FaviconIcon } from '../../../shared/ui/FaviconIcon'
import { StatusIndicator } from '../../../shared/ui/StatusIndicator'

const TACTICAL_RMM_URL = 'https://rmm.demo.example.com/'

export function HomeHero({
  currentHomeGroup,
  currentHomeLinks,
  currentHomeWidgets,
  isFavoritesGroup,
  isHomeEditMode,
  homeDensityMode,
  draggedHomeItemId,
  onToggleEditMode,
  onSetHomeDensityMode,
  onOpenFavoriteForm,
  onOpenHomeLinkCreate,
  onOpenHomeGroupCreate,
  onOpenHomeWidgetCreate,
  hasSearchResults
}) {
  const widgetCount = currentHomeWidgets.length
  const totalItems = currentHomeLinks.length + widgetCount
  const groupSummary = !currentHomeGroup
    ? 'По текущему фильтру не осталось секций.'
    : isFavoritesGroup
      ? `${currentHomeLinks.length} ссылок · ${widgetCount} виджетов`
      : currentHomeGroup.parentTitle
        ? `${currentHomeGroup.parentTitle} · ${currentHomeLinks.length} ссылок · ${widgetCount} виджетов`
        : `${currentHomeLinks.length} ссылок · ${widgetCount} виджетов`
  const actionSummary = currentHomeGroup ? `${totalItems} элементов` : '0 элементов'

  return (
    <div className={`home-neon-hero glass-panel ${isFavoritesGroup ? 'is-favorites-hero' : ''}`}>
      <div className="home-neon-hero-copy">
        <div className="home-neon-hero-heading">
          <h2>{currentHomeGroup?.title || 'Сервисы не найдены'}</h2>
          {currentHomeGroup ? <span className="home-neon-hero-stat">{actionSummary}</span> : null}
        </div>
        <p>{groupSummary}</p>
        {draggedHomeItemId ? (
          <span className="home-neon-hero-hint">
            Перетащите карточку на любой раздел слева, чтобы перенести её между «Домашней» и группами.
          </span>
        ) : null}
      </div>
      <a
        href={TACTICAL_RMM_URL}
        target="_blank"
        rel="noreferrer"
        className="home-neon-featured-link"
      >
        <span className="home-neon-featured-icon">
          <FaviconIcon
            url={TACTICAL_RMM_URL}
            fallback={Shield}
            alt="Tactical RMM favicon"
            name="Tactical RMM"
          />
        </span>
        <span className="home-neon-featured-copy">
          <strong>Tactical RMM</strong>
          <span>{TACTICAL_RMM_URL.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span>
        </span>
        <span className="home-neon-featured-status">
          <StatusIndicator url={TACTICAL_RMM_URL} />
        </span>
      </a>
      <div className="home-neon-hero-meta">
        <div className="home-density-toggle" role="group" aria-label="Плотность домашней страницы">
          <button
            type="button"
            className={`home-density-toggle-btn ${homeDensityMode === 'comfortable' ? 'is-active' : ''}`}
            onClick={() => onSetHomeDensityMode('comfortable')}
          >
            Свободно
          </button>
          <button
            type="button"
            className={`home-density-toggle-btn ${homeDensityMode === 'compact' ? 'is-active' : ''}`}
            onClick={() => onSetHomeDensityMode('compact')}
          >
            Плотно
          </button>
        </div>
        {isFavoritesGroup && (
          <div className="home-neon-hero-actions">
            <button type="button" className="home-favorite-add-btn" onClick={onOpenFavoriteForm}>
              <Plus size={14} />
              Ссылка
            </button>
            <button type="button" className="home-favorite-add-btn" onClick={onOpenHomeWidgetCreate}>
              <Plus size={14} />
              Виджет
            </button>
            <button type="button" className="home-favorite-add-btn is-secondary" onClick={onToggleEditMode}>
              {isHomeEditMode ? <Check size={14} /> : <Pencil size={14} />}
              {isHomeEditMode ? 'Готово' : 'Режим'}
            </button>
          </div>
        )}
        {!isFavoritesGroup && currentHomeGroup ? (
          <div className="home-neon-hero-actions">
            {isHomeEditMode ? (
              <>
                <button type="button" className="home-favorite-add-btn" onClick={onOpenHomeLinkCreate}>
                  <Plus size={14} />
                  Ссылка
                </button>
                <button type="button" className="home-favorite-add-btn" onClick={onOpenHomeGroupCreate}>
                  <FolderPlus size={14} />
                  Подгруппа
                </button>
                <button type="button" className="home-favorite-add-btn" onClick={onOpenHomeWidgetCreate}>
                  <Plus size={14} />
                  Виджет
                </button>
                <button type="button" className="home-favorite-add-btn is-secondary" onClick={onToggleEditMode}>
                  <Check size={14} />
                  Готово
                </button>
              </>
            ) : (
              <button type="button" className="home-favorite-add-btn is-secondary" onClick={onToggleEditMode}>
                <Pencil size={14} />
                Редактировать
              </button>
            )}
          </div>
        ) : null}
        {hasSearchResults ? <span>{actionSummary}</span> : null}
      </div>
    </div>
  )
}
