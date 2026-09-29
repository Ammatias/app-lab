import '../styles/network-modals.css'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { ShieldBan, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function DomainBlockModal({ contact, onClose }) {
  const [domain, setDomain] = useState('')
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const [state, setState] = useState(null)
  const dialog = useRef(null)
  const pending = useRef(false)
  const closeState = useRef({ busy, onClose })
  closeState.current = { busy, onClose }
  const url = `/api/phonebook/${contact.id}/domain-block`

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    fetch(url, { credentials: 'include', signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error(await response.text() || 'Не удалось получить список сайтов')
        return response.json()
      })
      .then(setState)
      .catch((failure) => { if (!controller.signal.aborted) setError(failure.message) })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [url])

  useEffect(() => {
    const previous = document.activeElement
    const handleKey = (event) => {
      if (event.key === 'Escape' && !closeState.current.busy) closeState.current.onClose()
      if (event.key === 'Tab') {
        const controls = [...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled)')]
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (!first) { event.preventDefault(); return }
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
      }
    }
    document.addEventListener('keydown', handleKey)
    return () => { document.removeEventListener('keydown', handleKey); previous?.focus?.() }
  }, [])

  const changeDomain = async (method, value) => {
    if (pending.current) return
    pending.current = true
    setBusy(true)
    setError('')
    setResult('')
    try {
      const response = await fetch(url, {
        method, credentials: 'include', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: value })
      })
      if (!response.ok) throw new Error(await response.text() || 'Не удалось изменить блокировку')
      const updated = await response.json()
      setState(updated)
      if (method === 'POST') setDomain('')
      setResult(method === 'DELETE'
        ? `Блокировка ${updated.domain} снята для ${updated.ip}. Другие правила сети могут по-прежнему ограничивать доступ.`
        : `Домен ${updated.domain} и его поддомены заблокированы для ${updated.ip}.`)
    } catch (failure) {
      setError(failure.message || 'Не удалось связаться с сервером')
    } finally { pending.current = false; setBusy(false) }
  }

  return (
    <ModalShell open onClose={() => !busy && onClose()} panelClassName="glass-panel modal-panel network-limit-modal" panelStyle={{ width: 'min(500px, calc(100vw - 32px))' }}>
      <form ref={dialog} className="network-limit-modal-content" role="dialog" aria-modal="true"
        aria-labelledby="domain-block-title" onSubmit={(event) => { event.preventDefault(); changeDomain('POST', domain.trim()) }}>
        <button type="button" className="network-limit-modal-close" disabled={busy} onClick={onClose} aria-label="Закрыть"><X size={17} /></button>
        <header className="network-limit-modal-header">
          <span className="network-limit-modal-icon" aria-hidden="true"><ShieldBan size={24} /></span>
          <h2 id="domain-block-title">Блокировка сайтов</h2>
          <strong>{contact.name}</strong>
          <div className="network-limit-modal-host">{state?.ip || contact.tactical_agent_local_ips}</div>
        </header>
        <section className="domain-block-list" aria-label="Заблокированные сайты" aria-busy={loading || busy}>
          <h3>Заблокированные сайты</h3>
          {loading ? <p>Загружаю список…</p> : state ? <>
            {state.domains.length === 0 ? <p>Для этого IP блокировок из портала нет.</p> : <>
              {!state.enabled && <p>Персональное правило или контент-фильтр выключен в Ideco.</p>}
              <ul>{state.domains.map((site) => <li key={site}>
                <span>{site}</span>
                <button type="button" disabled={busy} onClick={() => changeDomain('DELETE', site)} aria-label={`Разблокировать ${site}`}>Разблокировать</button>
              </li>)}</ul>
            </>}
          </> : <p>Список недоступен. Закройте окно и повторите попытку.</p>}
        </section>
        <label className="network-limit-modal-field">
          <span>Добавить домен и его поддомены</span>
          <div><input autoFocus required maxLength={253} value={domain} disabled={busy || loading || !state}
            placeholder="example.org" autoCapitalize="none" spellCheck={false}
            onChange={(event) => setDomain(event.target.value)} /></div>
        </label>
        {error && <p className="network-limit-modal-error" role="alert">{error}</p>}
        {result && <p role="status">{result}</p>}
        <footer className="network-limit-modal-actions">
          <button type="button" className="network-limit-modal-cancel" disabled={busy} onClick={onClose}>Закрыть</button>
          <button type="submit" className="network-limit-modal-apply" disabled={busy || loading || !state || !domain.trim()}>
            {busy ? 'Применение…' : 'Заблокировать'}
          </button>
        </footer>
      </form>
    </ModalShell>
  )
}
