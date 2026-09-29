import { diagnosticRows } from '../lib/ecpDiagnostic'
import './ecp-install-diagnostic.css'

export function EcpInstallDiagnostic({ job }) {
  if (!job || !['failed', 'expired'].includes(job.status)) return null
  const diagnostic = job.diagnostic
  return (
    <section className="ecp-install-diagnostic" aria-label="Причина ошибки установки ЭЦП" aria-live="polite">
      <strong>{diagnostic?.reason || job.message || 'Установка не завершена'}</strong>
      {diagnostic?.action && <p>{diagnostic.action}</p>}
      {diagnostic && (
        <table>
          <caption>Подробности для администратора</caption>
          <tbody>{diagnosticRows(job).map(([label, value]) => (
            <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>
          ))}</tbody>
        </table>
      )}
    </section>
  )
}
