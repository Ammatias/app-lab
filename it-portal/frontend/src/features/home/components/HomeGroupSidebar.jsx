import { Network } from 'lucide-react'
import { homeGroupIcons } from '../config/homeGroupIcons'

export function HomeGroupSidebar({
  filteredHomeGroups,
  currentHomeGroup,
  draggedHomeItemId,
  dropTargetGroupKey,
  onSetActiveHomeGroup,
  onGroupDragOver,
  onGroupDragLeave,
  onGroupDrop
}) {
  const navDensityClass =
    filteredHomeGroups.length >= 9 ? 'is-ultra-dense' : filteredHomeGroups.length >= 6 ? 'is-dense' : ''

  return (
    <div className="home-neon-sidebar glass-panel">
      <div className={`home-neon-nav ${navDensityClass}`.trim()}>
        {filteredHomeGroups.map((group) => {
          const GroupIcon = homeGroupIcons[group.iconKey || group.title] || Network
          const isActive = currentHomeGroup?.groupKey === group.groupKey
          const isDropTarget = dropTargetGroupKey === group.groupKey && Boolean(draggedHomeItemId)

          return (
            <button
              key={group.groupKey}
              className={`home-neon-nav-item ${isActive ? 'is-active' : ''} ${group.depth > 0 ? 'is-subgroup' : ''} ${isDropTarget ? 'is-drop-target' : ''}`}
              onClick={() => onSetActiveHomeGroup(group.groupKey)}
              title={group.fullTitle || group.title}
              style={{ paddingLeft: `${14 + group.depth * 18}px` }}
              onDragOver={draggedHomeItemId ? (event) => onGroupDragOver(event, group.groupKey) : undefined}
              onDragLeave={draggedHomeItemId ? (event) => onGroupDragLeave(event, group.groupKey) : undefined}
              onDrop={draggedHomeItemId ? (event) => onGroupDrop(event, group.groupKey) : undefined}
            >
              <span className="home-neon-nav-icon"><GroupIcon size={18} /></span>
              <span>{group.title}</span>
              <span className="home-neon-nav-count">{group.totalCount ?? group.links.length}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
