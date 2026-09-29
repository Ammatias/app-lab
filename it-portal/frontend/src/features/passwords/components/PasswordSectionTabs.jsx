import { PASSWORD_PRIMARY_VIEWS } from '../lib/passwordSubtypes'

export function PasswordSectionTabs({ activeView, onChange }) {
  return (
    <div className="password-tab-row">
      <button
        className={`btn password-tab-btn ${activeView === PASSWORD_PRIMARY_VIEWS.resources ? 'btn-primary is-active' : ''}`}
        onClick={() => onChange(PASSWORD_PRIMARY_VIEWS.resources)}
      >
        Основные
      </button>
      <button
        className={`btn password-tab-btn ${activeView === PASSWORD_PRIMARY_VIEWS.network ? 'btn-primary is-active' : ''}`}
        onClick={() => onChange(PASSWORD_PRIMARY_VIEWS.network)}
      >
        Сеть
      </button>
      <button
        className={`btn password-tab-btn ${activeView === PASSWORD_PRIMARY_VIEWS.employeeMail ? 'btn-primary is-active' : ''}`}
        onClick={() => onChange(PASSWORD_PRIMARY_VIEWS.employeeMail)}
      >
        Почта сотрудников
      </button>
    </div>
  )
}
