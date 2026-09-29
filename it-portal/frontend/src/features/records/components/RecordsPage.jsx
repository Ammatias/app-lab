import { memo } from 'react'
import { motion } from 'framer-motion'
import { containerVariants } from '../../../shared/lib/motion'
import { LoadingState } from '../../../shared/ui/LoadingState'
import { RecordGrid } from './RecordGrid'
import { RecordList } from './RecordList'

const RecordsPageComponent = ({ activeTab, viewMode, loading, items, onEdit, onDelete }) => {
  if (loading) {
    return <LoadingState />
  }

  return (
    <motion.div
      key={`${activeTab}-${viewMode}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={`records-grid ${viewMode === 'list' ? 'is-list' : 'is-grid'}`}
      style={{
        display: 'grid',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(320px, 1fr))' : '1fr',
        gap: viewMode === 'grid' ? '20px' : '12px'
      }}
    >
      {viewMode === 'list' ? (
        <RecordList activeTab={activeTab} items={items} onEdit={onEdit} onDelete={onDelete} />
      ) : (
        <RecordGrid activeTab={activeTab} items={items} onEdit={onEdit} onDelete={onDelete} />
      )}
    </motion.div>
  )
}

export default memo(RecordsPageComponent)
