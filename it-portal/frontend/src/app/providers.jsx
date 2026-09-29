import { createContext, useContext } from 'react'

const PortalToastContext = createContext(() => {})

export function Providers({ children, notify }) {
  return (
    <PortalToastContext.Provider value={notify || (() => {})}>
      {children}
    </PortalToastContext.Provider>
  )
}

export function usePortalToast() {
  const enqueue = useContext(PortalToastContext)
  return ({ kind = 'info', title, message }) => enqueue({
    key: `portal:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`,
    kind,
    title,
    message
  })
}
