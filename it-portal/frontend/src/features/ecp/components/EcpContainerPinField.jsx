import { containerPinHint, validateContainerPin } from '../lib/ecpInstall'

export function EcpContainerPinField({ id, value, onChange, disabled = false, compact = false }) {
  const error = validateContainerPin(value)

  return (
    <label className={`ecp-container-pin${compact ? ' is-compact' : ''}`} htmlFor={id}>
      <span>Пароль ЭЦП</span>
      <input
        id={id}
        type="password"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete="new-password"
        spellCheck="false"
        disabled={disabled}
        aria-invalid={Boolean(error)}
      />
      <small className={error ? 'is-error' : ''}>{error || containerPinHint(value)}</small>
    </label>
  )
}
