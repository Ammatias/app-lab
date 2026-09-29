import { EmptyState } from '../../../shared/ui/EmptyState'
import { InventoryModelGroupCard } from './InventoryModelGroupCard'

export function InventoryModelsGrid({ groupedInventory, onEditModel, onDeleteModel }) {
  if (groupedInventory.length === 0) {
    return (
      <EmptyState panel={true} style={{ padding: '18px', color: 'var(--text-muted)' }}>
        По текущему запросу на складе ничего не найдено.
      </EmptyState>
    )
  }

  return (
    <div className="inventory-grid">
      {groupedInventory.map((group, index) => (
        <InventoryModelGroupCard
          key={`${group.name}-${index}`}
          group={group}
          onEditModel={onEditModel}
          onDeleteModel={onDeleteModel}
        />
      ))}
    </div>
  )
}
