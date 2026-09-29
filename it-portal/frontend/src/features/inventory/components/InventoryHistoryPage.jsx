import { InventoryHistoryModal } from './InventoryHistoryModal'

export default function InventoryHistoryPage({ onBack, ...props }) {
  return <InventoryHistoryModal {...props} open={true} onClose={onBack} pageMode={true} onBack={onBack} />
}
