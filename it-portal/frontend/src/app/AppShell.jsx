import { useEffect, useMemo, useState } from 'react'
import { AlignJustify, BarChart3, Bell, Cloud, CloudLightning, CloudRain, CloudSnow, CloudSun, Files, HardDrive, History, Home, Key, LayoutDashboard, List, Map as MapIcon, Network, NotebookPen, Phone, Plus, Printer, Search, Shield, SlidersHorizontal, Sun, UserRound, Volume2, Wind } from 'lucide-react'
import { motion } from 'framer-motion'
import { isMainPortalTab } from './routes'
import { GlobalSearchBar } from '../features/global-search/components/GlobalSearchBar'
import { PasswordNetworkTabs } from '../features/passwords/components/PasswordNetworkTabs'
import { PasswordSectionTabs } from '../features/passwords/components/PasswordSectionTabs'
import { PasswordStats } from '../features/passwords/components/PasswordStats'
import { PASSWORD_PRIMARY_VIEWS } from '../features/passwords/lib/passwordSubtypes'
import { EcpDelegatedInstallWizard } from '../features/ecp/components/EcpDelegatedInstallWizard'

const DEMO_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast?latitude=0&longitude=0&current=temperature_2m,weather_code,wind_speed_10m&timezone=UTC&elevation=0&forecast_days=1'

function getWeatherMeta(code) {
  if (code === 0) return { label: 'Ясно', Icon: Sun }
  if ([1, 2].includes(code)) return { label: 'Переменная облачность', Icon: CloudSun }
  if (code === 3 || code === 45 || code === 48) return { label: code === 3 ? 'Пасмурно' : 'Туман', Icon: Cloud }
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Осадки', Icon: CloudRain }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Снег', Icon: CloudSnow }
  if ([95, 96, 99].includes(code)) return { label: 'Гроза', Icon: CloudLightning }
  return { label: 'По погоде', Icon: Wind }
}

export function AppShell({
  user,
  activeTab,
  activeNavTab,
  onSwitchTab,
  navOrder,
  onReorderNavItems,
  onResetNavItems,
  searchQuery,
  setSearchQuery,
  globalSearchQuery,
  setGlobalSearchQuery,
  viewMode,
  setViewMode,
  homeViewMode,
  setHomeViewMode,
  isHomeLayoutActive,
  showActions,
  isPhonebookTab,
  isEcpTab,
  isNotesTab,
  isAccountableTab,
  phonebookDirectoryView,
  onSetPhonebookDirectoryView,
  onOpenPhonebookOrder,
  isCartridgesTab,
  isEquipmentTab,
  isPasswordTab,
  equipmentSubview,
  equipmentStationCount,
  equipmentPhoneCount,
  accountableCount,
  accountableImporting,
  passwordPrimaryView,
  passwordNetworkView,
  passwordStats,
  globalSearchInputRef,
  localSearchInputRef,
  showControls,
  onSetPasswordPrimaryView,
  onSetPasswordNetworkView,
  onSetEquipmentSubview,
  onAddRecord,
  onAddEquipment,
  onAddEquipmentPhone,
  onAddInventory,
  onAddPrinter,
  onOpenAccountableImports,
  onImportAccountable,
  onOpenInventoryReports,
  onOpenNotificationsPage,
  onOpenProfilePage,
  notificationsOverview
}) {
  const [now, setNow] = useState(() => new Date())
  const [weatherState, setWeatherState] = useState({
    loading: true,
    temperature: null,
    windSpeed: null,
    weatherCode: null,
    error: ''
  })
  const hasPortalWideAccess = Array.isArray(user?.permissions) && user.permissions.includes('portal.full')

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => window.clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (!hasPortalWideAccess) {
      setWeatherState({
        loading: false,
        temperature: null,
        windSpeed: null,
        weatherCode: null,
        error: ''
      })
      return undefined
    }

    let cancelled = false

    const loadWeather = async ({ silent = false } = {}) => {
      if (!silent) {
        setWeatherState((current) => ({
          ...current,
          loading: true,
          error: ''
        }))
      }

      try {
        const response = await fetch(DEMO_WEATHER_URL, {
          cache: 'no-store'
        })

        if (!response.ok) {
          throw new Error('Open-Meteo unavailable')
        }

        const payload = await response.json()
        const current = payload?.current

        if (!current || typeof current.temperature_2m !== 'number') {
          throw new Error('Malformed weather payload')
        }

        if (cancelled) return

        setWeatherState({
          loading: false,
          temperature: current.temperature_2m,
          windSpeed: typeof current.wind_speed_10m === 'number' ? current.wind_speed_10m : null,
          weatherCode: typeof current.weather_code === 'number' ? current.weather_code : null,
          error: ''
        })
      } catch {
        if (cancelled) return

        setWeatherState((current) => ({
          ...current,
          loading: false,
          error: 'Open-Meteo недоступно'
        }))
      }
    }

    loadWeather()

    const intervalId = window.setInterval(() => {
      loadWeather({ silent: true })
    }, 10 * 60 * 1000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [hasPortalWideAccess])

  const navItems = useMemo(() => {
    const allowedTabs = new Set(Array.isArray(user?.allowed_tabs) ? user.allowed_tabs : [])
    const meta = {
      accountable: { id: 'accountable', label: 'Подотчет', icon: List, iconOnly: false, title: 'Подотчет' },
      'file-storage': { id: 'file-storage', label: 'Файлохранилище', mobileLabel: 'Файлы', icon: Files, iconOnly: false, title: 'Файлохранилище' },
      integrations: { id: 'integrations', label: 'Интеграции', icon: Network, iconOnly: false, title: 'Интеграции' },
      'outdoor-audio': { id: 'outdoor-audio', label: 'Уличный звук', icon: Volume2, iconOnly: false, title: 'Уличный звук' },
      ecp: { id: 'ecp', label: 'ЭЦП', icon: Shield, iconOnly: false, title: 'ЭЦП' },
      password: { id: 'password', label: 'Пароли', icon: Key, iconOnly: false, title: 'Пароли' },
      phonebook: { id: 'phonebook', label: 'Справочник', icon: Phone, iconOnly: true, title: 'Справочник' },
      equipment: { id: 'equipment', label: 'Оборудование', icon: HardDrive, iconOnly: false, title: 'Оборудование' },
      'museum-map': { id: 'museum-map', label: 'Карта', icon: MapIcon, iconOnly: false, title: 'Карта офиса' },
      cartridges: { id: 'cartridges', label: 'Картриджи', icon: Printer, iconOnly: false, title: 'Картриджи' },
      anydesk: { id: 'anydesk', label: 'Anydesk', icon: LayoutDashboard, iconOnly: false, title: 'Anydesk' },
      notes: { id: 'notes', label: 'Заметки', icon: NotebookPen, iconOnly: true, title: 'Заметки' },
      home: { id: 'home', label: 'Главная', icon: Home, iconOnly: true, title: 'Главная' }
    }

    const navIds = [
      'museum-map',
      ...(navOrder.includes('integrations') ? ['integrations'] : []),
      ...navOrder.filter((id) => id !== 'museum-map' && id !== 'integrations')
    ]

    return navIds
      .filter((id) => isMainPortalTab(id))
      .filter((id) => allowedTabs.size === 0 || allowedTabs.has(id))
      .map((id) => meta[id])
      .filter(Boolean)
  }, [navOrder, user?.allowed_tabs])

  const clockTime = useMemo(() => new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(now), [now])

  const weatherMeta = useMemo(
    () => getWeatherMeta(weatherState.weatherCode),
    [weatherState.weatherCode]
  )
  const WeatherIcon = weatherMeta.Icon

  return (
    <>
      {hasPortalWideAccess ? (
        <GlobalSearchBar
          ref={globalSearchInputRef}
          value={globalSearchQuery}
          onChange={setGlobalSearchQuery}
          onClear={() => setGlobalSearchQuery('')}
          weatherState={weatherState}
          weatherMeta={weatherMeta}
          WeatherIcon={WeatherIcon}
          clockTime={clockTime}
        />
      ) : null}

      <motion.div
        className="portal-header-row"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <header className="glass-panel portal-header">
          <div className="portal-brand">
            <div className="portal-brand-top">
              <img
                src="/portal-mark.svg"
                alt=""
                className="portal-brand-logo"
              />
            </div>
          </div>

          <div className="portal-nav">
            {navItems.map((item) => {
              const Icon = item.icon

              return (
                <button
                  key={item.id}
                  className={`btn nav-btn ${item.iconOnly ? 'icon-nav-btn' : ''} ${activeNavTab === item.id ? 'btn-primary' : ''}`}
                  onClick={() => onSwitchTab(item.id)}
                  title={item.title}
                  data-icon-only={item.iconOnly ? 'true' : 'false'}
                  data-has-mobile-label={item.mobileLabel ? 'true' : 'false'}
                >
                  <span className="nav-btn-icon">
                    <Icon size={18} />
                  </span>
                  <span className="nav-btn-label">{item.label}</span>
                  {item.mobileLabel ? <span className="nav-btn-mobile-label">{item.mobileLabel}</span> : null}
                </button>
              )
            })}
          </div>
        </header>

        {hasPortalWideAccess ? (
        <div className="glass-panel portal-user-panel">
          <button
            type="button"
            className="portal-user-action"
            title="Уведомления и настройки"
            onClick={onOpenNotificationsPage}
          >
            <span className="portal-profile-avatar is-notification">
              <Bell size={16} />
              {notificationsOverview?.unread_count > 0 ? (
                <span className="portal-user-badge">{notificationsOverview.unread_count > 99 ? '99+' : notificationsOverview.unread_count}</span>
              ) : null}
            </span>
            <span className="portal-profile-label">Уведомления</span>
          </button>

          <button
            type="button"
            className="portal-user-action"
            title="Профиль"
            onClick={onOpenProfilePage}
          >
            <span className="portal-profile-avatar">
              <UserRound size={16} />
            </span>
            <span className="portal-profile-label">Профиль</span>
          </button>
        </div>
        ) : null}
      </motion.div>

      {showControls ? (
        <motion.div
          className="portal-controls"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
        <div className="portal-local-search">
          <Search size={20} color="var(--text-muted)" className="portal-local-search-icon" />
          <input
            ref={localSearchInputRef}
            type="text"
            className="input-glass"
            placeholder="Поиск (рус/eng)..."
            style={{ paddingLeft: '45px' }}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>

        {isEcpTab && <EcpDelegatedInstallWizard />}

        {isPhonebookTab && (
          <>
            <div className="glass-panel phonebook-scope-switcher">
              <button
                className={`phonebook-scope-btn ${phonebookDirectoryView === 'internal' ? 'is-active' : ''}`}
                onClick={() => onSetPhonebookDirectoryView('internal')}
                type="button"
              >
                Внутренние
              </button>
              <button
                className={`phonebook-scope-btn ${phonebookDirectoryView === 'external' ? 'is-active' : ''}`}
                onClick={() => onSetPhonebookDirectoryView('external')}
                type="button"
              >
                Внешние
              </button>
            </div>
            <button type="button" className="btn" onClick={onOpenPhonebookOrder}>
              <SlidersHorizontal size={16} />
              Порядок
            </button>
          </>
        )}

        {isCartridgesTab && onOpenInventoryReports && (
          <button className="btn btn-secondary" onClick={onOpenInventoryReports}>
            <BarChart3 size={18} /> Отчеты
          </button>
        )}

        {isPasswordTab && passwordStats && (
          <div className="glass-panel password-toolbar-cluster">
            <div className="password-toolbar-main">
              <PasswordSectionTabs activeView={passwordPrimaryView} onChange={onSetPasswordPrimaryView} />
              {passwordPrimaryView === PASSWORD_PRIMARY_VIEWS.network && (
                <PasswordNetworkTabs activeView={passwordNetworkView} onChange={onSetPasswordNetworkView} />
              )}
            </div>
            <PasswordStats stats={passwordStats} compact={true} />
          </div>
        )}

        {isEquipmentTab && (
          <div className="glass-panel equipment-toolbar-cluster">
            <div className="equipment-toolbar-tabs">
              <button
                className={`btn password-tab-btn ${equipmentSubview === 'stations' ? 'btn-primary is-active' : ''}`}
                onClick={() => onSetEquipmentSubview?.('stations')}
              >
                Рабочие места
              </button>
              <button
                className={`btn password-tab-btn ${equipmentSubview === 'phones' ? 'btn-primary is-active' : ''}`}
                onClick={() => onSetEquipmentSubview?.('phones')}
              >
                IP-телефоны
              </button>
            </div>
          </div>
        )}

        {isHomeLayoutActive && (
          <div className="glass-panel home-view-switcher">
            <button
              className={`home-view-btn ${homeViewMode === 'classic' ? 'is-active' : ''}`}
              onClick={() => setHomeViewMode('classic')}
              title="Классический вид"
            >
              <LayoutDashboard size={16} />
              Classic
            </button>
            <button
              className={`home-view-btn ${homeViewMode === 'neon' ? 'is-active' : ''}`}
              onClick={() => setHomeViewMode('neon')}
              title="Неоновый вид"
            >
              <Network size={16} />
              Neon
            </button>
          </div>
        )}

        {showActions && (
          <div className="portal-actions">
            {!isPhonebookTab && !isCartridgesTab && !isEquipmentTab && !isNotesTab && !isAccountableTab && (
              <div className="glass-panel view-toggle">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                  title="Сеткой"
                >
                  <LayoutDashboard size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-toggle-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                  title="Списком"
                >
                  <AlignJustify size={18} />
                </button>
              </div>
            )}

            {isCartridgesTab ? (
              <>
                <button className="btn btn-primary" onClick={onAddInventory}>
                  <Plus size={20} /> Модель
                </button>
                <button className="btn" onClick={onAddPrinter}>
                  <Plus size={20} /> Размещение
                </button>
              </>
            ) : isAccountableTab ? (
              <>
                <div className="glass-panel equipment-toolbar-summary">
                  <span>Позиций</span>
                  <strong>{accountableCount}</strong>
                </div>
                <button className="btn" onClick={onOpenAccountableImports}>
                  <History size={20} /> Импорты
                </button>
                <button className="btn btn-primary" onClick={onImportAccountable} disabled={accountableImporting}>
                  <Plus size={20} /> {accountableImporting ? 'Импорт...' : 'Импорт XLSX'}
                </button>
              </>
            ) : isEquipmentTab ? (
              <>
                <div className="glass-panel equipment-toolbar-summary">
                  <span>{equipmentSubview === 'phones' ? 'IP-телефонов' : 'Системных мест'}</span>
                  <strong>{equipmentSubview === 'phones' ? equipmentPhoneCount : equipmentStationCount}</strong>
                </div>
                {equipmentSubview === 'phones' ? (
                  <button className="btn btn-primary" onClick={onAddEquipmentPhone}>
                    <Plus size={20} /> IP-телефон
                  </button>
                ) : (
                  <button className="btn btn-primary" onClick={onAddEquipment}>
                    <Plus size={20} /> Рабочее место
                  </button>
                )}
              </>
            ) : (
              <button className="btn btn-primary" onClick={onAddRecord}>
                <Plus size={20} /> {isNotesTab ? 'Новая заметка' : 'Добавить'}
              </button>
            )}
          </div>
        )}
        </motion.div>
      ) : null}
    </>
  )
}
