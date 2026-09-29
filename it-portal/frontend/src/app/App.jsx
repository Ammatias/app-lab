import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AppShell } from './AppShell'
import { AppFooter } from './AppFooter'
import { getActivePageProps, buildHomePageProps, buildSectionPageProps } from './lib/activePageProps'
import { useAccountableController } from './hooks/useAccountableController'
import { useEntityModalController } from './hooks/useEntityModalController'
import { useHomeController } from './hooks/useHomeController'
import { useEquipmentPageData } from './hooks/useEquipmentPageData'
import { useInventoryPageData } from './hooks/useInventoryPageData'
import { useNotificationsVacationsController } from './hooks/useNotificationsVacationsController'
import { usePasswordPageData } from './hooks/usePasswordPageData'
import { usePhonebookPageData } from './hooks/usePhonebookPageData'
import { usePortalDataBootstrap } from './hooks/usePortalDataBootstrap'
import { usePortalRouter } from './hooks/usePortalRouter'
import { usePortalRouteState } from './hooks/usePortalRouteState'
import { useRecordsController } from './hooks/useRecordsController'
import { useDirectoryManagementController } from './hooks/useDirectoryManagementController'
import { usePortalNavOrder } from './hooks/usePortalNavOrder'
import { Providers } from './providers'
import { getPortalPath, tabPageRoutes } from './routes'
import { LoginScreen } from '../features/auth/components/LoginScreen'
import { fetchSessionUser } from '../features/auth/lib/session'
import { GlobalSearchResultsPage } from '../features/global-search/components/GlobalSearchResultsPage'
import { useGlobalSearchResults } from '../features/global-search/hooks/useGlobalSearchResults'
import { FAVORITES_GROUP_KEY } from '../features/home/config/homeLinkGroups'
import { buildInventoryAliasMap, normalizeInventoryValue } from '../features/inventory/lib/normalization'
import { InstallSelectorModal } from '../features/inventory/components/InstallSelectorModal'
import { NotificationToastStack } from '../features/notifications/components/NotificationToastStack'
import { SystemUpdateToastStack } from '../features/notifications/components/SystemUpdateToastStack'
import { EquipmentModal } from '../features/equipment/components/EquipmentModal'
import { AccountableAssetModal } from '../features/accountable-assets/components/AccountableAssetModal'
import { ItemModal } from '../features/item-modal/components/ItemModal'
import { PhonebookOrderModal } from '../features/phonebook/components/PhonebookOrderModal'
import { LoadingState } from '../shared/ui/LoadingState'
import { ConfirmDialog } from '../shared/ui/ConfirmDialog'
import { ScrollTopButton } from '../shared/ui/ScrollTopButton'
import { matchSearchValues } from '../shared/lib/search'
import { getEcpEffectiveValidUntil, parseEcpDate } from '../features/ecp/lib/ecpDates'
import { resolveEntityType } from '../features/records/lib/recordTypeMeta'
import { fetchPresenceEntries, sendPresenceHeartbeat } from '../entities/presence/api'
import {
  getPasswordSearchTokens,
  resolvePasswordSubtypeByView
} from '../features/passwords/lib/passwordSubtypes'
import { fetchCategories } from '../entities/categories/api'
import {
  fetchEquipment,
  fetchEquipmentPhones,
} from '../entities/equipment/api'
import { fetchItems } from '../entities/items/api'
import { fetchHomeCatalog } from '../entities/home/api'
import { createNote, deleteNote, fetchNotes, updateNote, fetchZones, createZone, updateZone, deleteZone } from '../entities/notes/api'
import {
  applyPhonebookNetworkLimit,
  clearPhonebookNetworkLimit,
  fetchPhonebook,
  generatePhonebookAgentScript,
  reorderPhonebookContacts
} from '../entities/phonebook/api'
import { fetchInventory, fetchInventoryAliases, fetchInventoryHistory } from '../entities/inventory/api'
import { fetchPrinters } from '../entities/printers/api'
const PRESENCE_ACTIVE_WINDOW_MS = 60 * 1000
const PRESENCE_HEARTBEAT_INTERVAL_MS = 45 * 1000

function resolvePresenceHeartbeatState(lastActivityAt) {
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return 'authorized'
  }

  const isVisible = document.visibilityState === 'visible'
  const isFocused = typeof document.hasFocus === 'function' ? document.hasFocus() : true
  const isActive = Date.now() - lastActivityAt <= PRESENCE_ACTIVE_WINDOW_MS

  return isVisible && isFocused && isActive ? 'online' : 'authorized'
}


const itemMatchesSearch = (item, query) => matchSearchValues([
  item.title,
  item.value,
  item.description,
  item.room,
  item.fio,
  item.login,
  item.valid_until,
  item.private_valid_until,
  item.file_name,
  item.name,
  item.department,
  item.model_name,
  item.cartridge_type_name,
  item.cartridge_name,
  item.note,
  item.subtype,
  item.source_sheet,
  item.is_draft ? 'черновик' : '',
  ...(item.type === 'password' ? getPasswordSearchTokens(item) : [])
], query)

function NoPortalAccessScreen() {
  return (
    <div className="portal-access-denied">
      <div className="glass-panel portal-access-denied-card">
        <span className="portal-access-denied-kicker">IT Portal</span>
        <h1>Нет доступа</h1>
        <p>У вашей учетной записи нет групп <code>itportal-full</code> или <code>itportal-audio-admin</code>.</p>
      </div>
    </div>
  )
}

export default function App() {
  const TAB_SHORTCUTS = ['password', 'anydesk', 'equipment', 'cartridges', 'ecp', 'phonebook', 'notes', 'home']
  const { location: portalLocation, navigate: navigatePortal } = usePortalRouter()
  const {
    activeRouteId,
    activeTab,
    activeNavTab,
    isUtilityRoute,
    homeViewMode,
    activeHomeGroup,
    isHomeEditMode,
    viewMode,
    phonebookDirectoryView,
    passwordPrimaryView,
    passwordNetworkView,
    equipmentSubview,
    switchTab,
    setHomeViewMode,
    setActiveHomeGroup,
    setHomeEditMode,
    setSectionViewMode,
    setPhonebookDirectoryRouteView,
    setPasswordPrimaryRouteView,
    setPasswordNetworkRouteView,
    setEquipmentSubviewRoute
  } = usePortalRouteState({
    portalLocation,
    navigatePortal
  })
  const [noteCreateRequestToken, setNoteCreateRequestToken] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [globalSearchQuery, setGlobalSearchQuery] = useState('')

  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [homeGroups, setHomeGroups] = useState([])
  const [homeWidgets, setHomeWidgets] = useState([])
  const [homeFavoriteLinks, setHomeFavoriteLinks] = useState(null)
  const [homeFavoriteItemOrder, setHomeFavoriteItemOrder] = useState([])
  const [notes, setNotes] = useState([])
  const [noteZones, setNoteZones] = useState([])
  const [phonebook, setPhonebook] = useState([])
  const [employees, setEmployees] = useState([])
  const [inventory, setInventory] = useState([])
  const [inventoryAliases, setInventoryAliases] = useState([])
  const [printers, setPrinters] = useState([])
  const [inventoryHistory, setInventoryHistory] = useState([])
  const [loadingInventoryHistory, setLoadingInventoryHistory] = useState(false)
  const [equipment, setEquipment] = useState([])
  const [equipmentPhones, setEquipmentPhones] = useState([])
  const [portalPresence, setPortalPresence] = useState([])

  const [loadingUser, setLoadingUser] = useState(true)
  const [loadingData, setLoadingData] = useState(false)
  const [hasCompletedInitialRouteLoad, setHasCompletedInitialRouteLoad] = useState(false)
  const [user, setUser] = useState(null)
  const allowedPortalTabs = Array.isArray(user?.allowed_tabs) ? user.allowed_tabs : []
  const allowedPortalTabsKey = allowedPortalTabs.join('|')
  const hasPortalWideAccess = Array.isArray(user?.permissions) && user.permissions.includes('portal.full')
  const hasAnyPortalAccess = !user || allowedPortalTabs.length > 0
  const isActiveRouteAllowed = !user || hasPortalWideAccess || allowedPortalTabs.includes(activeTab)

  const [installSelector, setInstallSelector] = useState({ show: false, cartridgeName: '', printerLocationId: '', stockType: '', options: [] })
  const [togglingPhonebookContactId, setTogglingPhonebookContactId] = useState(null)
  const [limitingPhonebookContactId, setLimitingPhonebookContactId] = useState(null)
  const [generatingPhonebookAgentContactId, setGeneratingPhonebookAgentContactId] = useState(null)
  const [showPhonebookOrderModal, setShowPhonebookOrderModal] = useState(false)
  const [savingPhonebookOrder, setSavingPhonebookOrder] = useState(false)
  const globalSearchInputRef = useRef(null)
  const localSearchInputRef = useRef(null)
  const presenceLastActivityAtRef = useRef(Date.now())
  const presenceLastStateRef = useRef('authorized')
  const presenceLastSentAtRef = useRef(0)
  const loadedDatasetKeysRef = useRef(new Set())
  const pendingDatasetPromisesRef = useRef(new Map())
  const previousActiveTabRef = useRef(activeTab)

  const { navOrder, reorderNavItems, resetNavOrder } = usePortalNavOrder({
    user,
    loadingUser
  })

  useEffect(() => {
    if (!user) return

    if (allowedPortalTabs.length === 0) {
      setHasCompletedInitialRouteLoad(true)
      return
    }

    if (!hasPortalWideAccess && !allowedPortalTabs.includes(activeTab)) {
      navigatePortal(getPortalPath(allowedPortalTabs[0]), { replace: true })
    }
  }, [activeTab, allowedPortalTabsKey, hasPortalWideAccess, navigatePortal, user])

  const {
    notificationsOverview,
    loadingNotifications,
    savingNotificationPreferences,
    savingNotificationRuleKind,
    toastNotifications,
    systemToasts,
    vacationsOverview,
    loadingVacations,
    savingVacation,
    deletingVacationId,
    importingVacationSchedule,
    exportingVacationSchedule,
    refreshNotifications,
    refreshVacations,
    dismissToast,
    dismissSystemToast,
    runSystemToastAction,
    enqueueSystemToast,
    enqueueUndoToast,
    handleNotificationRead,
    handleAllNotificationsRead,
    handleNotificationSnooze,
    handleSaveNotificationPreferences,
    handleSaveNotificationRule,
    handleSaveVacation,
    handleDeleteVacation,
    handleImportVacationSchedule,
    handleExportVacationSchedule,
    handleOpenNotification
  } = useNotificationsVacationsController({
    user,
    setGlobalSearchQuery,
    setSearchQuery,
    switchTab,
    setShowHistoryModal: () => navigatePortal(getPortalPath('inventoryHistory'))
  })

  useEffect(() => {
    if (previousActiveTabRef.current === activeTab) {
      return
    }

    previousActiveTabRef.current = activeTab
    setGlobalSearchQuery('')
    setSearchQuery('')
  }, [activeTab])

  useEffect(() => {
    if (!user || !hasPortalWideAccess || typeof window === 'undefined' || typeof document === 'undefined') {
      setPortalPresence([])
      return undefined
    }

    let cancelled = false

    const refreshPresence = async () => {
      try {
        const data = await fetchPresenceEntries()
        if (!cancelled) {
          setPortalPresence(Array.isArray(data?.entries) ? data.entries : [])
        }
      } catch (error) {
        console.error('Failed to fetch portal presence', error)
      }
    }

    const syncPresence = async (force = false, options = {}) => {
      const nextState = resolvePresenceHeartbeatState(presenceLastActivityAtRef.current)
      const now = Date.now()

      if (
        !force
        && presenceLastStateRef.current === nextState
        && now - presenceLastSentAtRef.current < PRESENCE_HEARTBEAT_INTERVAL_MS / 2
      ) {
        return
      }

      try {
        await sendPresenceHeartbeat({ state: nextState }, options)
        presenceLastStateRef.current = nextState
        presenceLastSentAtRef.current = now
      } catch (error) {
        console.error('Failed to sync portal presence', error)
      }
    }

    const handleActivity = () => {
      presenceLastActivityAtRef.current = Date.now()
      void syncPresence()
    }

    const handleVisibilityOrFocusChange = () => {
      if (document.visibilityState === 'visible') {
        presenceLastActivityAtRef.current = Date.now()
      }
      void syncPresence(true)
      void refreshPresence()
    }

    const handlePageHide = () => {
      void sendPresenceHeartbeat({ state: 'authorized' }, { keepalive: true }).catch(() => {})
    }

    presenceLastActivityAtRef.current = Date.now()
    void syncPresence(true)
    void refreshPresence()

    const heartbeatIntervalId = window.setInterval(() => {
      void syncPresence()
      void refreshPresence()
    }, PRESENCE_HEARTBEAT_INTERVAL_MS)

    window.addEventListener('focus', handleVisibilityOrFocusChange)
    window.addEventListener('blur', handleVisibilityOrFocusChange)
    window.addEventListener('pointerdown', handleActivity, { passive: true })
    window.addEventListener('keydown', handleActivity)
    window.addEventListener('scroll', handleActivity, { passive: true })
    window.addEventListener('pagehide', handlePageHide)
    document.addEventListener('visibilitychange', handleVisibilityOrFocusChange)

    return () => {
      cancelled = true
      window.clearInterval(heartbeatIntervalId)
      window.removeEventListener('focus', handleVisibilityOrFocusChange)
      window.removeEventListener('blur', handleVisibilityOrFocusChange)
      window.removeEventListener('pointerdown', handleActivity)
      window.removeEventListener('keydown', handleActivity)
      window.removeEventListener('scroll', handleActivity)
      window.removeEventListener('pagehide', handlePageHide)
      document.removeEventListener('visibilitychange', handleVisibilityOrFocusChange)
    }
  }, [hasPortalWideAccess, user])

  const {
    favoriteLinks,
    homeData,
    showHomeEditor,
    homeLinkFormMode,
    homeLinkDraft,
    homeGroupDraft,
    showHomeWidgetPicker,
    creatingHomeWidget,
    homeWidgetDraft,
    draggedHomeItemId,
    homeDropPreviewItemKey,
    homeDropPreviewMode,
    homeDropTargetGroupKey,
    homeDensityMode,
    homeGroupContextLabel,
    homeWidgetContextLabel,
    isFavoriteLink,
    removeFavoriteLink,
    toggleFavoriteLink,
    setHomeDensityMode,
    resetHomeEditor,
    resetHomeWidgetPicker,
    handleHomeLinkDraftChange,
    handleHomeGroupDraftChange,
    handleEditHomeLink,
    openFavoriteEditor,
    openHomeWidgetCreate,
    openHomeLinkCreate,
    openHomeGroupCreate,
    handleHomeEditorSubmit,
    handleDeleteHomeLink,
    handleHomeWidgetDraftChange,
    handleCreateHomeWidget,
    handleUpdateHomeWidget,
    handleDeleteHomeWidget,
    handleHomeItemDragStart,
    handleHomeItemDrag,
    handleHomeItemDragOver,
    handleHomeItemDrop,
    handleHomeItemDragEnd,
    handleHomeGroupDragOver,
    handleHomeGroupDragLeave,
    handleHomeGroupDrop
  } = useHomeController({
    user,
    loadingUser,
    activeTab,
    activeHomeGroup,
    isHomeEditMode,
    searchQuery,
    homeGroups,
    homeWidgets,
    homeFavoriteLinks,
    homeFavoriteItemOrder,
    setHomeFavoriteLinks,
    setHomeFavoriteItemOrder,
    setHomeEditMode,
    setActiveHomeGroup,
    refreshHomeCatalog,
    enqueueUndoToast,
    getRequestErrorMessage
  })

  const {
    accountableAssets,
    accountableWrittenOffAssets,
    accountableImportBatches,
    accountableImportDiff,
    loadingAccountableAssets,
    loadingAccountableImportBatches,
    loadingAccountableImportDiff,
    importingAccountableAssets,
    generatingAccountableWriteoffArchive,
    rollingBackAccountableBatchId,
    accountableFilters,
    accountableRequestFilters,
    selectedAccountableLeftBatchId,
    selectedAccountableRightBatchId,
    showAccountableAssetModal,
    accountableAssetForm,
    accountableAssetModalMode,
    setAccountableAssetForm,
    refreshAccountableAssets,
    refreshAccountableWrittenOffAssets,
    refreshAccountableImportBatches,
    refreshAccountableImportDiff,
    closeAccountableAssetModal,
    openAddAccountableAssetModal,
    openEditAccountableAssetModal,
    handleChangeAccountableFilters,
    handleSelectAccountableImportBatches,
    handleRollbackAccountableImportBatch,
    handleImportAccountableAssets,
    handleSaveAccountableAsset,
    confirmDeleteAccountableAsset,
    handleGenerateAccountableWriteoffArchive
  } = useAccountableController({
    user,
    activeTab,
    searchQuery,
    loadedDatasetKeysRef,
    getRequestErrorMessage
  })

  const {
    locationsDirectory,
    loadingLocations,
    departmentsDirectory,
    loadingDepartments,
    archivedEmployees,
    loadingArchivedEmployees,
    refreshEmployees,
    refreshLocations,
    refreshDepartments,
    refreshArchivedEmployees,
    handleSaveEmployeeAccount,
    handleArchiveEmployeeAccount,
    handleRestoreEmployeeAccount,
    handleCreateDepartment,
    handleUpdateDepartment,
    handleDeleteDepartment,
    handleCreateDepartmentAlias,
    handleUpdateDepartmentAlias,
    handleDeleteDepartmentAlias,
    handleMergeDepartments,
    handleCreateLocation,
    handleUpdateLocation,
    handleDeleteLocation,
    handleCreateLocationAlias,
    handleUpdateLocationAlias,
    handleDeleteLocationAlias,
    handleMergeLocations,
    handleGenerateLocationAgentScript
  } = useDirectoryManagementController({
    user,
    loadedDatasetKeysRef,
    setEmployees,
    setPhonebook,
    setPrinters,
    setItems,
    refreshEquipment,
    refreshAccountableAssets,
    accountableRequestFilters,
    getRequestErrorMessage
  })

  const currentPasswordSubtype = resolvePasswordSubtypeByView({
    primaryView: passwordPrimaryView,
    networkView: passwordNetworkView
  })
  const {
    showItemModal,
    showEquipmentModal,
    modalMode,
    editingItemId,
    editingEquipmentId,
    modalEntityType,
    editingItemType,
    newItemParams,
    equipmentForm,
    currentItemType,
    setNewItemParams,
    setEquipmentForm,
    openAddModal,
    openAddIpPhoneModal,
    openEditModal,
    closeModal,
    closeEquipmentModal,
    buildEquipmentPayload: buildEquipmentPayloadFromModal
  } = useEntityModalController({
    activeTab,
    currentPasswordSubtype,
    phonebookDirectoryView,
    employees
  })
  const inventoryAliasMap = useMemo(() => buildInventoryAliasMap(inventoryAliases), [inventoryAliases])
  const isGlobalSearchActive = String(globalSearchQuery || '').trim().length >= 2
  const isPhonebookDataActive =
    activeTab === 'phonebook'
    || (showItemModal && modalEntityType === 'phonebook')
  const isInventoryDataActive =
    activeTab === 'cartridges'
    || (showItemModal && (modalEntityType === 'inventory' || modalEntityType === 'printer'))
  const isEquipmentDataActive =
    activeTab === 'equipment'
    || showEquipmentModal
    || (showItemModal && modalEntityType === 'equipment_phone')
  const isPasswordDataActive =
    activeTab === 'password'
    || (showItemModal && modalEntityType === 'password')
  const {
    groupedPhonebook,
    phonebookOrderGroups,
    phonebookOrganizations,
    phonebookLoading
  } = usePhonebookPageData({
    active: isPhonebookDataActive,
    phonebook,
    searchQuery,
    directoryView: phonebookDirectoryView,
    loadingData
  })
  const {
    groupedInventory,
    filteredPrinters,
    availableCartridgeTypes,
    availablePrinterModels,
    inventoryLoading
  } = useInventoryPageData({
    active: isInventoryDataActive,
    inventory,
    printers,
    searchQuery,
    loadingData
  })
  const {
    equipmentIpPhones,
    filteredEquipmentPhones,
    equipmentDepartments,
    equipmentPhoneGroups,
    equipmentSummary,
    equipmentLoading
  } = useEquipmentPageData({
    active: isEquipmentDataActive,
    searchable: isGlobalSearchActive,
    equipment,
    equipmentPhones,
    employees,
    searchQuery,
    loadingData
  })
  const globalSearch = useGlobalSearchResults({
    query: globalSearchQuery,
    items,
    phonebook,
    inventory,
    equipment,
    equipmentPhones,
    employees,
    favoriteLinks,
    homeGroups
  })
  const {
    passwordViewModel,
    passwordLoading
  } = usePasswordPageData({
    active: isPasswordDataActive,
    items,
    searchQuery,
    primaryView: passwordPrimaryView,
    networkView: passwordNetworkView,
    loadingData
  })

  const {
    itemToDelete,
    clearDelete,
    handleDeleteClick,
    confirmDelete,
    handleEquipmentSave,
    handleSave,
    handleTogglePhonebookAccounting,
    handleInstallCartridge,
    installingCartridgeKey
  } = useRecordsController({
    activeTab,
    categories,
    employees,
    inventory,
    inventoryAliasMap,
    newItemParams,
    equipmentForm,
    modalMode,
    modalEntityType,
    editingItemId,
    editingEquipmentId,
    editingItemType,
    showHistoryModal: activeRouteId === 'inventoryHistory',
    installSelector,
    setItems,
    setPhonebook,
    setInventory,
    setPrinters,
    setEmployees,
    setEquipment,
    setEquipmentPhones,
    setInstallSelector,
    setTogglingPhonebookContactId,
    refreshEmployees,
    refreshEquipment,
    refreshEquipmentPhones,
    refreshInventory,
    refreshPrinters,
    refreshInventoryHistory,
    refreshNotifications,
    closeModal,
    closeEquipmentModal,
    buildEquipmentPayloadFromModal,
    getRequestErrorMessage,
    normalizeInventoryValue
  })

  const isHomeTab = activeTab === 'home'
  const isHomeLayoutActive = isHomeTab && !globalSearch.isOpen
  const isRecordsLoading = (activeTab === 'anydesk' || activeTab === 'ecp') && loadingData && items.length === 0

  const visibleRecordItems = useMemo(() => {
    if (activeTab === 'home' || activeTab === 'phonebook' || activeTab === 'cartridges' || activeTab === 'password' || activeTab === 'equipment' || activeTab === 'notes' || activeTab === 'accountable' || activeTab === 'file-storage' || activeTab === 'integrations') {
      return []
    }

    const filtered = items
      .filter((item) => item.type === activeTab)
      .filter((item) => itemMatchesSearch(item, searchQuery))

    if (activeTab === 'ecp') {
      return filtered.slice().sort((a, b) => {
        const dateA = parseEcpDate(getEcpEffectiveValidUntil(a.valid_until, a.private_valid_until))
        const dateB = parseEcpDate(getEcpEffectiveValidUntil(b.valid_until, b.private_valid_until))

        if (dateA && dateB) {
          const diff = dateA.getTime() - dateB.getTime()
          if (diff !== 0) return diff
        } else if (dateA && !dateB) {
          return -1
        } else if (!dateA && dateB) {
          return 1
        }

        return (a.title || '').localeCompare(b.title || '')
      })
    }

    return filtered.slice().sort((a, b) => (a.title || '').localeCompare(b.title || ''))
  }, [activeTab, items, searchQuery])

  const isGlobalSearchLoading =
    globalSearch.isReady &&
    loadingData &&
    items.length === 0 &&
    phonebook.length === 0 &&
    inventory.length === 0 &&
    equipment.length === 0 &&
    equipmentPhones.length === 0 &&
    homeGroups.length === 0

  const refreshItemRecords = async () => {
    const [categoryData, allItems] = await Promise.all([fetchCategories(), fetchItems()])
    setCategories(categoryData)
    setItems(allItems)
    loadedDatasetKeysRef.current.add('items')
    return { categoryData, allItems }
  }

  const refreshPhonebookData = async () => {
    const phonebookData = await fetchPhonebook()
    setPhonebook(phonebookData)
    loadedDatasetKeysRef.current.add('phonebook')
    return phonebookData
  }

  const handleSavePhonebookOrder = async (items) => {
    setSavingPhonebookOrder(true)

    try {
      const response = await reorderPhonebookContacts(items)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось сохранить порядок справочника',
          notFound: 'Один из контактов уже удален или не найден.',
          conflict: 'Не удалось сохранить порядок из-за конфликта данных.'
        }))
      }

      const orderedPhonebook = await response.json()
      setPhonebook(orderedPhonebook)
      setShowPhonebookOrderModal(false)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось сохранить порядок справочника')
    } finally {
      setSavingPhonebookOrder(false)
    }
  }

  const handleGeneratePhonebookAgentScript = async (contact) => {
    if (!contact?.id) return

    setGeneratingPhonebookAgentContactId(contact.id)
    try {
      const { blob, fileName } = await generatePhonebookAgentScript(contact.id)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)

      const phonebookData = await fetchPhonebook()
      setPhonebook(phonebookData)
      loadedDatasetKeysRef.current.add('phonebook')
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось создать установщик Tactical RMM')
      throw error
    } finally {
      setGeneratingPhonebookAgentContactId(null)
    }
  }

  const handleApplyPhonebookNetworkLimit = async (contact, limitMbps) => {
    if (!contact?.id) return

    setLimitingPhonebookContactId(contact.id)
    try {
      const response = await applyPhonebookNetworkLimit(contact.id, limitMbps)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось ограничить скорость',
          notFound: 'Контакт уже удален или не найден.'
        }))
      }

      const phonebookData = await response.json()
      setPhonebook(phonebookData)
      loadedDatasetKeysRef.current.add('phonebook')
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось ограничить скорость')
      throw error
    } finally {
      setLimitingPhonebookContactId(null)
    }
  }

  const handleClearPhonebookNetworkLimit = async (contact) => {
    if (!contact?.id) return

    setLimitingPhonebookContactId(contact.id)
    try {
      const response = await clearPhonebookNetworkLimit(contact.id)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось отменить ограничение скорости',
          notFound: 'Контакт уже удален или не найден.'
        }))
      }

      const phonebookData = await response.json()
      setPhonebook(phonebookData)
      loadedDatasetKeysRef.current.add('phonebook')
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось отменить ограничение скорости')
      throw error
    } finally {
      setLimitingPhonebookContactId(null)
    }
  }

  async function refreshHomeCatalog() {
    const homeCatalogData = await fetchHomeCatalog()
    setHomeGroups(homeCatalogData.groups || [])
    setHomeWidgets(homeCatalogData.widgets || [])
    setHomeFavoriteLinks(homeCatalogData.favorite_links || [])
    setHomeFavoriteItemOrder(homeCatalogData.favorite_item_order || [])
    loadedDatasetKeysRef.current.add('home')
    return homeCatalogData
  }

  const refreshInventoryAliasesData = async () => {
    const aliasesData = await fetchInventoryAliases()
    setInventoryAliases(aliasesData)
    loadedDatasetKeysRef.current.add('inventoryAliases')
    return aliasesData
  }

  const runDatasetLoader = useCallback(async (datasetKey, loader, { force = false } = {}) => {
    if (!force && loadedDatasetKeysRef.current.has(datasetKey)) {
      return undefined
    }

    if (!force && pendingDatasetPromisesRef.current.has(datasetKey)) {
      return pendingDatasetPromisesRef.current.get(datasetKey)
    }

    const promise = Promise.resolve()
      .then(() => loader())
      .then((result) => {
        loadedDatasetKeysRef.current.add(datasetKey)
        return result
      })
      .finally(() => {
        pendingDatasetPromisesRef.current.delete(datasetKey)
      })

    pendingDatasetPromisesRef.current.set(datasetKey, promise)
    return promise
  }, [])

  const getMissingDatasetKeys = useCallback((datasetKeys) => (
    datasetKeys.filter((datasetKey) => !loadedDatasetKeysRef.current.has(datasetKey))
  ), [])

  const ensureSharedAppData = useCallback(async () => {
    await Promise.all([
      runDatasetLoader('employees', refreshEmployees),
      runDatasetLoader('locations', () => refreshLocations({ silent: true })),
      runDatasetLoader('departments', () => refreshDepartments({ silent: true }))
    ])
  }, [refreshDepartments, refreshEmployees, refreshLocations, runDatasetLoader])

  const ensureRouteData = useCallback(async (tabId) => {
    switch (tabId) {
      case 'home':
        await Promise.all([
          runDatasetLoader('home', refreshHomeCatalog),
          runDatasetLoader('phonebook', refreshPhonebookData),
          runDatasetLoader('inventory', refreshInventory)
        ])
        return
      case 'notes':
        await runDatasetLoader('notes', refreshNotes)
        return
      case 'password':
      case 'anydesk':
      case 'ecp':
        await runDatasetLoader('items', refreshItemRecords)
        return
      case 'phonebook':
        await Promise.all([
          runDatasetLoader('phonebook', refreshPhonebookData),
          runDatasetLoader('items', refreshItemRecords)
        ])
        return
      case 'cartridges':
        await Promise.all([
          runDatasetLoader('inventory', refreshInventory),
          runDatasetLoader('inventoryAliases', refreshInventoryAliasesData),
          runDatasetLoader('printers', refreshPrinters)
        ])
        return
      case 'equipment':
        await Promise.all([
          runDatasetLoader('equipment', refreshEquipment),
          runDatasetLoader('equipmentPhones', refreshEquipmentPhones)
        ])
        return
      default:
        return
    }
  }, [runDatasetLoader])

  const ensureGlobalSearchData = useCallback(async () => {
    await Promise.all([
      runDatasetLoader('items', refreshItemRecords),
      runDatasetLoader('home', refreshHomeCatalog),
      runDatasetLoader('phonebook', refreshPhonebookData),
      runDatasetLoader('inventory', refreshInventory),
      runDatasetLoader('equipment', refreshEquipment),
      runDatasetLoader('equipmentPhones', refreshEquipmentPhones)
    ])
  }, [runDatasetLoader])

  useEffect(() => {
    fetchSessionUser()
      .then((data) => {
        setUser(data)
        if (data) {
          setLoadingData(true)
        }
      })
      .catch(() => {
        setUser(null)
        setLoadingData(false)
      })
      .finally(() => setLoadingUser(false))
  }, [])

  useEffect(() => {
    if (user) return
    loadedDatasetKeysRef.current.clear()
    pendingDatasetPromisesRef.current.clear()
    presenceLastActivityAtRef.current = Date.now()
    presenceLastStateRef.current = 'authorized'
    presenceLastSentAtRef.current = 0
    setPortalPresence([])
    setLoadingInventoryHistory(false)
    setLoadingData(false)
    setHasCompletedInitialRouteLoad(false)
    setCategories([])
    setItems([])
    setHomeGroups([])
    setHomeWidgets([])
    setHomeFavoriteLinks(null)
    setHomeFavoriteItemOrder([])
    setNotes([])
    setNoteZones([])
    setPhonebook([])
    setEmployees([])
    setInventory([])
    setInventoryAliases([])
    setPrinters([])
    setInventoryHistory([])
    setEquipment([])
    setEquipmentPhones([])
  }, [user])

  usePortalDataBootstrap({
    user,
    activeTab,
    globalSearchQuery,
    getMissingDatasetKeys,
    ensureSharedAppData,
    ensureRouteData,
    ensureGlobalSearchData,
    setLoadingData,
    onInitialRouteReady: () => setHasCompletedInitialRouteLoad(true)
  })

  useEffect(() => {
    if (!user || (activeTab !== 'phonebook' && activeTab !== 'home')) return undefined

    let cancelled = false
    const intervalId = window.setInterval(() => {
      fetchPhonebook()
        .then((phonebookData) => {
          if (!cancelled) setPhonebook(phonebookData)
        })
        .catch((error) => {
          console.error('Failed to refresh live phonebook data', error)
        })
    }, 5000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [activeTab, user])

  useEffect(() => {
    const focusAndSelect = (inputRef) => {
      const input = inputRef.current
      if (!input) return
      input.focus()
      input.select()
    }

    const handleKeyboardShortcuts = (event) => {
      const key = event.key.toLowerCase()
      const hasPrimaryModifier = event.ctrlKey || event.metaKey

      if (hasPrimaryModifier && key === 'f') {
        if (!hasPortalWideAccess) return
        event.preventDefault()
        focusAndSelect(globalSearchInputRef)
        return
      }

      if (key === 'escape' && globalSearch.isOpen) {
        event.preventDefault()
        setGlobalSearchQuery('')
        return
      }

      if ((hasPrimaryModifier && key === 'k') || (event.ctrlKey && event.shiftKey && key === 'f')) {
        if (!hasPortalWideAccess) return
        event.preventDefault()
        focusAndSelect(localSearchInputRef)
        return
      }

      if (event.altKey && !hasPrimaryModifier && /^[1-8]$/.test(key)) {
        event.preventDefault()
        const targetTab = TAB_SHORTCUTS[Number(key) - 1]
        if (allowedPortalTabs.includes(targetTab)) {
          switchTab(targetTab)
        }
        return
      }

      if (hasPrimaryModifier && key === 'n') {
        if (!hasPortalWideAccess) return
        event.preventDefault()

        if (activeTab === 'home') {
          openFavoriteEditor()
          return
        }

        if (activeTab === 'phonebook') {
          openAddModal('phonebook')
          return
        }

        if (activeTab === 'cartridges') {
          openAddModal('inventory')
          return
        }

        if (activeTab === 'notes') {
          requestNewNote()
          return
        }

        if (activeTab === 'equipment') {
          if (equipmentSubview === 'phones') {
            openAddIpPhoneModal()
          } else {
            openAddModal('equipment')
          }
          return
        }

        if (activeTab === 'accountable') {
          openAddAccountableAssetModal()
          return
        }

        if (activeTab === 'integrations') {
          return
        }

        openAddModal()
        return
      }

      if (event.ctrlKey && event.shiftKey && key === 'h') {
        event.preventDefault()
        switchTab('home')
      }
    }

    window.addEventListener('keydown', handleKeyboardShortcuts)
    return () => window.removeEventListener('keydown', handleKeyboardShortcuts)
  }, [activeTab, allowedPortalTabsKey, equipmentSubview, globalSearch.isOpen, hasPortalWideAccess])

  useEffect(() => {
    if (!user || activeRouteId !== 'inventoryHistory') return

    refreshInventoryHistory({ silent: false }).catch((error) => {
      console.error('Failed to fetch inventory history', error)
    })
  }, [activeRouteId, user])

  async function refreshEquipment() {
    const equipmentData = await fetchEquipment()
    setEquipment(equipmentData)
    loadedDatasetKeysRef.current.add('equipment')
    return equipmentData
  }

  async function refreshInventory() {
    const inventoryData = await fetchInventory()
    setInventory(inventoryData)
    loadedDatasetKeysRef.current.add('inventory')
    return inventoryData
  }

  async function refreshPrinters() {
    const printersData = await fetchPrinters()
    setPrinters(printersData)
    loadedDatasetKeysRef.current.add('printers')
    return printersData
  }

  async function refreshEquipmentPhones() {
    const phonesData = await fetchEquipmentPhones()
    setEquipmentPhones(phonesData)
    loadedDatasetKeysRef.current.add('equipmentPhones')
    return phonesData
  }

  async function refreshInventoryHistory({ silent = false, filters = {} } = {}) {
    if (!silent) {
      setLoadingInventoryHistory(true)
    }

    try {
      const historyData = await fetchInventoryHistory(filters)
      setInventoryHistory(historyData)
      return historyData
    } finally {
      if (!silent) {
        setLoadingInventoryHistory(false)
      }
    }
  }

  const refreshNotes = async () => {
    const [notesData, zonesData] = await Promise.all([fetchNotes(), fetchZones()])
    setNotes(notesData)
    setNoteZones(zonesData)
    loadedDatasetKeysRef.current.add('notes')
  }

  const handleCreateZone = async (payload) => {
    try {
      const response = await createZone(payload)
      if (response.ok) await refreshNotes()
    } catch (error) {
      console.error('Failed to create zone', error)
    }
  }

  const handleUpdateZone = async (zoneId, payload) => {
    try {
      const response = await updateZone(zoneId, payload)
      if (response.ok) {
        const updated = await response.json()
        setNoteZones(prev => prev.map(z => z.id === zoneId ? updated : z))
      }
    } catch (error) {
      console.error('Failed to update zone', error)
    }
  }

  const handleDeleteZone = async (zone) => {
    if (!window.confirm(`Удалить магнитную зону "${zone.title}"?`)) return

    try {
      const response = await deleteZone(zone.id)
      if (response.ok) {
        setNoteZones(prev => prev.filter(z => z.id !== zone.id))
      }
    } catch (error) {
      console.error('Failed to delete zone', error)
    }
  }

  const requestNewNote = () => {
    setNoteCreateRequestToken((prev) => prev + 1)
  }

  const readResponseText = async (response) => {
    try {
      return (await response.text()).trim()
    } catch {
      return ''
    }
  }

  async function getRequestErrorMessage(response, { fallback, notFound, conflict, badRequest }) {
    const serverMessage = await readResponseText(response)

    if (response.status === 400) {
      return badRequest || serverMessage || fallback
    }

    if (response.status === 404) {
      return notFound || 'Запись уже удалена или не найдена.'
    }

    if (response.status === 409) {
      return conflict || serverMessage || fallback
    }

    return serverMessage || fallback
  }

  const handleCreateNote = async (payload) => {
    try {
      const response = await createNote(payload)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось создать заметку',
          conflict: 'Не удалось создать заметку: проверьте заголовок, доступы и данные.'
        }))
      }

      await refreshNotes()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось создать заметку')
      throw error
    }
  }

  const handleUpdateNote = async (noteId, payload, options = {}) => {
    const { refresh = true, silent = false } = options

    try {
      const response = await updateNote(noteId, payload)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось обновить заметку',
          notFound: 'Заметка уже удалена или не найдена.',
          conflict: 'Не удалось обновить заметку из-за конфликта прав или данных.'
        }))
      }

      if (refresh) {
        await refreshNotes()
      } else {
        setNotes((currentNotes) => currentNotes.map((note) => (
          note.id === noteId
            ? {
              ...note,
              title: payload.title,
              content: payload.content,
              color: payload.color ?? note.color,
              kind: payload.kind ?? note.kind,
              status: payload.status ?? note.status,
              task_priority: payload.task_priority ?? note.task_priority,
              due_at: payload.due_at ?? note.due_at,
              reminder_enabled: payload.reminder_enabled ?? note.reminder_enabled,
              reminder_at: payload.reminder_at ?? note.reminder_at,
              reminder_repeat_count: payload.reminder_repeat_count ?? note.reminder_repeat_count,
              reminder_repeat_interval_minutes: payload.reminder_repeat_interval_minutes ?? note.reminder_repeat_interval_minutes,
              due_notification_enabled: payload.due_notification_enabled ?? note.due_notification_enabled,
              assignees: Array.isArray(payload.assigned_usernames)
                ? payload.assigned_usernames.map((username) => ({ username }))
                : note.assignees,
              notify_on_changes: payload.notify_on_changes ?? note.notify_on_changes,
              pos_x: payload.pos_x ?? note.pos_x,
              pos_y: payload.pos_y ?? note.pos_y,
              z_index: payload.z_index ?? note.z_index,
              is_locked: payload.is_locked ?? note.is_locked,
              updated_at: new Date().toISOString()
            }
            : note
        )))
      }
    } catch (error) {
      console.error(error)
      if (!silent) {
        alert(error.message || 'Не удалось обновить заметку')
      }
      throw error
    }
  }

  const handleDeleteNote = async (note) => {
    try {
      const response = await deleteNote(note.id)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось удалить заметку',
          notFound: 'Заметка уже удалена или не найдена.'
        }))
      }

      await refreshNotes()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить заметку')
      throw error
    }
  }

  const ActivePage = tabPageRoutes[activeRouteId] || tabPageRoutes.home
  const homePageProps = buildHomePageProps({
    homeViewMode,
    homeData,
    employees,
    phonebook,
    limitingContactId: limitingPhonebookContactId,
    handleApplyPhonebookNetworkLimit,
    handleClearPhonebookNetworkLimit,
    inventory,
    portalPresence,
    vacationsOverview,
    user,
    isHomeEditMode,
    homeDensityMode,
    homeDropTargetGroupKey,
    showHomeEditor,
    homeLinkFormMode,
    homeLinkDraft,
    homeGroupDraft,
    homeGroupContextLabel,
    homeWidgetContextLabel,
    showHomeWidgetPicker,
    creatingHomeWidget,
    homeWidgetDraft,
    draggedHomeItemId,
    homeDropPreviewItemKey,
    homeDropPreviewMode,
    isFavoriteLink,
    setActiveHomeGroup,
    setHomeEditMode,
    resetHomeEditor,
    resetHomeWidgetPicker,
    setHomeDensityMode,
    openFavoriteEditor,
    openHomeLinkCreate,
    openHomeGroupCreate,
    openHomeWidgetCreate,
    handleHomeEditorSubmit,
    handleHomeLinkDraftChange,
    handleHomeGroupDraftChange,
    handleHomeWidgetDraftChange,
    handleCreateHomeWidget,
    handleUpdateHomeWidget,
    handleHomeItemDragStart,
    handleHomeItemDrag,
    handleHomeItemDragOver,
    handleHomeItemDrop,
    handleHomeItemDragEnd,
    handleHomeGroupDragOver,
    handleHomeGroupDragLeave,
    handleHomeGroupDrop,
    removeFavoriteLink,
    handleEditHomeLink,
    handleDeleteHomeLink,
    handleDeleteHomeWidget,
    toggleFavoriteLink
  })
  const noteShareOptions = useMemo(() => {
    const profiles = vacationsOverview?.profiles || []
    const currentUsername = (user?.username || '').trim().toLowerCase()
    const seenUsernames = new Set()

    return profiles
      .map((profile) => {
        const username = String(profile?.username || '').trim().toLowerCase()
        if (!username || username === currentUsername || seenUsernames.has(username)) {
          return null
        }

        seenUsernames.add(username)

        return {
          username,
          name: profile.display_name || profile.username
        }
      })
      .filter(Boolean)
  }, [vacationsOverview?.profiles, user?.username])

  const noteAssigneeOptions = useMemo(() => {
    const profiles = vacationsOverview?.profiles || []
    const currentUsername = (user?.username || '').trim().toLowerCase()
    const seenUsernames = new Set()
    const options = []

    if (currentUsername) {
      seenUsernames.add(currentUsername)
      options.push({
        username: currentUsername,
        name: user?.name || user?.display_name || currentUsername
      })
    }

    for (const profile of profiles) {
      const username = String(profile?.username || '').trim().toLowerCase()
      if (!username || seenUsernames.has(username)) {
        continue
      }

      seenUsernames.add(username)
      options.push({
        username,
        name: profile.display_name || profile.username
      })
    }

    return options
  }, [vacationsOverview?.profiles, user])

  const {
    phonebookPageProps,
    inventoryPageProps,
    accountablePageProps,
    integrationsPageProps,
    equipmentPageProps,
    passwordPageProps,
    notesPageProps,
    recordsPageProps
  } = buildSectionPageProps({
    groupedPhonebook,
    phonebookLoading,
    phonebookDirectoryView,
    items,
    openEditModal,
    handleTogglePhonebookAccounting,
    togglingPhonebookContactId,
    handleApplyPhonebookNetworkLimit,
    handleClearPhonebookNetworkLimit,
    limitingPhonebookContactId,
    handleGeneratePhonebookAgentScript,
    generatingPhonebookAgentContactId,
    groupedInventory,
    filteredPrinters,
    inventoryLoading,
    handleDeleteClick,
    handleInstallCartridge,
    installingCartridgeKey,
    accountableAssets,
    accountableWrittenOffAssets,
    loadingAccountableAssets,
    searchQuery,
    accountableFilters,
    handleChangeAccountableFilters,
    accountableImportBatches,
    loadingAccountableImportBatches,
    accountableImportDiff,
    loadingAccountableImportDiff,
    selectedAccountableLeftBatchId,
    selectedAccountableRightBatchId,
    rollingBackAccountableBatchId,
    handleSelectAccountableImportBatches,
    handleRollbackAccountableImportBatch,
    importingAccountableAssets,
    generatingAccountableWriteoffArchive,
    handleGenerateAccountableWriteoffArchive,
    handleImportAccountableAssets,
    onOpenWriteoffPage: () => navigatePortal(getPortalPath('accountableWriteoff')),
    openAddAccountableAssetModal,
    openEditAccountableAssetModal,
    equipmentSubview,
    equipmentDepartments,
    equipmentPhoneGroups,
    equipmentLoading,
    passwordViewModel,
    passwordLoading,
    notes,
    noteZones,
    noteShareOptions,
    noteAssigneeOptions,
    noteCreateRequestToken,
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote,
    handleCreateZone,
    handleUpdateZone,
    handleDeleteZone,
    viewMode,
    visibleRecordItems,
    isRecordsLoading
  })

  const activePageProps = getActivePageProps({
    activeTab,
    homePageProps,
    notesPageProps,
    passwordPageProps,
    accountablePageProps,
    integrationsPageProps,
    equipmentPageProps,
    phonebookPageProps,
    inventoryPageProps,
    recordsPageProps
  })

  const navigateBackOrTo = useCallback((fallbackPath) => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back()
      return
    }

    navigatePortal(fallbackPath)
  }, [navigatePortal])

  const utilityPageProps = {
    'museum-map': {
      user,
      locations: locationsDirectory
    },
    profile: {
      user,
      vacationsOverview,
      portalPresence,
      navOrder,
      onReorderNavItems: reorderNavItems,
      onResetNavItems: resetNavOrder,
      onNavigateEmployees: () => navigatePortal(getPortalPath('employees')),
      onNavigateLocations: () => navigatePortal(getPortalPath('locations')),
      onNavigateDepartments: () => navigatePortal(getPortalPath('departments')),
      onNavigateVacations: () => navigatePortal(getPortalPath('vacations')),
      onBack: () => navigateBackOrTo(getPortalPath('home'))
    },
    notifications: {
      overview: notificationsOverview,
      loading: loadingNotifications,
      savingPreferences: savingNotificationPreferences,
      savingRuleKind: savingNotificationRuleKind,
      onRefresh: () => refreshNotifications({ announce: false }),
      onSavePreferences: handleSaveNotificationPreferences,
      onSaveRule: handleSaveNotificationRule,
      onMarkRead: handleNotificationRead,
      onMarkAllRead: handleAllNotificationsRead,
      onHide: handleNotificationSnooze,
      onOpenNotification: handleOpenNotification,
      onBack: () => navigateBackOrTo(getPortalPath('home'))
    },
    employees: {
      employees,
      archivedEmployees,
      departments: departmentsDirectory,
      locations: locationsDirectory,
      loadingArchive: loadingArchivedEmployees,
      onSave: handleSaveEmployeeAccount,
      onArchive: handleArchiveEmployeeAccount,
      onRestore: handleRestoreEmployeeAccount,
      onRefreshArchive: refreshArchivedEmployees,
      onBack: () => navigatePortal(getPortalPath('profile'))
    },
    departments: {
      departments: departmentsDirectory,
      loading: loadingDepartments,
      onRefresh: refreshDepartments,
      onCreateDepartment: handleCreateDepartment,
      onUpdateDepartment: handleUpdateDepartment,
      onDeleteDepartment: handleDeleteDepartment,
      onCreateAlias: handleCreateDepartmentAlias,
      onUpdateAlias: handleUpdateDepartmentAlias,
      onDeleteAlias: handleDeleteDepartmentAlias,
      onMergeDepartments: handleMergeDepartments,
      onBack: () => navigatePortal(getPortalPath('profile'))
    },
    locations: {
      locations: locationsDirectory,
      loading: loadingLocations,
      onRefresh: refreshLocations,
      onCreateLocation: handleCreateLocation,
      onUpdateLocation: handleUpdateLocation,
      onDeleteLocation: handleDeleteLocation,
      onCreateAlias: handleCreateLocationAlias,
      onUpdateAlias: handleUpdateLocationAlias,
      onDeleteAlias: handleDeleteLocationAlias,
      onMergeLocations: handleMergeLocations,
      onGenerateAgentScript: handleGenerateLocationAgentScript,
      onBack: () => navigatePortal(getPortalPath('profile'))
    },
    vacations: {
      user,
      vacationsOverview,
      loading: loadingVacations,
      saving: savingVacation,
      deletingId: deletingVacationId,
      importing: importingVacationSchedule,
      exporting: exportingVacationSchedule,
      onRefresh: () => refreshVacations({ silent: false }),
      onSave: handleSaveVacation,
      onDelete: handleDeleteVacation,
      onImportSchedule: handleImportVacationSchedule,
      onExportSchedule: handleExportVacationSchedule,
      onBack: () => navigatePortal(getPortalPath('profile'))
    },
    inventoryHistory: {
      inventoryHistory,
      loading: loadingInventoryHistory,
      inventory,
      printers,
      aliases: inventoryAliases,
      onBack: () => navigatePortal(getPortalPath('cartridges'))
    },
    accountableImports: {
      importBatches: accountableImportBatches,
      loadingImportBatches: loadingAccountableImportBatches,
      importDiff: accountableImportDiff,
      loadingImportDiff: loadingAccountableImportDiff,
      selectedLeftBatchId: selectedAccountableLeftBatchId,
      selectedRightBatchId: selectedAccountableRightBatchId,
      rollingBackBatchId: rollingBackAccountableBatchId,
      onSelectBatches: handleSelectAccountableImportBatches,
      onRollbackBatch: handleRollbackAccountableImportBatch,
      onImport: handleImportAccountableAssets,
      importing: importingAccountableAssets,
      onBack: () => navigatePortal(getPortalPath('accountable'))
    },
    accountableWriteoff: {
      assets: accountableAssets.filter((item) => !item.is_written_off && item.writeoff_status !== 'pending'),
      onGenerate: handleGenerateAccountableWriteoffArchive,
      generating: generatingAccountableWriteoffArchive,
      onChanged: () => {
        refreshAccountableAssets(accountableRequestFilters, { silent: true })
        refreshAccountableWrittenOffAssets({ silent: true })
      },
      onBack: () => navigatePortal(getPortalPath('accountable'))
    }
  }

  const routePageProps = utilityPageProps[activeRouteId] || activePageProps

  if (loadingUser) {
    return <LoadingState size={60} fullscreen={true} />
  }

  if (!user) {
    return <LoginScreen />
  }

  if (!hasAnyPortalAccess) {
    return <NoPortalAccessScreen />
  }

  return (
    <Providers notify={enqueueSystemToast}>
      <div className={`app-shell ${isHomeLayoutActive ? `is-home home-${homeViewMode}` : 'is-section'}`}>
        <AppShell
          user={user}
          activeTab={activeTab}
          activeNavTab={activeNavTab}
          onSwitchTab={switchTab}
          navOrder={navOrder}
          onReorderNavItems={reorderNavItems}
          onResetNavItems={resetNavOrder}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          globalSearchQuery={globalSearchQuery}
          setGlobalSearchQuery={setGlobalSearchQuery}
          viewMode={viewMode}
          setViewMode={setSectionViewMode}
          homeViewMode={homeViewMode}
          setHomeViewMode={setHomeViewMode}
          isHomeLayoutActive={isHomeLayoutActive}
          showActions={activeTab !== 'home' && activeTab !== 'integrations' && activeTab !== 'file-storage' && activeTab !== 'outdoor-audio' && activeTab !== 'museum-map' && !globalSearch.isOpen}
          isPhonebookTab={activeTab === 'phonebook'}
          isEcpTab={activeTab === 'ecp'}
          isNotesTab={activeTab === 'notes'}
          isAccountableTab={activeTab === 'accountable'}
          phonebookDirectoryView={phonebookDirectoryView}
          onSetPhonebookDirectoryView={setPhonebookDirectoryRouteView}
          onOpenPhonebookOrder={() => setShowPhonebookOrderModal(true)}
          isCartridgesTab={activeTab === 'cartridges'}
          isEquipmentTab={activeTab === 'equipment'}
          isPasswordTab={activeTab === 'password'}
          equipmentSubview={equipmentSubview}
          equipmentStationCount={activeTab === 'equipment' ? equipmentSummary.stationCount : 0}
          equipmentPhoneCount={activeTab === 'equipment' ? filteredEquipmentPhones.length : 0}
          accountableCount={activeTab === 'accountable' ? accountableAssets.length : 0}
          accountableImporting={importingAccountableAssets}
          passwordPrimaryView={passwordPrimaryView}
          passwordNetworkView={passwordNetworkView}
          passwordStats={activeTab === 'password' ? passwordViewModel.stats : null}
          globalSearchInputRef={globalSearchInputRef}
          localSearchInputRef={localSearchInputRef}
          showControls={!isUtilityRoute && activeTab !== 'file-storage' && activeTab !== 'outdoor-audio' && activeTab !== 'museum-map' && !globalSearch.isOpen && isActiveRouteAllowed}
          onSetPasswordPrimaryView={setPasswordPrimaryRouteView}
          onSetPasswordNetworkView={setPasswordNetworkRouteView}
          onSetEquipmentSubview={setEquipmentSubviewRoute}
          onAddRecord={() => (activeTab === 'notes' ? requestNewNote() : openAddModal())}
          onAddEquipment={() => openAddModal('equipment')}
          onAddEquipmentPhone={openAddIpPhoneModal}
          onAddInventory={() => openAddModal('inventory')}
          onAddPrinter={() => openAddModal('printer')}
          onOpenAccountableImports={() => navigatePortal(getPortalPath('accountableImports'))}
          onImportAccountable={handleImportAccountableAssets}
          onOpenInventoryReports={activeTab === 'cartridges' ? () => navigatePortal(getPortalPath('inventoryHistory')) : null}
          onOpenNotificationsPage={() => navigatePortal(getPortalPath('notifications'))}
          onOpenProfilePage={() => navigatePortal(getPortalPath('profile'))}
          notificationsOverview={notificationsOverview}
        />

        {globalSearch.isOpen ? (
          <GlobalSearchResultsPage
            isReady={globalSearch.isReady}
            loading={isGlobalSearchLoading}
            results={globalSearch.results}
            onOpenEdit={(event, item) => {
              openEditModal(event, item, resolveEntityType(item.type))
            }}
            onDelete={(event, item) => {
              handleDeleteClick(event, item, resolveEntityType(item.type))
            }}
          />
        ) : (!hasCompletedInitialRouteLoad && loadingData) ? (
          <LoadingState />
        ) : (
          <Suspense fallback={<LoadingState />}>
            <ActivePage {...routePageProps} />
          </Suspense>
        )}

        <AppFooter />

        <ItemModal
          open={showItemModal}
          onClose={closeModal}
          onSubmit={handleSave}
          modalMode={modalMode}
          modalEntityType={modalEntityType}
          currentItemType={currentItemType}
          newItemParams={newItemParams}
          setNewItemParams={setNewItemParams}
          employees={employees}
          availablePrinterModels={availablePrinterModels}
          availableCartridgeTypes={availableCartridgeTypes}
          phonebookOrganizations={phonebookOrganizations}
          phonebookDepartments={departmentsDirectory.map((department) => department.canonical_name)}
          phonebookRooms={locationsDirectory.map((location) => location.canonical_name)}
          departments={departmentsDirectory}
          locations={locationsDirectory}
        />

        <EquipmentModal
          open={showEquipmentModal}
          onClose={closeEquipmentModal}
          onSubmit={handleEquipmentSave}
          modalMode={modalMode}
          form={equipmentForm}
          setForm={setEquipmentForm}
          employees={employees}
          ipPhones={equipmentForm.employee_id ? equipmentIpPhones.filter(p => Number(p.employee_id) === Number(equipmentForm.employee_id)) : []}
          onRequestEditPhone={(phone) => {
            closeEquipmentModal()
            openEditModal(null, phone, 'equipment_phone')
          }}
        />

        <AccountableAssetModal
          open={showAccountableAssetModal}
          onClose={closeAccountableAssetModal}
          onSubmit={handleSaveAccountableAsset}
          onDelete={confirmDeleteAccountableAsset}
          mode={accountableAssetModalMode}
          form={accountableAssetForm}
          setForm={setAccountableAssetForm}
          employees={employees}
        />

        <PhonebookOrderModal
          open={showPhonebookOrderModal}
          groupedPhonebook={phonebookOrderGroups}
          directoryView={phonebookDirectoryView}
          saving={savingPhonebookOrder}
          onClose={() => setShowPhonebookOrderModal(false)}
          onSave={handleSavePhonebookOrder}
        />

        <ConfirmDialog
          open={Boolean(itemToDelete)}
          onClose={clearDelete}
          onConfirm={confirmDelete}
          title="Удалить запись?"
          description="Это действие необратимо. Вы уверены, что хотите удалить данную запись из базы данных?"
        />

        <InstallSelectorModal
          installSelector={installSelector}
          onClose={() => setInstallSelector((prev) => ({ ...prev, show: false }))}
          onSelect={(option) => handleInstallCartridge(null, null, null, option)}
        />

        <NotificationToastStack
          toasts={toastNotifications}
          onDismiss={dismissToast}
          onOpen={handleOpenNotification}
          onMarkRead={handleNotificationRead}
          onHide={handleNotificationSnooze}
        />

        <SystemUpdateToastStack
          toasts={systemToasts}
          onDismiss={dismissSystemToast}
          onAction={runSystemToastAction}
        />

        <ScrollTopButton />
      </div>
    </Providers>
  )
}
