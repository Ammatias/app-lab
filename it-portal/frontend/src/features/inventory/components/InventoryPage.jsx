import { memo } from 'react'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { InventorySummaryPanel } from './InventorySummaryPanel'
import { PrintersTable } from './PrintersTable'

const InventoryPageComponent = ({
  groupedInventory,
  filteredPrinters,
  loading,
  onEditModel,
  onDeleteModel,
  onEditPrinter,
  onDeletePrinter,
  onInstall,
  installingCartridgeKey
}) => {
  if (loading) {
    return <LoadingState />
  }

  return (
    <div className="cartridges-container cartridges-layout" style={{ display: 'grid', gridTemplateColumns: '480px 1fr', gap: '25px', alignItems: 'start' }}>
      <InventorySummaryPanel
        groupedInventory={groupedInventory}
        onEditModel={onEditModel}
        onDeleteModel={onDeleteModel}
      />
      <PrintersTable
        filteredPrinters={filteredPrinters}
        onInstall={onInstall}
        installingCartridgeKey={installingCartridgeKey}
        onEditPrinter={onEditPrinter}
        onDeletePrinter={onDeletePrinter}
      />
    </div>
  )
}

export default memo(InventoryPageComponent)
