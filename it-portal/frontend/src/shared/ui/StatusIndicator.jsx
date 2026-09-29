import { memo, useEffect, useState } from 'react'

const StatusIndicatorComponent = ({ url }) => {
  const [status, setStatus] = useState('loading')
  const [latency, setLatency] = useState(0)

  useEffect(() => {
    let active = true

    const check = async () => {
      try {
        const res = await fetch(`/api/proxy/ping?url=${encodeURIComponent(url)}`)
        if (res.ok && active) {
          const data = await res.json()
          setStatus(data.status)
          setLatency(data.latency)
        } else if (active) {
          setStatus('offline')
        }
      } catch {
        if (active) setStatus('offline')
      }
    }

    check()
    const timer = setInterval(check, 30000)
    return () => {
      active = false
      clearInterval(timer)
    }
  }, [url])

  return (
    <div
      className="status-indicator"
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
      }}
    >
      <div
        className={`status-indicator-dot ${status === 'online' ? 'is-online' : status === 'offline' ? 'is-offline' : 'is-loading'}`}
      ></div>
      <span className="status-indicator-text">
        {status === 'loading' ? 'ping...' : status === 'online' ? `${latency}ms` : 'down'}
      </span>
    </div>
  )
}

export const StatusIndicator = memo(StatusIndicatorComponent)
