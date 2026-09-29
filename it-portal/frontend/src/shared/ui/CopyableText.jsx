import { memo, useState } from 'react'
import { Check, Copy } from 'lucide-react'

const CopyableTextComponent = ({ text, hidden = false, label = '', large = false }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (event) => {
    event.stopPropagation()
    if (!text) return
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      className={`copyable-item ${hidden ? 'password-mask' : ''}`}
      onClick={handleCopy}
      title="Нажмите, чтобы скопировать"
      style={{ padding: large ? '12px 18px' : '10px 14px' }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', width: '100%' }}>
        {label && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{label}</span>}
        <span
          className={hidden ? 'pwd-text' : 'normal-text'}
          style={{
            fontSize: large ? '1.2rem' : 'inherit',
            fontWeight: large ? '600' : 'normal',
            letterSpacing: large && hidden ? '2px' : 'normal',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            flex: 1
          }}
        >
          {text || 'Пусто'}
        </span>
        {copied ? <Check size={18} color="#4ade80" /> : <Copy size={16} className="copy-icon" />}
      </div>
      {copied && <span className="copied-tooltip">Скопировано!</span>}
    </div>
  )
}

export const CopyableText = memo(CopyableTextComponent)
