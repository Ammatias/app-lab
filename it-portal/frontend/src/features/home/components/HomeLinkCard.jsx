import { ExternalLink, GripVertical, Pencil, Star, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { FaviconIcon } from '../../../shared/ui/FaviconIcon'
import { StatusIndicator } from '../../../shared/ui/StatusIndicator'

export function HomeLinkCard({
  link,
  idx,
  CurrentHomeIcon,
  currentHomeGroup,
  isFavoritesGroup,
  isHomeEditMode,
  draggedHomeItemId,
  isDropPreview,
  isDraggable,
  onDragStart,
  onDrag,
  onDragOver,
  onDrop,
  onDragEnd,
  onRemoveFavorite,
  onEditHomeLink,
  isFavoriteLink,
  onToggleFavorite
}) {
  return (
    <motion.a
      layout
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className={`home-neon-card ${isDraggable ? 'is-draggable' : ''} ${draggedHomeItemId === link.itemKey ? 'is-dragging' : ''} ${isDropPreview ? 'is-drop-preview' : ''}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      draggable={isDraggable}
      onClick={(!isFavoritesGroup && isHomeEditMode) ? (event) => {
        event.preventDefault()
      } : undefined}
      onDragStart={isDraggable ? (event) => onDragStart(event, link.itemKey) : undefined}
      onDrag={isDraggable ? onDrag : undefined}
      onDragOver={isDraggable ? (event) => onDragOver(event, link.itemKey) : undefined}
      onDrop={isDraggable ? (event) => onDrop(event, link.itemKey) : undefined}
      onDragEnd={isDraggable ? onDragEnd : undefined}
      transition={{
        delay: idx * 0.04,
        layout: { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 }
      }}
    >
      <div className="home-neon-card-icon">
        <FaviconIcon
          url={link.href}
          fallback={CurrentHomeIcon}
          alt={`${link.name} favicon`}
          name={link.name}
        />
      </div>
      <div className="home-neon-card-copy">
        <div className="home-neon-card-topline">
          <h3>{link.name}</h3>
          <div className="home-neon-card-actions">
            {isDraggable && (
              <button
                type="button"
                className="home-card-icon-btn home-card-drag-handle"
                title="Перетащить"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
                aria-label="Перетащить карточку"
              >
                <GripVertical size={14} />
              </button>
            )}
            {isFavoritesGroup ? (
              <>
                <button
                  type="button"
                  className="home-card-icon-btn"
                  title="Убрать из избранного"
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onRemoveFavorite(link)
                  }}
                >
                  <X size={14} />
                </button>
              </>
            ) : isHomeEditMode ? (
              <button
                type="button"
                className="home-card-icon-btn"
                title="Редактировать ссылку"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  onEditHomeLink(link)
                }}
              >
                <Pencil size={14} />
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className={`home-card-icon-btn ${isFavoriteLink(link) ? 'is-active' : ''}`}
                  title={isFavoriteLink(link) ? 'Убрать из избранного' : 'Добавить в избранное'}
                  onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    onToggleFavorite(link, currentHomeGroup?.title || '')
                  }}
                >
                  <Star size={14} fill={isFavoriteLink(link) ? 'currentColor' : 'none'} />
                </button>
                <ExternalLink size={14} />
              </>
            )}
          </div>
        </div>
        <p>{link.desc || ''}</p>
        <div className="home-neon-card-footer">
          <span className={`home-neon-link-text ${link.href.replace(/^https?:\/\//, '').replace(/\/$/, '').length < 26 ? 'is-short' : ''}`}>
            {link.href.replace(/^https?:\/\//, '').replace(/\/$/, '')}
          </span>
          <StatusIndicator url={link.href} />
        </div>
      </div>
    </motion.a>
  )
}
