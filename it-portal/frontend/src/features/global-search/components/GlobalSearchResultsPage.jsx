import { memo } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'
import { containerVariants } from '../../../shared/lib/motion'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { GlobalResultCard } from './GlobalResultCard'

const GlobalSearchResultsPageComponent = ({
  isReady,
  loading,
  results,
  onOpenEdit,
  onDelete
}) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="content-stack search-results-stack"
    >
      <div className="section-title-row">
        <Search size={24} color="var(--accent)" />
        <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Результаты сверх-поиска</h2>
      </div>
      <div className="results-grid">
        {!isReady ? (
          <EmptyState panel={true} style={{ gridColumn: '1 / -1' }}>Введите минимум 2 символа для сверх-поиска.</EmptyState>
        ) : loading ? (
          <EmptyState panel={true} style={{ gridColumn: '1 / -1' }}>Сверх-поиск загружает данные базы и домашней страницы...</EmptyState>
        ) : results.length === 0 ? (
          <EmptyState panel={true} style={{ gridColumn: '1 / -1' }}>По вашему запросу ничего не найдено ни в одной из баз.</EmptyState>
        ) : (
          results.map((item, index) => (
            <GlobalResultCard
              key={`${item.type || 'result'}-${item.id || item.title || index}-${index}`}
              item={item}
              onOpenEdit={onOpenEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </motion.div>
  )
}

export const GlobalSearchResultsPage = memo(GlobalSearchResultsPageComponent)
