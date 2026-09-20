'use client'

import { useEffect, useState } from 'react'
import { LogOut, Menu, Moon, Sun, UserCircle } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/ui/brand-mark'

export function Header({ onMenuOpen }: { onMenuOpen: () => void }) {
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('admin-theme')
    const useDark = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.classList.toggle('dark', useDark)
    const frame = window.requestAnimationFrame(() => setDark(useDark))
    return () => window.cancelAnimationFrame(frame)
  }, [])

  const toggleTheme = () => {
    const nextDark = !dark
    document.documentElement.classList.toggle('dark', nextDark)
    window.localStorage.setItem('admin-theme', nextDark ? 'dark' : 'light')
    setDark(nextDark)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center border-b bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <Button type="button" variant="ghost" size="icon" className="mr-2 lg:hidden" onClick={onMenuOpen} aria-label="Открыть меню">
        <Menu className="h-5 w-5" aria-hidden="true" />
      </Button>
      <BrandMark size="sm" className="mr-3 lg:hidden" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Рабочее пространство</p>
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        <Button type="button" variant="ghost" size="icon" onClick={toggleTheme} aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}>
          {dark ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
        </Button>
        <div className="hidden items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm text-muted-foreground sm:flex">
          <UserCircle className="h-5 w-5" aria-hidden="true" />
          <span>Администратор</span>
        </div>
        <Button type="button" variant="ghost" size="icon" onClick={() => signOut({ callbackUrl: '/login' })} aria-label="Выйти">
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </Button>
      </div>
    </header>
  )
}
