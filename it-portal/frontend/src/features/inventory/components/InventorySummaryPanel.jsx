import { Package } from 'lucide-react'
import { InventoryModelsGrid } from './InventoryModelsGrid'

export function InventorySummaryPanel({ groupedInventory, onEditModel, onDeleteModel }) {
  return (
    <div className="inventory-summary-card glass-panel" style={{ padding: '24px' }}>
      <div className="panel-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Package size={22} color="var(--accent)" />
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Склад</h3>
            <div className="inventory-panel-subtitle">Остатки по типам картриджей и их конкретным модификациям.</div>
          </div>
        </div>
      </div>
      <InventoryModelsGrid groupedInventory={groupedInventory} onEditModel={onEditModel} onDeleteModel={onDeleteModel} />
    </div>
  )
}
