import { AnimatePresence, motion } from 'framer-motion'
import { itemVariants } from '../../../shared/lib/motion'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { RecordCard } from './RecordCard'

export function RecordGrid({ activeTab, items, onEdit, onDelete }) {
  return (
    <>
      <AnimatePresence>
        {items.map((item) => (
          <motion.div
            key={`${item.type}-${item.id}`}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="glass-panel item-card record-card"
            style={{ padding: '20px', position: 'relative' }}
          >
            <RecordCard activeTab={activeTab} item={item} onEdit={onEdit} onDelete={onDelete} />
          </motion.div>
        ))}
      </AnimatePresence>
      {items.length === 0 && <EmptyState style={{ gridColumn: '1 / -1' }}>Ничего не найдено.</EmptyState>}
    </>
  )
}
