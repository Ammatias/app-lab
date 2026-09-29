import { ExternalLink, Network } from 'lucide-react'
import { FaviconIcon } from '../../../shared/ui/FaviconIcon'
import { StatusIndicator } from '../../../shared/ui/StatusIndicator'
import { homeGroupIcons } from '../config/homeGroupIcons'

export function HomeLinkListItem({ group, link, compact }) {
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noreferrer"
      className={`item-card home-link-item ${compact ? 'is-compact' : ''}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, overflow: 'hidden', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="home-link-favicon-wrap">
            <FaviconIcon
              url={link.href}
              fallback={homeGroupIcons[group.iconKey || group.title] || Network}
              alt={`${link.name} favicon`}
              name={link.name}
            />
          </span>
          <span className="home-link-title">{link.name}</span>
          <ExternalLink size={12} color="var(--accent)" style={{ opacity: 0.4 }} />
        </div>
        <span className="home-link-subtitle">{link.desc || ''}</span>
      </div>
      <StatusIndicator url={link.href} />
    </a>
  )
}
