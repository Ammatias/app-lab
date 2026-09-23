'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

export function NavigationGuard({ when }: { when: boolean }) {
  const router = useRouter()
  const [pendingHref, setPendingHref] = useState<string | null>(null)

  useEffect(() => {
    if (!when) return

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }

    const handleDocumentClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      const target = event.target as Element | null
      const anchor = target?.closest<HTMLAnchorElement>('a[href]')
      if (!anchor || anchor.target === '_blank' || anchor.hasAttribute('download')) return

      const nextUrl = new URL(anchor.href, window.location.href)
      if (nextUrl.origin !== window.location.origin) return
      if (`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}` === `${window.location.pathname}${window.location.search}${window.location.hash}`) return

      event.preventDefault()
      setPendingHref(`${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`)
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('click', handleDocumentClick, true)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('click', handleDocumentClick, true)
    }
  }, [when])

  return (
    <Dialog
      open={Boolean(pendingHref)}
      onOpenChange={(open) => { if (!open) setPendingHref(null) }}
      title="Есть несохранённые изменения"
      description="Если уйти со страницы сейчас, изменения будут потеряны."
      actions={
        <>
          <Button type="button" variant="outline" onClick={() => setPendingHref(null)}>Остаться</Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              const href = pendingHref
              setPendingHref(null)
              if (href) router.push(href)
            }}
          >
            Уйти без сохранения
          </Button>
        </>
      }
    />
  )
}
