import { PASSWORD_NETWORK_VIEWS } from '../lib/passwordSubtypes'

export function PasswordNetworkTabs({ activeView, onChange }) {
  return (
    <div className="password-tab-row password-tab-row--secondary">
      <button
        className={`btn password-tab-btn ${activeView === PASSWORD_NETWORK_VIEWS.wifi ? 'btn-primary is-active' : ''}`}
        onClick={() => onChange(PASSWORD_NETWORK_VIEWS.wifi)}
      >
        Wi-Fi
      </button>
    </div>
  )
}
