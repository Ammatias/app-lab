import { Loader2 } from 'lucide-react'

export function LoadingState({ size = 40, padding = '50px', fullscreen = false }) {
  return (
    <div
      className="loading-state"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding,
        height: fullscreen ? '100vh' : 'auto'
      }}
    >
      <Loader2 className="spinner" size={size} color="var(--accent)" />
    </div>
  )
}
