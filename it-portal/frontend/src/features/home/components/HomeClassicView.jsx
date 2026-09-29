import { memo } from 'react'
import { motion } from 'framer-motion'
import { FAVORITES_GROUP_TITLE } from '../config/homeLinkGroups'
import { containerVariants, itemVariants } from '../../../shared/lib/motion'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { HomeLinkListItem } from './HomeLinkListItem'

const HomeClassicViewComponent = ({ filteredHomeGroupTitles, classicHomeGroups }) => {
  return (
    <motion.div
      key={`home-classic-${filteredHomeGroupTitles}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="home-links-layout"
    >
      {classicHomeGroups.length === 0 ? (
        <EmptyState style={{ gridColumn: '1 / -1' }}>По текущему фильтру домашние ссылки не найдены.</EmptyState>
      ) : classicHomeGroups.map((group, index) => {
        const isFavorites = group.isFavorites || group.title === FAVORITES_GROUP_TITLE

        return (
          <motion.div
            key={`${group.groupKey}-${index}`}
            variants={itemVariants}
            className={`glass-panel home-links-group ${isFavorites ? 'is-featured' : ''}`}
          >
            <h2 style={{ fontSize: '1rem', marginBottom: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 'bold' }}>
              <div style={{ width: '3px', height: '18px', background: 'var(--accent)', borderRadius: '2px' }}></div>
              {group.fullTitle || group.title}
            </h2>
            <div className="home-links-list">
              {group.links.map((link, linkIndex) => (
                <HomeLinkListItem
                  key={`${group.groupKey}-${link.name}-${linkIndex}`}
                  group={group}
                  link={link}
                  compact={false}
                />
              ))}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

export const HomeClassicView = memo(HomeClassicViewComponent)
