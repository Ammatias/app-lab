import { Mail, Phone } from 'lucide-react'
import { useMemo } from 'react'
import { ADMIN_TEAM_STATUS_META, buildAdminTeamEntries } from '../lib/adminTeamPresence'
import { parseHomeWidgetSettings, stringifyHomeWidgetSettings } from '../lib/homeWidgetSettings'
import { isHiddenPortalAccount } from '../../../shared/lib/portalAccounts'

function toTelHref(value) {
  const normalized = String(value || '').replace(/[^\d+]/g, '')
  return normalized ? `tel:${normalized}` : ''
}

export function HomeAdminTeamWidget({
  widget,
  employees = [],
  vacationsOverview,
  portalPresence = [],
  isHomeEditMode,
  onUpdateHomeWidget
}) {
  const settings = useMemo(() => parseHomeWidgetSettings(widget), [widget])
  const allTeamEntries = useMemo(
    () => buildAdminTeamEntries(
      vacationsOverview?.profiles || [],
      vacationsOverview?.periods || [],
      portalPresence,
      employees
    ).filter((entry) => !isHiddenPortalAccount(entry)),
    [employees, portalPresence, vacationsOverview?.periods, vacationsOverview?.profiles]
  )
  const teamEntries = useMemo(
    () => (settings.show_offline ? allTeamEntries : allTeamEntries.filter((entry) => entry.status !== 'offline')),
    [allTeamEntries, settings.show_offline]
  )

  const counts = useMemo(() => allTeamEntries.reduce((accumulator, entry) => {
    accumulator[entry.status] += 1
    return accumulator
  }, {
    online: 0,
    authorized: 0,
    vacation: 0,
    offline: 0
  }), [allTeamEntries])

  const updateSettings = (patch) => (
    onUpdateHomeWidget(widget, {
      settings_json: stringifyHomeWidgetSettings(widget.widget_type, {
        ...settings,
        ...patch
      })
    })
  )

  if (!vacationsOverview?.profiles?.length) {
    return (
      <div className="home-widget-empty">
        Виджет состава отдела появится, когда для администраторов будут доступны отпускные профили и живые статусы присутствия.
      </div>
    )
  }

  return (
    <div className="home-team-widget">
      <div className="home-team-widget-summary">
        {Object.entries(ADMIN_TEAM_STATUS_META).map(([statusKey, meta]) => {
          const Icon = meta.Icon
          return (
            <div key={statusKey} className={`home-team-summary-chip ${meta.className}`}>
              <Icon size={13} />
              <span>{meta.label}</span>
              <strong>{counts[statusKey]}</strong>
            </div>
          )
        })}
      </div>

      {teamEntries.length > 0 ? (
        <div className="home-team-widget-list">
          {teamEntries.map((entry) => {
            const meta = ADMIN_TEAM_STATUS_META[entry.status] || ADMIN_TEAM_STATUS_META.offline
            const Icon = meta.Icon

            return (
              <article key={entry.username} className="home-team-card">
                <div className="home-team-card-copy">
                  <strong>{entry.displayName}</strong>
                  <span>{entry.position}</span>
                  <small>{[entry.room ? `Каб. ${entry.room}` : '', entry.internal ? `Внутр. ${entry.internal}` : ''].filter(Boolean).join(' · ') || 'Контакты можно держать прямо на Home'}</small>
                </div>

                <div className="home-team-card-meta">
                  <span className={`home-team-status ${meta.className}`} title={meta.hint}>
                    <Icon size={12} /> {meta.label}
                  </span>

                  <div className="home-team-card-actions">
                    {entry.phone ? (
                      <a className="home-contact-chip" href={toTelHref(entry.phone)}>
                        <Phone size={12} /> {entry.phone}
                      </a>
                    ) : null}
                    {entry.email ? (
                      <a className="home-contact-chip" href={`mailto:${entry.email}`}>
                        <Mail size={12} /> {entry.email}
                      </a>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      ) : (
        <div className="home-widget-empty">
          Все админы сейчас скрыты фильтром. Включите показ офлайн-коллег, чтобы видеть полный состав отдела.
        </div>
      )}

      {isHomeEditMode ? (
        <div className="home-widget-config-panel">
          <div className="home-widget-config-head">
            <strong>Статусы отдела</strong>
            <span>Онлайн появляется только когда админ активен и сфокусирован на портале. Если вкладка неактивна, статус становится «Авторизован».</span>
          </div>

          <label className="home-widget-toggle-row">
            <input
              type="checkbox"
              checked={settings.show_offline}
              onChange={(event) => updateSettings({ show_offline: event.target.checked })}
            />
            <span>Показывать офлайн-админов в списке, а не только в summary</span>
          </label>
        </div>
      ) : null}
    </div>
  )
}
