import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

const SCROLL_THRESHOLD = 320

export function ScrollTopButton({ targetRef = null }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const scrollTarget = targetRef?.current || window

    const handleScroll = () => {
      const currentOffset = targetRef?.current
        ? targetRef.current.scrollTop
        : window.scrollY

      setVisible(currentOffset > SCROLL_THRESHOLD)
    }

    handleScroll()
    scrollTarget.addEventListener('scroll', handleScroll, { passive: true })

    return () => scrollTarget.removeEventListener('scroll', handleScroll)
  }, [targetRef])

  if (!visible) {
    return null
  }

  return (
    <button
      type="button"
      className="scroll-top-fab"
      onClick={() => {
        if (targetRef?.current) {
          targetRef.current.scrollTo({ top: 0, behavior: 'smooth' })
          return
        }

        window.scrollTo({ top: 0, behavior: 'smooth' })
      }}
      title="Наверх"
      aria-label="Вернуться наверх"
    >
      <ChevronUp size={22} />
    </button>
  )
}
