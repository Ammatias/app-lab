'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Sidebar, type SidebarSite } from '@/components/layout/sidebar'

export function AppShell({
  children,
  sites,
}: {
  children: React.ReactNode
  sites: SidebarSite[]
}) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <Sidebar
        sites={sites}
        mobileOpen={mobileNavigationOpen}
        onMobileClose={() => setMobileNavigationOpen(false)}
      />
      <div className="min-w-0 lg:col-start-2">
        <Header onMenuOpen={() => setMobileNavigationOpen(true)} />
        <main className="mx-auto w-full max-w-[96rem] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
