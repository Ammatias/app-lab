import { motion } from 'framer-motion'
import { iconActionStyle } from '../lib/motion'

export function ActionIconButton({
  children,
  onClick,
  title,
  hoverColor = 'var(--accent)',
  rotate = 0,
  scale = 1.12,
  disabled = false,
  style = {},
  whileTap
}) {
  return (
    <motion.button
      onClick={onClick}
      title={title}
      disabled={disabled}
      style={{
        ...iconActionStyle,
        opacity: disabled ? 0.5 : iconActionStyle.opacity,
        cursor: disabled ? 'not-allowed' : iconActionStyle.cursor,
        ...style
      }}
      whileHover={disabled ? undefined : { scale, rotate, color: hoverColor }}
      whileTap={disabled ? undefined : whileTap}
    >
      {children}
    </motion.button>
  )
}
