import { memo } from 'react'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { PasswordCard } from './PasswordCard'
import { PasswordRow } from './PasswordRow'

const PasswordsPageComponent = ({
  viewMode,
  loading,
  items,
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <section className="passwords-page">
        <LoadingState />
      </section>
    )
  }

  return (
    <section className="passwords-page">
      {items.length === 0 ? (
        <EmptyState panel={true}>По текущему фильтру ничего не найдено.</EmptyState>
      ) : viewMode === 'list' ? (
        <div className="passwords-list">
          {items.map((item) => (
            <PasswordRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      ) : (
        <div className="passwords-grid">
          {items.map((item) => (
            <PasswordCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  )
}

export default memo(PasswordsPageComponent)
