import { Pencil, Plus, Trash2 } from 'lucide-react'

const LINK_FORM_MODES = new Set(['favorite', 'create-link', 'edit-link'])

export function HomeEditorForm({
  mode,
  homeLinkDraft,
  homeGroupDraft,
  groupContextLabel,
  onLinkDraftChange,
  onGroupDraftChange,
  onSubmit,
  onCancel,
  onDelete
}) {
  const isLinkForm = LINK_FORM_MODES.has(mode)
  const isEditLink = mode === 'edit-link'
  const isFavoriteForm = mode === 'favorite'
  const title = mode === 'create-group'
    ? 'Новая подгруппа'
    : isEditLink
      ? 'Редактирование ссылки'
      : isFavoriteForm
        ? 'Ссылка в избранное'
        : 'Новая ссылка'

  return (
    <form className="glass-panel home-favorite-form home-favorite-form-inline home-editor-form" onSubmit={onSubmit}>
      <div className="home-editor-form-header">
        <strong>{title}</strong>
        {groupContextLabel ? <span>{groupContextLabel}</span> : null}
      </div>

      {isLinkForm ? (
        <>
          <input
            type="text"
            className="input-glass"
            placeholder="Название"
            value={homeLinkDraft.name}
            onChange={(event) => onLinkDraftChange('name', event.target.value)}
          />
          <input
            type="text"
            className="input-glass"
            placeholder="https://example.ru"
            value={homeLinkDraft.href}
            onChange={(event) => onLinkDraftChange('href', event.target.value)}
          />
          <input
            type="text"
            className="input-glass"
            placeholder="Короткое описание"
            value={homeLinkDraft.desc}
            onChange={(event) => onLinkDraftChange('desc', event.target.value)}
          />
        </>
      ) : (
        <input
          type="text"
          className="input-glass"
          placeholder="Название подгруппы"
          value={homeGroupDraft.title}
          onChange={(event) => onGroupDraftChange(event.target.value)}
        />
      )}

      <div className="home-favorite-form-actions">
        <button type="submit" className="btn btn-primary">
          {isEditLink ? <Pencil size={14} /> : <Plus size={14} />} Сохранить
        </button>
        {isEditLink && onDelete ? (
          <button type="button" className="btn home-editor-delete-btn" onClick={onDelete}>
            <Trash2 size={14} /> Удалить
          </button>
        ) : null}
        <button type="button" className="btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  )
}
