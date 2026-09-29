import { EcpInstallDiagnostic } from './EcpInstallDiagnostic'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileKey2,
  KeyRound,
  Loader2,
  Monitor,
  Search,
  UserRound,
  X
} from 'lucide-react'
import { usePortalToast } from '../../../app/providers'
import { ModalShell } from '../../../shared/ui/ModalShell'
import { fetchEcpInstallJobStatus, fetchEcpInstallOptions, startDelegatedEcpInstall } from '../api'
import {
  certificateIssues,
  delegatedInstallSummary,
  installStatusPresentation,
  isCertificateReady,
  isRunnableTarget,
  matchesInstallOption,
  validateContainerPin
} from '../lib/ecpInstall'
import { EcpContainerPinField } from './EcpContainerPinField'

const STEP_LABELS = ['Кому установить', 'Чью ЭЦП', 'Проверка']

export function EcpDelegatedInstallWizard() {
  const notify = usePortalToast()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)
  const [targets, setTargets] = useState([])
  const [certificates, setCertificates] = useState([])
  const [targetQuery, setTargetQuery] = useState('')
  const [certificateQuery, setCertificateQuery] = useState('')
  const [selectedAgentId, setSelectedAgentId] = useState('')
  const [selectedItemId, setSelectedItemId] = useState(null)
  const [containerPin, setContainerPin] = useState('')
  const [confirming, setConfirming] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [job, setJob] = useState(null)
  const notifiedJobRef = useRef('')

  const selectedTarget = targets.find((target) => target.agent_id === selectedAgentId)
  const selectedCertificate = certificates.find((certificate) => certificate.item_id === selectedItemId)
  const jobPresentation = useMemo(() => installStatusPresentation(job), [job])
  const filteredTargets = useMemo(() => targets.filter((target) => matchesInstallOption([
    target.employee_name,
    target.hostname,
    target.logged_username
  ], targetQuery)), [targetQuery, targets])
  const filteredCertificates = useMemo(() => certificates.filter((certificate) => matchesInstallOption([
    certificate.owner_name,
    certificate.title,
    certificate.valid_until,
    certificate.private_valid_until
  ], certificateQuery)), [certificateQuery, certificates])

  const reset = () => {
    setStep(1)
    setTargetQuery('')
    setCertificateQuery('')
    setSelectedAgentId('')
    setSelectedItemId(null)
    setContainerPin('')
    setConfirming(false)
    setJob(null)
    notifiedJobRef.current = ''
  }

  const launchWizard = async () => {
    setOpen(true)
    setLoading(true)
    reset()
    try {
      const result = await fetchEcpInstallOptions()
      setTargets(result.targets || [])
      setCertificates(result.certificates || [])
      if (!(result.targets || []).length || !(result.certificates || []).length) {
        notify({
          kind: 'warning',
          title: 'Недостаточно данных',
          message: 'Для установки нужны доступный сотрудник и полный комплект ЭЦП.'
        })
      }
    } catch (error) {
      notify({ kind: 'error', title: 'Мастер не загружен', message: error.message })
    } finally {
      setLoading(false)
    }
  }

  const closeWizard = () => {
    if (submitting) return
    setContainerPin('')
    setOpen(false)
  }

  const chooseTarget = (target) => {
    if (!isRunnableTarget(target)) {
      notify({
        kind: 'warning',
        title: 'Профиль сейчас недоступен',
        message: 'Компьютер сотрудника выключен или пользователь ещё не вошёл в систему.'
      })
      return
    }
    setSelectedAgentId(target.agent_id)
  }

  const chooseCertificate = (certificate) => {
    setSelectedItemId(certificate.item_id)
    const issues = certificateIssues(certificate)
    if (issues.length) {
      notify({
        kind: 'warning',
        title: 'Неполные данные ЭЦП',
        message: `${certificate.owner_name}: ${issues.join(' · ')}.`
      })
    }
  }

  const next = () => {
    if (step === 1 && !selectedTarget) {
      notify({ kind: 'warning', title: 'Выберите получателя', message: 'Укажите сотрудника, которому нужно установить ЭЦП.' })
      return
    }
    if (step === 2 && !selectedCertificate) {
      notify({ kind: 'warning', title: 'Выберите сертификат', message: 'Укажите, чью ЭЦП нужно установить.' })
      return
    }
    if (step === 2 && !isCertificateReady(selectedCertificate)) {
      notify({ kind: 'warning', title: 'Комплект ЭЦП неполный', message: certificateIssues(selectedCertificate).join(' · ') })
      return
    }
    setStep((current) => Math.min(3, current + 1))
    setConfirming(false)
  }

  const back = () => {
    setStep((current) => Math.max(1, current - 1))
    setConfirming(false)
  }

  const submit = async () => {
    if (!selectedTarget || !selectedCertificate || !isCertificateReady(selectedCertificate)) return
    const pinError = validateContainerPin(containerPin)
    if (pinError) {
      notify({ kind: 'warning', title: 'Проверьте пароль ЭЦП', message: pinError })
      return
    }
    setSubmitting(true)
    try {
      const result = await startDelegatedEcpInstall(
        selectedCertificate.item_id,
        selectedTarget.agent_id,
        selectedTarget.employee_id,
        containerPin
      )
      setContainerPin('')
      setJob(result.job)
      setConfirming(false)
      notify({
        kind: 'info',
        title: 'Установка началась',
        message: delegatedInstallSummary(selectedCertificate, selectedTarget)
      })
    } catch (error) {
      notify({ kind: 'error', title: 'Установка не началась', message: error.message })
    } finally {
      setSubmitting(false)
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
      title: job.status === 'succeeded' ? jobPresentation?.label : 'Установка не завершена',
      message: job.message || delegatedInstallSummary(selectedCertificate, selectedTarget)
    })
  }, [job, selectedCertificate, selectedTarget])

  return (
    <>
      <button type="button" className="btn ecp-wizard-trigger" onClick={launchWizard}>
        <KeyRound size={18} /> Установка ЭЦП
      </button>

      <ModalShell open={open} onClose={closeWizard} panelClassName="glass-panel modal-panel ecp-wizard-dialog">
        <div role="dialog" aria-modal="true" aria-labelledby="ecp-wizard-title">
          <div className="ecp-install-dialog-head ecp-wizard-head">
            <div>
              <span className="ecp-install-kicker">Установка сотруднику</span>
              <h2 id="ecp-wizard-title">Установка ЭЦП</h2>
              <p>Можно установить ЭЦП одного сотрудника в профиль другого.</p>
            </div>
            <button type="button" className="ecp-install-close" onClick={closeWizard} disabled={submitting} aria-label="Закрыть"><X size={20} /></button>
          </div>

          <ol className="ecp-wizard-steps" aria-label="Шаги мастера">
            {STEP_LABELS.map((label, index) => (
              <li key={label} className={`${step === index + 1 ? 'is-active' : ''}${step > index + 1 ? ' is-done' : ''}`}>
                <span>{index + 1}</span>{label}
              </li>
            ))}
          </ol>

          {loading ? (
            <div className="ecp-install-loading"><Loader2 className="spin" size={22} /> Загружаем сотрудников и сертификаты…</div>
          ) : (
            <div className="ecp-wizard-content">
              {step === 1 && (
                <section aria-labelledby="ecp-target-step-title">
                  <h3 id="ecp-target-step-title">Кому установить</h3>
                  <p className="ecp-wizard-help">Выберите сотрудника, которому нужно установить ЭЦП.</p>
                  <label className="ecp-wizard-search"><Search size={17} /><input value={targetQuery} onChange={(event) => setTargetQuery(event.target.value)} placeholder="Фамилия сотрудника" /></label>
                  <div className="ecp-wizard-options" role="listbox" aria-label="Целевые пользователи">
                    {filteredTargets.map((target) => {
                      const runnable = isRunnableTarget(target)
                      return (
                        <button key={target.agent_id} type="button" role="option" aria-selected={selectedAgentId === target.agent_id}
                          className={`ecp-wizard-option${selectedAgentId === target.agent_id ? ' is-selected' : ''}${runnable ? '' : ' is-unavailable'}`}
                          onClick={() => chooseTarget(target)}>
                          <UserRound size={20} />
                          <span><strong>{target.employee_name}</strong><small>{runnable ? 'Компьютер готов к установке' : 'Компьютер сейчас недоступен'}</small></span>
                          <em>{runnable ? 'Готов' : 'Недоступен'}</em>
                        </button>
                      )
                    })}
                    {!filteredTargets.length && <div className="ecp-wizard-empty">Пользователи не найдены</div>}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section aria-labelledby="ecp-cert-step-title">
                  <h3 id="ecp-cert-step-title">Чью ЭЦП установить</h3>
                  <p className="ecp-wizard-help">Сертификат выбирается независимо от получателя.</p>
                  <label className="ecp-wizard-search"><Search size={17} /><input value={certificateQuery} onChange={(event) => setCertificateQuery(event.target.value)} placeholder="Владелец или название ЭЦП" /></label>
                  <div className="ecp-wizard-options" role="listbox" aria-label="Доступные сертификаты">
                    {filteredCertificates.map((certificate) => {
                      const issues = certificateIssues(certificate)
                      return (
                        <button key={certificate.item_id} type="button" role="option" aria-selected={selectedItemId === certificate.item_id}
                          className={`ecp-wizard-option${selectedItemId === certificate.item_id ? ' is-selected' : ''}${issues.length ? ' is-incomplete' : ''}`}
                          onClick={() => chooseCertificate(certificate)}>
                          <FileKey2 size={20} />
                          <span><strong>{certificate.owner_name}</strong><small>{certificate.title}</small>{issues.length ? <small className="is-warning">{issues.join(' · ')}</small> : null}</span>
                          <em>{issues.length ? 'Неполный' : 'Готов'}</em>
                        </button>
                      )
                    })}
                    {!filteredCertificates.length && <div className="ecp-wizard-empty">Сертификаты не найдены</div>}
                  </div>
                </section>
              )}

              {step === 3 && selectedTarget && selectedCertificate && (
                <section aria-labelledby="ecp-summary-step-title">
                  <h3 id="ecp-summary-step-title">Проверьте направление установки</h3>
                  <p className="ecp-wizard-help">Источник и получатель могут быть разными сотрудниками.</p>
                  <div className="ecp-transfer-summary">
                    <article className="ecp-transfer-card is-source">
                      <span>ЧЬЯ ЭЦП</span><FileKey2 size={24} />
                      <strong>{selectedCertificate.owner_name}</strong>
                      <small>{selectedCertificate.title}</small>
                      <small>Открытый и закрытый ключи готовы</small>
                    </article>
                    <div className="ecp-transfer-arrow" aria-hidden="true"><ArrowRight size={26} /></div>
                    <article className="ecp-transfer-card is-target">
                      <span>КУДА УСТАНОВИТЬ</span><Monitor size={24} />
                      <strong>{selectedTarget.employee_name}</strong>
                      <small>Компьютер готов к установке</small>
                    </article>
                  </div>
                  <div className="ecp-transfer-line">{delegatedInstallSummary(selectedCertificate, selectedTarget)}</div>
                  {!job && (
                    <EcpContainerPinField id="ecp-delegated-pin" value={containerPin} onChange={setContainerPin} disabled={submitting} />
                  )}
                  <div className="ecp-install-note">Установка выполняется только выбранному сотруднику.</div>
                  <EcpInstallDiagnostic job={job} />
                  {jobPresentation && (
                    <div className={`ecp-install-status is-${jobPresentation.tone}`} aria-live="polite">
                      {jobPresentation.terminal && job.status === 'succeeded' ? <Check size={18} /> : <Loader2 className={jobPresentation.terminal ? '' : 'spin'} size={18} />}
                      <div><strong>{jobPresentation.label}</strong>{jobPresentation.detail && <span>{jobPresentation.detail}</span>}</div>
                    </div>
                  )}
                </section>
              )}
            </div>
          )}

          {!loading && (
            <div className="ecp-wizard-footer">
              {step > 1 && !job ? <button type="button" className="btn" onClick={back} disabled={submitting}><ArrowLeft size={17} /> Назад</button> : <span />}
              {step < 3 ? (
                <button type="button" className="btn btn-primary" onClick={next} disabled={(step === 1 && !selectedTarget) || (step === 2 && !selectedCertificate)}>
                  Далее <ArrowRight size={17} />
                </button>
              ) : job ? (
                <button type="button" className="btn" onClick={closeWizard} disabled={submitting}>Закрыть</button>
              ) : confirming ? (
                <div className="ecp-install-confirm-pair is-wizard" role="group" aria-label="Подтверждение перекрёстной установки">
                  <button type="button" className="btn ecp-install-confirm-yes" onClick={submit} disabled={submitting}>
                    {submitting ? <Loader2 className="spin" size={17} /> : <Check size={17} />} Установить
                  </button>
                  <button type="button" className="btn ecp-install-confirm-no" onClick={() => setConfirming(false)} disabled={submitting}>
                    <X size={17} /> Не устанавливать
                  </button>
                </div>
              ) : (
                <button type="button" className="btn btn-primary" onClick={() => setConfirming(true)}>
                  <Monitor size={17} /> Установить на ПК
                </button>
              )}
            </div>
          )}
        </div>
      </ModalShell>
    </>
  )
}
