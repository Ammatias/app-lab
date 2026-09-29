export function getActivePageProps({
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
}) {
  return activeTab === 'home'
    ? homePageProps
    : activeTab === 'notes'
      ? notesPageProps
      : activeTab === 'password'
        ? passwordPageProps
        : activeTab === 'accountable'
          ? accountablePageProps
          : activeTab === 'integrations'
            ? integrationsPageProps
          : activeTab === 'equipment'
            ? equipmentPageProps
            : activeTab === 'phonebook'
              ? phonebookPageProps
              : activeTab === 'cartridges'
                ? inventoryPageProps
                : recordsPageProps
}

export function buildHomePageProps({
  homeViewMode,
  homeData,
  employees,
  phonebook,
  limitingContactId,
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
}) {
  return {
    homeViewMode,
    filteredHomeGroupTitles: homeData.filteredHomeGroupTitles,
    classicHomeGroups: homeData.classicHomeGroups,
    filteredHomeGroups: homeData.filteredHomeGroups,
    currentHomeGroup: homeData.currentHomeGroup,
    currentHomeLinks: homeData.currentHomeLinks,
    currentHomeWidgets: homeData.currentHomeWidgets,
    currentHomeItems: homeData.currentHomeItems,
    homeWidgetData: {
      employees,
      phonebook,
      limitingContactId,
      onApplyNetworkLimit: handleApplyPhonebookNetworkLimit,
      onClearNetworkLimit: handleClearPhonebookNetworkLimit,
      inventory,
      portalPresence,
      vacationsOverview,
      user
    },
    CurrentHomeIcon: homeData.CurrentHomeIcon,
    isFavoritesGroup: homeData.isFavoritesGroup,
    isHomeEditMode,
    homeDensityMode,
    homeDropTargetGroupKey,
    homeDensityClass: homeData.homeDensityClass,
    homeScaleClass: homeData.homeScaleClass,
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
    onSetActiveHomeGroup: setActiveHomeGroup,
    onToggleEditMode: () => {
      if (isHomeEditMode) {
        setHomeEditMode(false)
        resetHomeEditor()
        resetHomeWidgetPicker()
        return
      }

      setHomeEditMode(true)
      resetHomeEditor()
      resetHomeWidgetPicker()
    },
    onSetHomeDensityMode: setHomeDensityMode,
    onOpenFavoriteForm: openFavoriteEditor,
    onOpenHomeLinkCreate: openHomeLinkCreate,
    onOpenHomeGroupCreate: openHomeGroupCreate,
    onOpenHomeWidgetCreate: openHomeWidgetCreate,
    onOpenInlineLinkCreate: homeData.isFavoritesGroup ? openFavoriteEditor : openHomeLinkCreate,
    onOpenInlineWidgetCreate: openHomeWidgetCreate,
    onHomeEditorSubmit: handleHomeEditorSubmit,
    onHomeLinkDraftChange: handleHomeLinkDraftChange,
    onHomeGroupDraftChange: handleHomeGroupDraftChange,
    onResetHomeEditor: resetHomeEditor,
    onHomeWidgetDraftChange: handleHomeWidgetDraftChange,
    onCreateHomeWidget: handleCreateHomeWidget,
    onCancelHomeWidgetCreate: resetHomeWidgetPicker,
    onUpdateHomeWidget: handleUpdateHomeWidget,
    onHomeItemDragStart: handleHomeItemDragStart,
    onHomeItemDrag: handleHomeItemDrag,
    onHomeItemDragOver: handleHomeItemDragOver,
    onHomeItemDrop: handleHomeItemDrop,
    onHomeItemDragEnd: handleHomeItemDragEnd,
    onHomeGroupDragOver: handleHomeGroupDragOver,
    onHomeGroupDragLeave: handleHomeGroupDragLeave,
    onHomeGroupDrop: handleHomeGroupDrop,
    onRemoveFavoriteLink: removeFavoriteLink,
    onEditHomeLink: handleEditHomeLink,
    onDeleteHomeLink: handleDeleteHomeLink,
    onDeleteHomeWidget: handleDeleteHomeWidget,
    onToggleFavorite: toggleFavoriteLink
  }
}

export function buildSectionPageProps({
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
  onOpenWriteoffPage,
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
}) {
  return {
    phonebookPageProps: {
      groupedPhonebook,
      anydeskItems: items.filter((item) => item.type === 'anydesk'),
      loading: phonebookLoading,
      directoryView: phonebookDirectoryView,
      onEdit: (event, item) => openEditModal(event, item, 'phonebook'),
      onToggleAccounting: handleTogglePhonebookAccounting,
      togglingContactId: togglingPhonebookContactId,
      onApplyNetworkLimit: handleApplyPhonebookNetworkLimit,
      onClearNetworkLimit: handleClearPhonebookNetworkLimit,
      limitingContactId: limitingPhonebookContactId,
      onGenerateAgentScript: handleGeneratePhonebookAgentScript,
      generatingAgentContactId: generatingPhonebookAgentContactId
    },
    inventoryPageProps: {
      groupedInventory,
      filteredPrinters,
      loading: inventoryLoading,
      onEditModel: (event, item) => openEditModal(event, { ...item, type: 'inventory' }, 'inventory'),
      onDeleteModel: (event, item) => handleDeleteClick(event, { ...item, type: 'inventory' }, 'inventory'),
      onEditPrinter: (event, item) => openEditModal(event, { ...item, type: 'printer' }, 'printer'),
      onDeletePrinter: (event, item) => handleDeleteClick(event, { ...item, type: 'printer' }, 'printer'),
      onInstall: handleInstallCartridge,
      installingCartridgeKey
    },
    accountablePageProps: {
      assets: accountableAssets,
      writtenOffAssets: accountableWrittenOffAssets,
      loading: loadingAccountableAssets,
      searchQuery,
      filters: accountableFilters,
      onFiltersChange: handleChangeAccountableFilters,
      importBatches: accountableImportBatches,
      loadingImportBatches: loadingAccountableImportBatches,
      importDiff: accountableImportDiff,
      loadingImportDiff: loadingAccountableImportDiff,
      selectedLeftBatchId: selectedAccountableLeftBatchId,
      selectedRightBatchId: selectedAccountableRightBatchId,
      rollingBackBatchId: rollingBackAccountableBatchId,
      onSelectBatches: handleSelectAccountableImportBatches,
      onRollbackBatch: handleRollbackAccountableImportBatch,
      importing: importingAccountableAssets,
      generatingWriteoffArchive: generatingAccountableWriteoffArchive,
      onGenerateWriteoffArchive: handleGenerateAccountableWriteoffArchive,
      onImport: handleImportAccountableAssets,
      onOpenWriteoffPage,
      onCreate: openAddAccountableAssetModal,
      onEdit: openEditAccountableAssetModal
    },
    integrationsPageProps: {
      searchQuery
    },
    equipmentPageProps: {
      view: equipmentSubview,
      departments: equipmentDepartments,
      phoneGroups: equipmentPhoneGroups,
      loading: equipmentLoading,
      searchQuery,
      onEdit: (event, item) => openEditModal(event, item, 'equipment'),
      onDelete: (event, item) => handleDeleteClick(event, item, 'equipment'),
      onEditPhone: (event, item) => openEditModal(event, item, 'equipment_phone'),
      onDeletePhone: (event, item) => handleDeleteClick(event, item, 'equipment_phone')
    },
    passwordPageProps: {
      viewMode,
      loading: passwordLoading,
      items: passwordViewModel.visibleItems,
      onEdit: (event, item) => openEditModal(event, item),
      onDelete: (event, item) => handleDeleteClick(event, item)
    },
    notesPageProps: {
      notes,
      noteZones,
      searchQuery,
      shareOptions: noteShareOptions,
      assigneeOptions: noteAssigneeOptions,
      createRequestToken: noteCreateRequestToken,
      onCreateNote: handleCreateNote,
      onUpdateNote: handleUpdateNote,
      onDeleteNote: handleDeleteNote,
      onCreateZone: handleCreateZone,
      onUpdateZone: handleUpdateZone,
      onDeleteZone: handleDeleteZone
    },
    recordsPageProps: {
      viewMode,
      loading: isRecordsLoading,
      items: visibleRecordItems,
      onEdit: (event, item) => openEditModal(event, item),
      onDelete: (event, item) => handleDeleteClick(event, item)
    }
  }
}
