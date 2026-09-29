import { memo } from 'react'
import RecordsPage from '../../records/components/RecordsPage'

const EcpPageComponent = ({ viewMode, items, onEdit, onDelete }) => (
  <RecordsPage
    activeTab="ecp"
    viewMode={viewMode}
    items={items}
    onEdit={onEdit}
    onDelete={onDelete}
  />
)

export default memo(EcpPageComponent)
