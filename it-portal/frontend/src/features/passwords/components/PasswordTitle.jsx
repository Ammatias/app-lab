import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export function PasswordTitle({ title }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [exceedsThreeLines, setExceedsThreeLines] = useState(false)
  const measureRef = useRef(null)

  useEffect(() => {
    const updateOverflowState = () => {
      const node = measureRef.current
      if (!node) return

      const lineHeight = Number.parseFloat(window.getComputedStyle(node).lineHeight) || 0
      if (!lineHeight) return

      setExceedsThreeLines(node.scrollHeight - lineHeight * 3 > 1)
    }

    const frameId = window.requestAnimationFrame(updateOverflowState)
    window.addEventListener('resize', updateOverflowState)

    return () => {
      window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', updateOverflowState)
    }
  }, [title])

  const showPreview = exceedsThreeLines && !isExpanded

  return (
    <div className="password-title-wrap">
      <h3 aria-hidden="true" ref={measureRef} className="password-card-title password-card-title--measure">{title}</h3>
      <h3 className={`password-card-title ${showPreview ? 'is-preview' : ''}`}>{title}</h3>
      {exceedsThreeLines && (
        <button
          type="button"
          className={`password-title-toggle ${isExpanded ? 'is-open' : ''}`}
          onClick={() => setIsExpanded((value) => !value)}
        >
          <ChevronDown size={14} />
          {isExpanded ? 'свернуть' : 'раскрыть'}
        </button>
      )}
    </div>
  )
}
