import { useMemo, useState } from 'react'
import { Building2, Files, GripVertical, HardDrive, Home, Key, LayoutDashboard, List, LogOut, MapPin, NotebookPen, Phone, Printer, Shield, Umbrella, UserRound } from 'lucide-react'
import { BackupTwoFactorSection } from '../../auth/components/BackupTwoFactorSection'
import { ADMIN_TEAM_STATUS_META, buildAdminTeamEntries, normalizeCompareValue } from '../../home/lib/adminTeamPresence'
import { UtilityPageShell } from '../../../shared/ui/UtilityPageShell'
import { isHiddenPortalAccount, getPortalAccountDisplayName } from '../../../shared/lib/portalAccounts'

export default function ProfilePage({
  user,
  vacationsOverview,
  portalPresence,
  navOrder,
  onReorderNavItems,
  onResetNavItems,
  onNavigateEmployees,
  onNavigateLocations,
  onNavigateDepartments,
  onNavigateVacations,
  onBack
}) {
  const [draggedNavItem, setDraggedNavItem] = useState(null)
  const isHiddenUser = isHiddenPortalAccount(user)

  const navItems = useMemo(() => {
    const meta = {
      accountable: { id: 'accountable', label: 'Подотчет', icon: List },
      'file-storage': { id: 'file-storage', label: 'Файлохранилище', icon: Files },
      ecp: { id: 'ecp', label: 'ЭЦП', icon: Shield },
      password: { id: 'password', label: 'Пароли', icon: Key },
      phonebook: { id: 'phonebook', label: 'Справочник', icon: Phone },
      equipment: { id: 'equipment', label: 'Оборудование', icon: HardDrive },
      cartridges: { id: 'cartridges', label: 'Картриджи', icon: Printer },
      anydesk: { id: 'anydesk', label: 'Anydesk', icon: LayoutDashboard },
      notes: { id: 'notes', label: 'Заметки', icon: NotebookPen },
      home: { id: 'home', label: 'Главная', icon: Home }
    }

    return navOrder.map((id) => meta[id]).filter(Boolean)
  }, [navOrder])

  const teammatePresenceEntries = useMemo(() => {
    const allAdmins = buildAdminTeamEntries(
      vacationsOverview?.profiles || [],
      vacationsOverview?.periods || [],
      portalPresence || [],
      []
    )
    const currentUsername = normalizeCompareValue(user?.username)
    return allAdmins.filter((entry) => entry.username && entry.username !== currentUsername && !isHiddenPortalAccount(entry))
  }, [portalPresence, user?.username, vacationsOverview?.periods, vacationsOverview?.profiles])

  const actions = (
    <button
      type="button"
      className="btn btn-primary"
      onClick={() => { window.location.href = '/api/auth/logout' }}
    >
      <LogOut size={16} /> Выйти
    </button>
  )

  return (
    <UtilityPageShell
      eyebrow="Профиль"
      title={isHiddenUser ? 'Служебный вход' : 'Аккаунт оператора'}
      description={isHiddenUser
        ? 'Авторизация активна, персональная служебная учетка скрыта из интерфейса портала.'
        : 'Профиль текущего пользователя, быстрые переходы в административные разделы и настройка верхней панели.'}
      onBack={onBack}
      actions={actions}
      maxWidth="1080px"
    >
      <div className="portal-profile-modal-body">
        <div className="portal-profile-modal-column">
          <section className="portal-profile-modal-section">
            <div className="portal-profile-modal-identity-row">
              <div className="portal-profile-modal-identity">
                <span className="portal-profile-avatar is-large">
                  <UserRound size={18} />
                </span>
                <div className="portal-profile-modal-copy">
                  <strong>{getPortalAccountDisplayName(user)}</strong>
                  {!isHiddenUser ? <span>{user.username}</span> : null}
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {user.auth_method === 'backup_2fa' ? 'Вход: резервный TOTP-код' : 'Вход: Authentik'}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="portal-profile-modal-section">
            <div className="portal-profile-modal-section-title">Быстрые действия</div>
            <div className="portal-profile-modal-actions">
              <button type="button" className="btn" onClick={onNavigateEmployees}>
                <UserRound size={16} /> Сотрудники
              </button>
              <button type="button" className="btn" onClick={onNavigateLocations}>
                <MapPin size={16} /> Кабинеты
              </button>
              <button type="button" className="btn" onClick={onNavigateDepartments}>
                <Building2 size={16} /> Отделы
              </button>
              <button type="button" className="btn" onClick={onNavigateVacations}>
                <Umbrella size={16} /> Отпуска
              </button>
            </div>
          </section>

          <section className="portal-profile-modal-section">
            <div className="portal-profile-modal-section-title">Горячие клавиши</div>
            <div className="portal-profile-shortcuts">
              <div className="portal-profile-shortcut"><span>Ctrl/Cmd + F</span><strong>Сверх-поиск</strong></div>
              <div className="portal-profile-shortcut"><span>Ctrl/Cmd + K</span><strong>Локальный поиск</strong></div>
              <div className="portal-profile-shortcut"><span>Ctrl/Cmd + N</span><strong>Создать запись</strong></div>
              <div className="portal-profile-shortcut"><span>Alt + 1..7</span><strong>Переключить вкладку</strong></div>
            </div>
          </section>
        </div>

        <div className="portal-profile-modal-column">
          {user.is_portal_admin && (
            <section className="portal-profile-modal-section">
              <div className="portal-profile-modal-section-title">Остальные Админы</div>
              <div className="portal-profile-section-subtitle">
                Живой статус двух других администраторов портала. «Онлайн» виден только когда человек сейчас активен именно в портале.
              </div>

              {teammatePresenceEntries.length > 0 ? (
                <div className="portal-profile-admin-presence-list">
                  {teammatePresenceEntries.map((entry) => {
                    const meta = ADMIN_TEAM_STATUS_META[entry.status] || ADMIN_TEAM_STATUS_META.offline
                    const Icon = meta.Icon
                    const details = [entry.position]
                    if (entry.room) details.push(`Каб. ${entry.room}`)
                    if (entry.internal) details.push(`Внутр. ${entry.internal}`)

                    return (
                      <article key={entry.username} className="portal-profile-admin-presence-card">
                        <div className="portal-profile-admin-presence-copy">
                          <strong>{entry.displayName}</strong>
                          <span>{details.join(' · ')}</span>
                        </div>

                        <span className={`portal-profile-admin-presence-status ${meta.className}`} title={meta.hint}>
                          <Icon size={12} /> {meta.label}
                        </span>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="portal-profile-vk-status">
                  <strong>Другие администраторы пока не найдены</strong>
                  <span>Блок заполнится автоматически, когда в отпускном составе будут профили трёх админов портала.</span>
                </div>
              )}
            </section>
          )}

          <BackupTwoFactorSection user={user} active={true} />

          <section className="portal-profile-modal-section is-nav">
            <div className="portal-profile-modal-section-header">
              <div className="portal-profile-modal-section-title">Верхняя Панель</div>
              <button type="button" className="btn" onClick={onResetNavItems}>
                Сбросить порядок
              </button>
            </div>
            <div className="portal-profile-nav-list">
              {navItems.map((item) => {
                const Icon = item.icon
                const isDragging = draggedNavItem === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    draggable={true}
                    className="btn"
                    onDragStart={(event) => {
                      setDraggedNavItem(item.id)
                      event.dataTransfer.effectAllowed = 'move'
                      event.dataTransfer.setData('text/plain', item.id)
                    }}
                    onDragEnd={() => setDraggedNavItem(null)}
                    onDragOver={(event) => {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = 'move'
                    }}
                    onDrop={(event) => {
                      event.preventDefault()
                      const sourceId = draggedNavItem || event.dataTransfer.getData('text/plain')
                      onReorderNavItems(sourceId, item.id)
                      setDraggedNavItem(null)
                    }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                      paddingInline: '14px',
                      opacity: isDragging ? 0.55 : 1,
                      cursor: 'grab'
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                      <GripVertical size={16} style={{ color: 'var(--text-muted)' }} />
                      <Icon size={16} />
                      <span>{item.label}</span>
                    </span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Перетащить</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </UtilityPageShell>
  )
}
