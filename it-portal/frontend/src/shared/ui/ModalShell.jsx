import { useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function ModalShell({
  open,
  onClose,
  overlayClassName = 'modal-overlay modal-overlay-primary',
  overlayStyle = {},
  overlayRef = null,
  panelClassName = 'glass-panel modal-panel',
  panelStyle = {},
  children
}) {
  const shouldCloseOnOverlayClickRef = useRef(false)

  const handleOverlayPointerDown = (event) => {
    shouldCloseOnOverlayClickRef.current = event.target === event.currentTarget
  }

  const handleOverlayClick = (event) => {
    const shouldClose =
      shouldCloseOnOverlayClickRef.current &&
      event.target === event.currentTarget

    shouldCloseOnOverlayClickRef.current = false

    if (shouldClose) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={overlayClassName}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
            ...overlayStyle
          }}
          onPointerDown={handleOverlayPointerDown}
          onClick={handleOverlayClick}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className={panelClassName}
            style={panelStyle}
            onClick={(event) => event.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
