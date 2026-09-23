'use client'

import { useEffect, useRef, useState } from 'react'
import { Check, Copy, MoveDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BuildLogViewer({ logs, running }: { logs: string | null; running: boolean }) {
  const [copied, setCopied] = useState(false)
  const viewportRef = useRef<HTMLDivElement>(null)
  const lines = (logs || 'Логи недоступны').split('\n')
  const scrollToEnd = () => viewportRef.current?.scrollTo({ top: viewportRef.current.scrollHeight, behavior: 'smooth' })

  useEffect(() => { if (running) scrollToEnd() }, [logs, running])

  async function copyLogs() {
    await navigator.clipboard.writeText(logs || '')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 2000)
  }

  return <div className="overflow-hidden rounded-2xl border bg-[#101722] text-slate-200 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3"><div><p className="text-sm font-semibold text-white">Вывод процесса</p><p className="mt-0.5 text-xs text-slate-400">{lines.length} строк{running ? ' · обновляется при перезагрузке страницы' : ''}</p></div><div className="flex gap-1"><Button type="button" variant="ghost" size="sm" onClick={scrollToEnd} className="text-slate-300 hover:bg-white/10 hover:text-white"><MoveDown className="mr-2 h-4 w-4" />В конец</Button><Button type="button" variant="ghost" size="sm" onClick={copyLogs} disabled={!logs} className="text-slate-300 hover:bg-white/10 hover:text-white">{copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}{copied ? 'Скопировано' : 'Копировать'}</Button></div></div><div ref={viewportRef} tabIndex={0} aria-label="Лог сборки" className="max-h-[36rem] overflow-auto focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"><ol className="min-w-max py-3 font-mono text-xs leading-6">{lines.map((line, index) => <li key={index} className="grid grid-cols-[3.5rem_minmax(0,1fr)] px-3 hover:bg-white/5"><span className="select-none border-r border-white/10 pr-3 text-right text-slate-600">{index + 1}</span><code className="whitespace-pre pl-4">{line || ' '}</code></li>)}</ol></div></div>
}
