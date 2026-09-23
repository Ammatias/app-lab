'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BrandMark } from '@/components/ui/brand-mark'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSignIn = async () => {
    setLoading(true)
    setError(null)
    try {
      await signIn('authentik', { callbackUrl: '/dashboard' })
    } catch (signInError) {
      console.error('Sign in error:', signInError)
      setError('Не удалось начать вход. Обновите страницу и попробуйте ещё раз.')
      setLoading(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,transparent_48%,rgba(70,87,217,0.08)_48%,rgba(70,87,217,0.08)_52%,transparent_52%)]" aria-hidden="true" />
      <section className="relative w-full max-w-md rounded-3xl border bg-card p-6 shadow-[0_24px_80px_rgba(24,32,43,0.12)] sm:p-8">
        <div className="flex items-center gap-3">
          <BrandMark size="lg" priority />
          <div><p className="font-semibold">Ammatias</p><p className="text-xs text-muted-foreground">панель сайтов</p></div>
        </div>

        <div className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Защищённый вход</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Продолжить работу</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Войдите через Authentik, чтобы управлять сайтами, контентом и историей сборок.</p>
        </div>

        {error && <p role="alert" className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

        <Button onClick={handleSignIn} disabled={loading} className="mt-8 w-full" size="lg">
          {loading ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />Переходим в Authentik…</> : <>Войти через Authentik<ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" /></>}
        </Button>
      </section>
    </main>
  )
}
