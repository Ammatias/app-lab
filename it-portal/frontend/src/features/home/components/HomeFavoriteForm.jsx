import { Pencil, Plus } from 'lucide-react'

export function HomeFavoriteForm({
  favoriteDraft,
  onDraftChange,
  onSubmit,
  onCancel,
  isEditingBaseLink
}) {
  return (
    <form className="glass-panel home-favorite-form home-favorite-form-inline" onSubmit={onSubmit}>
      <input
        type="text"
        className="input-glass"
        placeholder="Название"
        value={favoriteDraft.name}
        onChange={(event) => onDraftChange('name', event.target.value)}
      />
      <input
        type="text"
        className="input-glass"
        placeholder="https://example.ru"
        value={favoriteDraft.href}
        onChange={(event) => onDraftChange('href', event.target.value)}
      />
      <input
        type="text"
        className="input-glass"
        placeholder="Короткое описание"
        value={favoriteDraft.desc}
        onChange={(event) => onDraftChange('desc', event.target.value)}
      />
      <div className="home-favorite-form-actions">
        <button type="submit" className="btn btn-primary">
          {isEditingBaseLink ? <Pencil size={14} /> : <Plus size={14} />} Сохранить
        </button>
        <button type="button" className="btn" onClick={onCancel}>
          Отмена
        </button>
      </div>
    </form>
  )
}
