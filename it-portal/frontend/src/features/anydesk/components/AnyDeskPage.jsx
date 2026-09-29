import { memo } from 'react'
import RecordsPage from '../../records/components/RecordsPage'

const AnyDeskPageComponent = ({ viewMode, items, onEdit, onDelete }) => (
  <RecordsPage
    activeTab="anydesk"
    viewMode={viewMode}
    items={items}
    onEdit={onEdit}
    onDelete={onDelete}
  />
)

export default memo(AnyDeskPageComponent)
