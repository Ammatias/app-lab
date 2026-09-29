import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, ArrowUpRight, BookOpen, CheckCircle2, Clock3, Database, Network } from 'lucide-react'
import { motion } from 'framer-motion'
import { containerVariants } from '../../../shared/lib/motion'
import { matchSearchValues } from '../../../shared/lib/search'
import { EmptyState } from '../../../shared/ui/EmptyState'
import { FaviconIcon } from '../../../shared/ui/FaviconIcon'
import { StatusIndicator } from '../../../shared/ui/StatusIndicator'

const INTEGRATION_SERVICES = [
  {
    id: 'portal-api',
    name: 'Portal API',
    url: 'https://api.demo.example.com',
    stage: 'production',
    fallbackIcon: Activity,
    summary: 'Единая точка доступа к демонстрационным данным портала.',
    role: 'Показывает границу между пользовательским интерфейсом и внутренними сервисами без подключения production-систем.',
    nextStep: 'Добавить контрактные тесты для публичных demo-endpoints и документировать версии ответов.'
  },
  {
    id: 'asset-registry',
    name: 'Реестр оборудования',
    url: 'https://assets.demo.example.com',
    stage: 'production',
    fallbackIcon: Database,
    summary: 'Синтетический каталог устройств и рабочих мест.',
    role: 'Иллюстрирует интеграцию с учётом техники без публикации серийных номеров, сотрудников и реальных кабинетов.',
    nextStep: 'Расширить демонстрационный набор несколькими нейтральными типами оборудования.'
  },
  {
    id: 'knowledge-base',
    name: 'База знаний',
    url: 'https://knowledge.demo.example.com',
    stage: 'optional',
    fallbackIcon: BookOpen,
    summary: 'Нейтральная библиотека инструкций и регламентов.',
    role: 'Демонстрирует переход из портала к связанному рабочему ресурсу на зарезервированном домене.',
    nextStep: 'Добавить поиск по демонстрационным статьям и единый статус доступности.'
  }
]

const sectionStyle = {
  display: 'grid',
  gap: '18px'
}

const badgeBaseStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '6px 10px',
  borderRadius: '999px',
  fontSize: '0.78rem',
  fontWeight: 600,
  border: '1px solid transparent'
}

const summaryCardStyle = {
  padding: '18px 20px',
  display: 'grid',
  gap: '6px',
  minWidth: '160px'
}

const cardStyle = {
  padding: '22px',
  display: 'grid',
  gap: '16px',
  alignContent: 'start'
}

const nextStepStyle = {
  display: 'grid',
  gap: '8px',
  padding: '14px 16px',
  borderRadius: '18px',
  border: '1px solid rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(16, 20, 31, 0.74), rgba(11, 16, 24, 0.88))'
}

function getStageMeta(stage) {
  if (stage === 'optional') {
    return {
      label: 'optional',
      style: {
        ...badgeBaseStyle,
        color: '#fcd34d',
        background: 'rgba(120, 53, 15, 0.28)',
        borderColor: 'rgba(251, 191, 36, 0.28)'
      }
    }
  }

  return {
    label: 'production-ready',
    style: {
      ...badgeBaseStyle,
      color: '#bbf7d0',
      background: 'rgba(20, 83, 45, 0.24)',
      borderColor: 'rgba(134, 239, 172, 0.24)'
    }
  }
}

function getLiveStatusMeta(status) {
  if (status === 'online') {
    return {
      label: 'online',
      Icon: CheckCircle2,
      style: {
        ...badgeBaseStyle,
        color: '#bbf7d0',
        background: 'rgba(20, 83, 45, 0.24)',
        borderColor: 'rgba(134, 239, 172, 0.2)'
      }
    }
  }

  if (status === 'offline') {
    return {
      label: 'offline',
      Icon: AlertTriangle,
      style: {
        ...badgeBaseStyle,
        color: '#fecaca',
        background: 'rgba(127, 29, 29, 0.28)',
        borderColor: 'rgba(248, 113, 113, 0.24)'
      }
    }
  }

  return {
    label: 'checking',
    Icon: Clock3,
    style: {
      ...badgeBaseStyle,
      color: '#cbd5f5',
      background: 'rgba(37, 52, 87, 0.34)',
      borderColor: 'rgba(148, 163, 184, 0.2)'
    }
  }
}

async function fetchServiceStatus(url) {
  try {
    const response = await fetch(`/api/proxy/ping?url=${encodeURIComponent(url)}`)
    if (!response.ok) {
      throw new Error('Ping failed')
    }

    const payload = await response.json()
    return {
      status: payload?.status === 'online' ? 'online' : 'offline',
      latency: typeof payload?.latency === 'number' ? payload.latency : 0
    }
  } catch {
    return { status: 'offline', latency: 0 }
  }
}

export function IntegrationsPage({ searchQuery }) {
  const [serviceStates, setServiceStates] = useState(() => (
    Object.fromEntries(INTEGRATION_SERVICES.map((service) => [service.id, { status: 'loading', latency: 0 }]))
  ))

  useEffect(() => {
    let active = true

    const syncStatuses = async () => {
      const nextEntries = await Promise.all(
        INTEGRATION_SERVICES.map(async (service) => [service.id, await fetchServiceStatus(service.url)])
      )

      if (!active) return
      setServiceStates(Object.fromEntries(nextEntries))
    }

    syncStatuses()
    const intervalId = window.setInterval(syncStatuses, 30000)

    return () => {
      active = false
      window.clearInterval(intervalId)
    }
  }, [])

  const visibleServices = useMemo(() => (
    INTEGRATION_SERVICES.filter((service) => matchSearchValues([
      service.name,
      service.url,
      service.summary,
      service.role,
      service.nextStep,
      service.stage,
      'интеграции observability alerts metrics webhooks workflow'
    ], searchQuery))
  ), [searchQuery])

  const summary = useMemo(() => (
    visibleServices.reduce((accumulator, service) => {
      const currentStatus = serviceStates[service.id]?.status || 'loading'

      accumulator.total += 1
      accumulator[currentStatus] += 1

      if (service.stage === 'optional') {
        accumulator.optional += 1
      } else {
        accumulator.production += 1
      }

      return accumulator
    }, {
      total: 0,
      online: 0,
      offline: 0,
      loading: 0,
      production: 0,
      optional: 0
    })
  ), [serviceStates, visibleServices])

  return (
    <motion.div
      className="page-content"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={sectionStyle}
    >
      <section
        className="glass-panel"
        style={{
          padding: '24px 26px',
          display: 'grid',
          gap: '18px',
          background: 'linear-gradient(135deg, rgba(34, 45, 73, 0.94), rgba(20, 29, 48, 0.86) 42%, rgba(35, 19, 61, 0.92))'
        }}
      >
        <div style={{ display: 'grid', gap: '10px' }}>
          <span style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.78rem' }}>
            Integrations Lab
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <Network size={22} />
            <h1 style={{ margin: 0, fontSize: 'clamp(1.45rem, 2.4vw, 2.1rem)' }}>Интеграции</h1>
          </div>
          <p style={{ margin: 0, maxWidth: '940px', color: 'rgba(228,233,255,0.84)', lineHeight: 1.6 }}>
            Безопасный демонстрационный центр связей портала. Здесь показаны только нейтральные сервисные границы,
            без production-адресов, систем мониторинга, автоматизации и внешних каналов.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <article className="glass-panel" style={summaryCardStyle}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Сервисов в фокусе</span>
            <strong style={{ fontSize: '1.9rem', lineHeight: 1 }}>{summary.total}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>Отфильтровано текущим поиском</span>
          </article>

          <article className="glass-panel" style={summaryCardStyle}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Live-status</span>
            <strong style={{ fontSize: '1.9rem', lineHeight: 1 }}>{summary.online}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>
              online · {summary.offline} offline · {summary.loading} checking
            </span>
          </article>

          <article className="glass-panel" style={summaryCardStyle}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Production-ready</span>
            <strong style={{ fontSize: '1.9rem', lineHeight: 1 }}>{summary.production}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>Готовые рабочие компоненты контура</span>
          </article>

          <article className="glass-panel" style={summaryCardStyle}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Optional</span>
            <strong style={{ fontSize: '1.9rem', lineHeight: 1 }}>{summary.optional}</strong>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>Подключать по мере взросления алертинга</span>
          </article>
        </div>
      </section>

      {visibleServices.length === 0 ? (
        <div className="glass-panel" style={{ padding: '28px' }}>
          <EmptyState>По текущему поиску интеграции не найдены.</EmptyState>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '16px' }}>
          {visibleServices.map((service) => {
            const stageMeta = getStageMeta(service.stage)
            const liveMeta = getLiveStatusMeta(serviceStates[service.id]?.status || 'loading')
            const LiveIcon = liveMeta.Icon
            const latency = serviceStates[service.id]?.latency || 0

            return (
              <article key={service.id} className="glass-panel" style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    <span
                      style={{
                        width: '54px',
                        height: '54px',
                        borderRadius: '18px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(180deg, rgba(88, 64, 134, 0.5), rgba(35, 48, 79, 0.36))',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)'
                      }}
                    >
                      <FaviconIcon url={service.url} fallback={service.fallbackIcon} alt={service.name} name={service.name} />
                    </span>

                    <div style={{ display: 'grid', gap: '4px' }}>
                      <strong style={{ fontSize: '1.08rem' }}>{service.name}</strong>
                      <a
                        href={service.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: 'var(--text-muted)', fontSize: '0.85rem', wordBreak: 'break-all', textDecoration: 'none' }}
                      >
                        {service.url}
                      </a>
                    </div>
                  </div>

                  <StatusIndicator url={service.url} />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <span style={stageMeta.style}>{stageMeta.label}</span>
                  <span style={liveMeta.style}>
                    <LiveIcon size={14} />
                    {liveMeta.label}
                    {serviceStates[service.id]?.status === 'online' && latency > 0 ? ` · ${latency}ms` : ''}
                  </span>
                </div>

                <div style={{ display: 'grid', gap: '10px' }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6 }}>{service.summary}</p>
                  <p style={{ margin: 0, lineHeight: 1.65 }}>{service.role}</p>
                </div>

                <div style={nextStepStyle}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Activity size={15} />
                    <strong style={{ fontSize: '0.9rem' }}>Что можно подключить дальше</strong>
                  </div>
                  <span style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{service.nextStep}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    {service.stage === 'optional' ? 'Подключать по мере появления real alerting' : 'Можно использовать как опорную точку уже сейчас'}
                  </span>
                  <a href={service.url} target="_blank" rel="noreferrer" className="btn">
                    <ArrowUpRight size={16} /> Открыть
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

export default IntegrationsPage
