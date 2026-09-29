import { useCallback, useEffect, useState } from 'react'

function getWindowLocationState() {
  if (typeof window === 'undefined') {
    return {
      pathname: '/home',
      search: '',
      hash: ''
    }
  }

  return {
    pathname: window.location.pathname || '/home',
    search: window.location.search || '',
    hash: window.location.hash || ''
  }
}

export function usePortalRouter() {
  const [locationState, setLocationState] = useState(getWindowLocationState)

  useEffect(() => {
    const handlePopState = () => {
      setLocationState(getWindowLocationState())
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const navigate = useCallback((nextUrl, { replace = false } = {}) => {
    if (typeof window === 'undefined') {
      return
    }

    const targetUrl = String(nextUrl || '').trim() || '/home'
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`

    if (targetUrl !== currentUrl) {
      window.history[replace ? 'replaceState' : 'pushState']({}, '', targetUrl)
    }

    setLocationState(getWindowLocationState())
  }, [])

  return {
    location: locationState,
    navigate
  }
}
