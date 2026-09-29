import { ArrowUpRight, Link2, MessagesSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { isHiddenPortalAccount } from '../../../shared/lib/portalAccounts'
import { parseHomeWidgetSettings, stringifyHomeWidgetSettings } from '../lib/homeWidgetSettings'

export function HomeVkWorkspaceWidget({
  widget,
  user,
  isHomeEditMode,
  onUpdateHomeWidget
}) {
  const settings = parseHomeWidgetSettings(widget)
  const [draftHref, setDraftHref] = useState(settings.href)
  const showLinkedProfile = user?.vk_teams_login && !isHiddenPortalAccount(user)

  useEffect(() => {
    setDraftHref(settings.href)
  }, [settings.href])

  const updateHref = (href) => (
    onUpdateHomeWidget(widget, {
      settings_json: stringifyHomeWidgetSettings(widget.widget_type, {
        ...settings,
        href
      })
    })
  )

  return (
    <div className="home-vk-widget">
      <div className="home-vk-widget-hero">
        <span className="home-vk-widget-icon">
          <MessagesSquare size={18} />
        </span>
        <div className="home-vk-widget-copy">
          <strong>Быстрый вход в VK Workspace</strong>
          <span>
            {showLinkedProfile
              ? `Профиль привязан как ${user.vk_teams_login}. Можно сразу прыгнуть в рабочее приложение.`
              : 'Портал пока не знает ваш логин VK Teams, но launcher уже готов для быстрого входа.'}
          </span>
        </div>
      </div>

      <div className="home-vk-widget-actions">
        <a
          className="btn btn-primary"
          href={settings.href}
          target="_blank"
          rel="noreferrer"
        >
          <ArrowUpRight size={14} /> Открыть VK Workspace
        </a>
      </div>

      {isHomeEditMode ? (
        <div className="home-widget-config-panel">
          <div className="home-widget-config-head">
            <strong>Ссылка лаунчера</strong>
            <span>Если у вас есть более точная deep-link ссылка на VK Workspace, её можно подставить здесь.</span>
          </div>

          <label className="home-widget-search">
            <Link2 size={14} />
            <input
              type="url"
              className="input-glass"
              placeholder="https://vk.com/app54510215"
              value={draftHref}
              onChange={(event) => setDraftHref(event.target.value)}
              onBlur={() => {
                if (draftHref !== settings.href) {
                  updateHref(draftHref)
                }
              }}
            />
          </label>
        </div>
      ) : null}
    </div>
  )
}
