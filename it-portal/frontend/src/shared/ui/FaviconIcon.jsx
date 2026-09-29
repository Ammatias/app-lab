import { memo, useState } from 'react'
import {
  Bot,
  BrainCircuit,
  Cloud,
  Globe,
  Landmark,
  Mail,
  MessagesSquare,
  Package,
  Phone,
  Router,
  Server,
  Shield
} from 'lucide-react'

const homeIconOverrides = [
  { match: ({ host, name }) => host.includes('openwrt') || name.includes('openwrt'), icon: Router, className: 'is-sky' },
  { match: ({ host, name }) => host.includes('portainer') || name.includes('portainer'), icon: Package, className: 'is-indigo' },
  { match: ({ host, name }) => host.includes('auth.') || name.includes('authentik'), icon: Shield, className: 'is-violet' },
  { match: ({ host, name }) => host.includes('chatgpt.com') || name.includes('chatgpt'), icon: Bot, className: 'is-green' },
  { match: ({ host, name }) => host.includes('deepseek') || name.includes('deepseek'), icon: BrainCircuit, className: 'is-blue' },
  { match: ({ host, name }) => host.includes('claude.com') || name.includes('claude'), icon: MessagesSquare, className: 'is-orange' },
  { match: ({ host, name }) => host.includes('gosuslugi') || name.includes('госуслуги') || name.includes('gosweb'), icon: Shield, className: 'is-blue' },
  { match: ({ host, name }) => host.includes('roskazna') || name.includes('казначейство') || name.includes('фзс') || name.includes('соби'), icon: Landmark, className: 'is-gold' },
  { match: ({ host, name }) => host.includes('cloudpbx') || name.includes('атс'), icon: Phone, className: 'is-sky' },
  { match: ({ host, name }) => host.includes('mail.ru') || name.includes('почта'), icon: Mail, className: 'is-blue' },
  { match: ({ host, name }) => host.includes('ideco') || name.includes('ideco'), icon: Shield, className: 'is-indigo' },
  { match: ({ host, name }) => host.includes('asustor') || name.includes('asustor') || host.includes('homepage.work') || name.includes('it-портал'), icon: Server, className: 'is-slate' },
  { match: ({ host, name }) => host.includes('npm.') || name.includes('nginx proxy manager'), icon: Cloud, className: 'is-sky' },
  { match: ({ name }) => name.includes('справочник'), icon: Phone, className: 'is-green' }
]

const resolveHomeIconOverride = (url, name = '') => {
  const normalizedName = String(name || '').trim().toLowerCase()
  let host = ''

  try {
    host = new URL(String(url || '').trim()).hostname.toLowerCase()
  } catch {
    host = ''
  }

  return homeIconOverrides.find((entry) => entry.match({ host, name: normalizedName })) || null
}

const FaviconIconComponent = ({ url, fallback: FallbackIcon, alt, name }) => {
  const normalizedUrl = String(url || '').trim()
  const [sourceIndex, setSourceIndex] = useState(0)
  const iconOverride = resolveHomeIconOverride(normalizedUrl, name)

  if (!normalizedUrl) {
    return <FallbackIcon size={20} />
  }

  const origin = (() => {
    try {
      return new URL(normalizedUrl).origin
    } catch {
      return ''
    }
  })()

  if (iconOverride) {
    const IconComponent = iconOverride.icon
    return (
      <span className={`site-icon-badge ${iconOverride.className || ''}`} aria-label={alt}>
        <IconComponent size={18} />
      </span>
    )
  }

  const sources = [
    `/api/proxy/favicon?url=${encodeURIComponent(normalizedUrl)}`,
    `https://www.google.com/s2/favicons?sz=64&domain_url=${encodeURIComponent(normalizedUrl)}`,
    `https://icons.duckduckgo.com/ip3/${encodeURIComponent(origin || normalizedUrl)}.ico`,
    origin ? `${origin}/favicon.ico` : '',
    origin ? `${origin}/apple-touch-icon.png` : '',
    origin ? `${origin}/favicon-32x32.png` : '',
    origin ? `${origin}/favicon-16x16.png` : ''
  ].filter(Boolean)

  if (!sources[sourceIndex]) {
    return <FallbackIcon size={20} />
  }

  return (
    <img
      src={sources[sourceIndex]}
      alt={alt}
      className="site-favicon"
      loading="lazy"
      onError={() => setSourceIndex((prev) => prev + 1)}
    />
  )
}

export const FaviconIcon = memo(FaviconIconComponent)
