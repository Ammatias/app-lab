import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Loader2, Monitor, X } from 'lucide-react'
import { usePortalToast } from '../../../app/providers'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { fetchEcpInstallJobStatus, fetchEcpInstallTarget, startEcpInstall } from '../api'
import { installStatusPresentation, isRunnableTarget, selectDefaultTarget, validateContainerPin } from '../lib/ecpInstall'
import { EcpInstallDiagnostic } from './EcpInstallDiagnostic'
import { EcpContainerPinField } from './EcpContainerPinField'

export function EcpInstallAction({ item, compact = false }) {
  const notify = usePortalToast()
  const [phase, setPhase] = useState('idle')
  const [chooserOpen, setChooserOpen] = useState(false)
  const [targets, setTargets] = useState([])
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [containerPin, setContainerPin] = useState('')
  const [job, setJob] = useState(null)
  const notifiedJobRef = useRef('')
  const presentation = useMemo(() => installStatusPresentation(job), [job])
  const hasPublicKey = Boolean(item.file_visible && item.file_data)
  const hasPrivateKey = Boolean(item.private_file_visible && item.private_file_name)

  const warn = (message) => notify({ kind: 'warning', title: 'Установка ЭЦП недоступна', message })

  const prepare = async (event) => {
    event.stopPropagation()
    if (!hasPublicKey || !hasPrivateKey) {
      const missing = [!hasPublicKey && 'открытый ключ', !hasPrivateKey && 'закрытый ключ ZIP'].filter(Boolean).join(' и ')
      warn(`В записи отсутствует ${missing}. Добавьте полный комплект ключей.`)
      return
    }

    setPhase('loading')
    setContainerPin('')
    try {
      const result = await fetchEcpInstallTarget(item.id)
      setJob(result.latest_job || null)
      const runnableTargets = (result.targets || []).filter(isRunnableTarget)
      setTargets(result.targets || [])
      setSelectedAgentId(selectDefaultTarget(result.targets))
      if (!result.ready || runnableTargets.length === 0) {
        warn(result.message || 'Нет доступного компьютера с активным пользователем Windows.')
        setPhase('idle')
      } else if (runnableTargets.length === 1) {
        setSelectedAgentId(runnableTargets[0].agent_id)
        setPhase('confirm')
      } else {
        setChooserOpen(true)
        setPhase('idle')
      }
    } catch (error) {
      notify({ kind: 'error', title: 'Проверка не выполнена', message: error.message })
      setPhase('idle')
    }
  }

  const cancel = (event) => {
    event?.stopPropagation()
    setPhase('idle')
    setContainerPin('')
    notify({ kind: 'info', title: 'Установка отменена', message: `ЭЦП «${item.title}» не устанавливалась.` })
  }

  const submit = async (event) => {
    event.stopPropagation()
    if (!selectedAgentId) return
    const pinError = validateContainerPin(containerPin)
    if (pinError) {
      notify({ kind: 'warning', title: 'Проверьте пароль ЭЦП', message: pinError })
      return
    }
    setPhase('submitting')
    try {
      const result = await startEcpInstall(item.id, selectedAgentId, containerPin)
      setContainerPin('')
      setJob(result.job)
      setPhase('working')
      notify({
        kind: 'info',
        title: 'Задание отправлено',
        message: `Устанавливаем ЭЦП «${item.title}» выбранному сотруднику.`
      })
    } catch (error) {
      notify({ kind: 'error', title: 'Установка не началась', message: error.message })
      setContainerPin('')
      setPhase('idle')
    }
  }

  useEffect(() => {
    if (!job || !['queued', 'running'].includes(job.status)) return undefined
    const timer = window.setInterval(async () => {
      try {
        const result = await fetchEcpInstallJobStatus(job.id)
        setJob(result.job || null)
      } catch (error) {
        notify({ kind: 'error', title: 'Статус установки недоступен', message: error.message })
      }
    }, 3000)
    return () => window.clearInterval(timer)
  }, [job?.id, job?.status])

  useEffect(() => {
    if (!job || !['succeeded', 'failed', 'expired'].includes(job.status) || notifiedJobRef.current === job.id) return
    notifiedJobRef.current = job.id
    notify({
      kind: job.status === 'succeeded' ? 'success' : 'error',
      title: job.status === 'succeeded' ? presentation?.label : 'Установка не завершена',
      message: job.message || presentation?.label || 'Получен итоговый статус установки.'
    })
    setPhase('idle')
    setContainerPin('')
  }, [job, presentation])

  const chooseTarget = (event) => {
    event.stopPropagation()
    if (!selectedAgentId) return
    setChooserOpen(false)
    setPhase('confirm')
  }

  return (
    <div className={`ecp-install-inline${compact ? ' is-compact' : ''}`} onClick={(event) => event.stopPropagation()}>
      {phase === 'confirm' ? (
        <div className="ecp-install-confirm-block">
          <EcpContainerPinField id={`ecp-pin-${item.id}`} value={containerPin} onChange={setContainerPin} compact={compact} />
          <div className="ecp-install-confirm-pair" role="group" aria-label="Подтверждение установки ЭЦП">
            <button type="button" className="btn ecp-install-confirm-yes" onClick={submit}>
              <Check size={compact ? 14 : 17} /> Установить
            </button>
            <button type="button" className="btn ecp-install-confirm-no" onClick={cancel}>
              <X size={compact ? 14 : 17} /> Не устанавливать
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className={`btn ecp-install-trigger${compact ? ' is-compact' : ''}`}
          onClick={prepare}
          disabled={['loading', 'submitting', 'working'].includes(phase)}
          title="Установить ЭЦП владельцу записи"
        >
          {['loading', 'submitting', 'working'].includes(phase)
            ? <Loader2 className="spin" size={compact ? 14 : 18} />
            : <Monitor size={compact ? 14 : 18} />}
          {phase === 'loading' ? 'Проверяем…' : phase === 'submitting' ? 'Отправляем…' : phase === 'working' ? (presentation?.label || 'Выполняется…') : (compact ? 'Установить' : 'Установить на ПК')}
        </button>
      )}

      <EcpInstallDiagnostic job={job} />

      <ModalShell open={chooserOpen} onClose={() => setChooserOpen(false)} panelClassName="glass-panel modal-panel ecp-install-dialog">
        <div role="dialog" aria-modal="true" aria-labelledby={`ecp-target-title-${item.id}`}>
          <div className="ecp-install-dialog-head">
            <div>
              <span className="ecp-install-kicker">Прямая установка владельцу</span>
              <h2 id={`ecp-target-title-${item.id}`}>Выберите компьютер</h2>
              <p>{item.title}</p>
            </div>
            <button type="button" className="ecp-install-close" onClick={() => setChooserOpen(false)} aria-label="Закрыть"><X size={20} /></button>
          </div>
          <fieldset className="ecp-install-targets">
            <legend>Компьютер владельца ЭЦП</legend>
            {targets.map((target) => {
              const runnable = isRunnableTarget(target)
              return (
                <label key={target.agent_id} className={`ecp-install-target${runnable ? '' : ' is-disabled'}`}>
                  <input type="radio" name={`ecp-target-${item.id}`} value={target.agent_id}
                    checked={selectedAgentId === target.agent_id} disabled={!runnable}
                    onChange={() => setSelectedAgentId(target.agent_id)} />
                  <Monitor size={19} />
                  <span><strong>{target.hostname}</strong><small>{runnable ? 'Готов к установке' : 'Сейчас недоступен'}</small></span>
                </label>
              )
            })}
          </fieldset>
          <div className="ecp-install-actions">
            <button type="button" className="btn" onClick={() => setChooserOpen(false)}>Отмена</button>
            <button type="button" className="btn btn-primary" onClick={chooseTarget} disabled={!selectedAgentId}>Выбрать</button>
          </div>
        </div>
      </ModalShell>
    </div>
  )
}
