import { useEffect, useMemo, useState } from 'react'
import {
  createAccountableAsset,
  deleteAccountableAsset,
  fetchAccountableAssets,
  fetchAccountableImportBatches,
  fetchAccountableImportDiff,
  fetchAccountableWrittenOffAssets,
  generateAccountableWriteoffArchive,
  importAccountableAssetsXlsx,
  rollbackAccountableImportBatch,
  updateAccountableAsset
} from '../../entities/accountable-assets/api'

const DEFAULT_ACCOUNTABLE_FILTERS = {
  onlyWithoutLocation: false,
  locationFilter: ''
}

const createEmptyAccountableAssetForm = () => ({
  inventory_number: '',
  name: '',
  quantity: '',
  amount: '',
  locationsText: '',
  linked_employee_id: '',
  note: '',
  writeoff_note: ''
})

const getAccountableLocationSortValue = (item) => {
  const primaryLocation = String(item.location_name || item.location_text || '').trim()
  if (primaryLocation) {
    return { value: primaryLocation.toLocaleLowerCase('ru-RU'), isEmpty: false }
  }

  return { value: '', isEmpty: true }
}

const compareAccountableAssets = (left, right) => {
  if (left.is_written_off !== right.is_written_off) {
    return left.is_written_off ? 1 : -1
  }

  const leftLocation = getAccountableLocationSortValue(left)
  const rightLocation = getAccountableLocationSortValue(right)
  if (leftLocation.isEmpty !== rightLocation.isEmpty) {
    return leftLocation.isEmpty ? 1 : -1
  }

  if (leftLocation.value !== rightLocation.value) {
    return leftLocation.value.localeCompare(rightLocation.value, 'ru-RU')
  }

  const leftName = String(left.name || '').toLocaleLowerCase('ru-RU')
  const rightName = String(right.name || '').toLocaleLowerCase('ru-RU')
  if (leftName !== rightName) {
    return leftName.localeCompare(rightName, 'ru-RU')
  }

  const leftInventory = String(left.inventory_number || '').toLocaleLowerCase('ru-RU')
  const rightInventory = String(right.inventory_number || '').toLocaleLowerCase('ru-RU')
  return leftInventory.localeCompare(rightInventory, 'ru-RU')
}

const accountableAssetMatchesFilters = (asset, filters) => {
  if (filters.writtenOff === true && !asset.is_written_off) {
    return false
  }

  const locationValues = [
    asset.location_name,
    asset.location_text,
    ...(Array.isArray(asset.locations) ? asset.locations.map((item) => item.location_name || item.locationName) : [])
  ]

  if (filters.location && !locationValues.some((value) => String(value || '').toLowerCase().includes(String(filters.location || '').toLowerCase()))) {
    return false
  }

  if (filters.withoutLocation) {
    const hasLocations = Array.isArray(asset.locations) ? asset.locations.length > 0 : false
    if (hasLocations || String(asset.location_text || '').trim()) {
      return false
    }
  }

  if (filters.search) {
    const searchText = String(filters.search || '').toLowerCase()
    const searchValues = [
      asset.inventory_number,
      asset.name,
      asset.quantity,
      asset.amount,
      asset.location_text,
      asset.location_name,
      asset.note,
      asset.writeoff_note,
      asset.linked_employee_name,
      asset.linked_position,
      asset.linked_location_name,
      asset.linked_cabinet,
      asset.linked_device_title,
      ...locationValues
    ]

    if (!searchValues.some((value) => String(value || '').toLowerCase().includes(searchText))) {
      return false
    }
  }

  return true
}

export function useAccountableController({
  user,
  activeTab,
  searchQuery,
  loadedDatasetKeysRef,
  getRequestErrorMessage
}) {
  const [accountableAssets, setAccountableAssets] = useState([])
  const [accountableWrittenOffAssets, setAccountableWrittenOffAssets] = useState([])
  const [accountableImportBatches, setAccountableImportBatches] = useState([])
  const [accountableImportDiff, setAccountableImportDiff] = useState(null)
  const [loadingAccountableAssets, setLoadingAccountableAssets] = useState(false)
  const [loadingAccountableImportBatches, setLoadingAccountableImportBatches] = useState(false)
  const [loadingAccountableImportDiff, setLoadingAccountableImportDiff] = useState(false)
  const [importingAccountableAssets, setImportingAccountableAssets] = useState(false)
  const [generatingAccountableWriteoffArchive, setGeneratingAccountableWriteoffArchive] = useState(false)
  const [rollingBackAccountableBatchId, setRollingBackAccountableBatchId] = useState(null)
  const [accountableFilters, setAccountableFilters] = useState(DEFAULT_ACCOUNTABLE_FILTERS)
  const [selectedAccountableLeftBatchId, setSelectedAccountableLeftBatchId] = useState(null)
  const [selectedAccountableRightBatchId, setSelectedAccountableRightBatchId] = useState(null)
  const [showAccountableAssetModal, setShowAccountableAssetModal] = useState(false)
  const [editingAccountableAssetId, setEditingAccountableAssetId] = useState(null)
  const [accountableAssetForm, setAccountableAssetForm] = useState(createEmptyAccountableAssetForm)
  const [accountableAssetModalMode, setAccountableAssetModalMode] = useState('add')

  const accountableRequestFilters = useMemo(() => ({
    search: String(searchQuery || '').trim(),
    location: String(accountableFilters.locationFilter || '').trim(),
    withoutLocation: accountableFilters.onlyWithoutLocation,
    writtenOff: undefined
  }), [accountableFilters.locationFilter, accountableFilters.onlyWithoutLocation, searchQuery])

  const refreshAccountableAssets = async (filters = accountableRequestFilters, { silent = false } = {}) => {
    if (!silent) {
      setLoadingAccountableAssets(true)
    }

    try {
      const data = await fetchAccountableAssets(filters)
      setAccountableAssets(data)
      loadedDatasetKeysRef.current.add('accountable')
      return data
    } finally {
      if (!silent) {
        setLoadingAccountableAssets(false)
      }
    }
  }

  const refreshAccountableWrittenOffAssets = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoadingAccountableAssets(true)
    }

    try {
      const data = await fetchAccountableWrittenOffAssets()
      setAccountableWrittenOffAssets(Array.isArray(data) ? data : [])
      return data
    } finally {
      if (!silent) {
        setLoadingAccountableAssets(false)
      }
    }
  }

  const refreshAccountableImportBatches = async ({ silent = false } = {}) => {
    if (!silent) {
      setLoadingAccountableImportBatches(true)
    }

    try {
      const data = await fetchAccountableImportBatches()
      setAccountableImportBatches(data)

      if (data.length >= 2) {
        const leftId = selectedAccountableLeftBatchId && data.some((item) => item.id === selectedAccountableLeftBatchId)
          ? selectedAccountableLeftBatchId
          : data[1].id
        const rightId = selectedAccountableRightBatchId && data.some((item) => item.id === selectedAccountableRightBatchId)
          ? selectedAccountableRightBatchId
          : data[0].id

        setSelectedAccountableLeftBatchId(leftId)
        setSelectedAccountableRightBatchId(rightId)
      } else if (data.length === 1) {
        setSelectedAccountableLeftBatchId(data[0].id)
        setSelectedAccountableRightBatchId(data[0].id)
      } else {
        setSelectedAccountableLeftBatchId(null)
        setSelectedAccountableRightBatchId(null)
      }

      return data
    } finally {
      if (!silent) {
        setLoadingAccountableImportBatches(false)
      }
    }
  }

  const refreshAccountableImportDiff = async (leftBatchId, rightBatchId, { silent = false } = {}) => {
    if (!leftBatchId || !rightBatchId || leftBatchId === rightBatchId) {
      setAccountableImportDiff(null)
      return null
    }

    if (!silent) {
      setLoadingAccountableImportDiff(true)
    }

    try {
      const data = await fetchAccountableImportDiff(leftBatchId, rightBatchId)
      setAccountableImportDiff(data)
      return data
    } finally {
      if (!silent) {
        setLoadingAccountableImportDiff(false)
      }
    }
  }

  const closeAccountableAssetModal = () => {
    setShowAccountableAssetModal(false)
    setEditingAccountableAssetId(null)
    setAccountableAssetModalMode('add')
    setAccountableAssetForm(createEmptyAccountableAssetForm())
  }

  const openAddAccountableAssetModal = () => {
    setAccountableAssetModalMode('add')
    setEditingAccountableAssetId(null)
    setAccountableAssetForm(createEmptyAccountableAssetForm())
    setShowAccountableAssetModal(true)
  }

  const openEditAccountableAssetModal = (asset) => {
    setAccountableAssetModalMode('edit')
    setEditingAccountableAssetId(asset.id)
    setAccountableAssetForm({
      inventory_number: asset.inventory_number || '',
      name: asset.name || '',
      quantity: asset.quantity || '',
      amount: asset.amount || '',
      locationsText: Array.isArray(asset.locations) && asset.locations.length > 0
        ? asset.locations.map((location) => location.location_name || location.locationName || '').filter(Boolean).join('\n')
        : asset.location_text || '',
      linked_employee_id: asset.link_mode === 'manual' ? asset.linked_employee_id || '' : '',
      note: asset.note || '',
      writeoff_note: asset.writeoff_note || ''
    })
    setShowAccountableAssetModal(true)
  }

  const handleChangeAccountableFilters = (patch) => {
    setAccountableFilters((prev) => ({ ...prev, ...patch }))
  }

  const handleSelectAccountableImportBatches = ({ leftBatchId, rightBatchId }) => {
    if (Number.isFinite(leftBatchId) && leftBatchId > 0) {
      setSelectedAccountableLeftBatchId(leftBatchId)
    }

    if (Number.isFinite(rightBatchId) && rightBatchId > 0) {
      setSelectedAccountableRightBatchId(rightBatchId)
    }
  }

  const handleRollbackAccountableImportBatch = async (batchId) => {
    const targetBatch = accountableImportBatches.find((item) => item.id === batchId)
    if (!targetBatch) {
      return
    }

    const confirmed = window.confirm(
      `Откатить текущий реестр Подотчета к импорту #${batchId} (${targetBatch.source_file})?`
    )
    if (!confirmed) {
      return
    }

    setRollingBackAccountableBatchId(batchId)
    try {
      const result = await rollbackAccountableImportBatch(batchId)
      const batches = await refreshAccountableImportBatches()
      await refreshAccountableAssets(accountableRequestFilters)
      if (Array.isArray(batches) && batches.length > 0) {
        setSelectedAccountableRightBatchId(result.restored_batch_id)
        setSelectedAccountableLeftBatchId(batchId)
      }
      alert(`Откат выполнен. Создан новый снимок #${result.restored_batch_id}.`)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось откатить импорт Подотчета')
    } finally {
      setRollingBackAccountableBatchId(null)
    }
  }

  const handleImportAccountableAssets = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

    input.onchange = async () => {
      const [file] = Array.from(input.files || [])
      if (!file) return

      setImportingAccountableAssets(true)
      try {
        const result = await importAccountableAssetsXlsx(file)
        const batches = await refreshAccountableImportBatches()
        await refreshAccountableAssets(accountableRequestFilters)
        await refreshAccountableWrittenOffAssets({ silent: true })
        if (Array.isArray(batches) && batches.length >= 2) {
          setSelectedAccountableLeftBatchId(batches[1].id)
          setSelectedAccountableRightBatchId(batches[0].id)
        }
        alert(
          `Импорт завершен: ${result.imported_count} позиций, новых ${result.new_count}, обновлено ${result.updated_count}, без изменений ${result.unchanged_count}, исчезло ${result.removed_count}.`
        )
      } catch (error) {
        console.error(error)
        alert(error.message || 'Не удалось импортировать подотчет')
      } finally {
        setImportingAccountableAssets(false)
      }
    }

    input.click()
  }

  const handleSaveAccountableAsset = async (event) => {
    event.preventDefault()

    const payload = {
      inventory_number: accountableAssetForm.inventory_number,
      name: accountableAssetForm.name,
      quantity: accountableAssetForm.quantity,
      amount: accountableAssetForm.amount,
      location_text: accountableAssetForm.locationsText,
      locations: String(accountableAssetForm.locationsText || '')
        .split(/\r?\n|,/)
        .map((item) => item.trim())
        .filter(Boolean),
      linked_employee_id: accountableAssetForm.linked_employee_id ? Number(accountableAssetForm.linked_employee_id) : null,
      note: accountableAssetForm.note,
      writeoff_note: accountableAssetForm.writeoff_note
    }

    try {
      if (accountableAssetModalMode === 'add') {
        const response = await createAccountableAsset(payload)
        if (!response.ok) {
          throw new Error(await getRequestErrorMessage(response, {
            fallback: 'Не удалось создать позицию подотчета',
            conflict: 'Не удалось создать позицию из-за конфликта данных.'
          }))
        }

        await refreshAccountableAssets(accountableRequestFilters)
      } else {
        const response = await updateAccountableAsset(editingAccountableAssetId, payload)
        if (!response.ok) {
          throw new Error(await getRequestErrorMessage(response, {
            fallback: 'Не удалось сохранить позицию подотчета',
            notFound: 'Позиция уже удалена или не найдена.',
            conflict: 'Не удалось сохранить позицию из-за конфликта данных.'
          }))
        }

        const updatedAsset = await response.json()
        setAccountableAssets((prev) => {
          const next = prev.filter((item) => item.id !== updatedAsset.id)
          if (!accountableAssetMatchesFilters(updatedAsset, accountableRequestFilters)) {
            return next
          }

          next.push(updatedAsset)
          next.sort(compareAccountableAssets)
          return next
        })
      }

      closeAccountableAssetModal()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось сохранить позицию подотчета')
    }
  }

  const confirmDeleteAccountableAsset = async () => {
    if (!editingAccountableAssetId) {
      return
    }

    const shouldDelete = window.confirm('Удалить эту позицию подотчета из реестра?')
    if (!shouldDelete) {
      return
    }

    try {
      const response = await deleteAccountableAsset(editingAccountableAssetId)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось удалить позицию подотчета',
          notFound: 'Позиция уже удалена или не найдена.'
        }))
      }

      await refreshAccountableAssets(accountableRequestFilters)
      closeAccountableAssetModal()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить позицию подотчета')
    }
  }

  const handleGenerateAccountableWriteoffArchive = async (assetIds) => {
    setGeneratingAccountableWriteoffArchive(true)
    try {
      const { blob, fileName } = await generateAccountableWriteoffArchive(assetIds)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      await refreshAccountableAssets(accountableRequestFilters, { silent: true })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось подготовить архив списания')
      throw error
    } finally {
      setGeneratingAccountableWriteoffArchive(false)
    }
  }

  useEffect(() => {
    if (!user || activeTab !== 'accountable') return undefined

    setLoadingAccountableAssets(true)
    const timeoutId = window.setTimeout(() => {
      refreshAccountableAssets(accountableRequestFilters).catch((error) => {
        console.error('Failed to fetch accountable assets', error)
      })
    }, 220)

    return () => window.clearTimeout(timeoutId)
  }, [activeTab, accountableRequestFilters, user])

  useEffect(() => {
    if (!user || activeTab !== 'accountable') return

    refreshAccountableImportBatches().catch((error) => {
      console.error('Failed to fetch accountable import history', error)
    })
    refreshAccountableWrittenOffAssets({ silent: true }).catch((error) => {
      console.error('Failed to fetch accountable written off assets', error)
    })
  }, [activeTab, user])

  useEffect(() => {
    if (!user || activeTab !== 'accountable') return

    refreshAccountableImportDiff(selectedAccountableLeftBatchId, selectedAccountableRightBatchId).catch((error) => {
      console.error('Failed to fetch accountable import diff', error)
    })
  }, [activeTab, selectedAccountableLeftBatchId, selectedAccountableRightBatchId, user])

  useEffect(() => {
    if (user) return

    setAccountableAssets([])
    setAccountableWrittenOffAssets([])
    setAccountableImportBatches([])
    setAccountableImportDiff(null)
    setSelectedAccountableLeftBatchId(null)
    setSelectedAccountableRightBatchId(null)
    setShowAccountableAssetModal(false)
    setEditingAccountableAssetId(null)
    setAccountableAssetForm(createEmptyAccountableAssetForm())
    setAccountableAssetModalMode('add')
  }, [user])

  return {
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
    editingAccountableAssetId,
    accountableAssetForm,
    accountableAssetModalMode,
    setAccountableAssets,
    setAccountableImportBatches,
    setAccountableImportDiff,
    setSelectedAccountableLeftBatchId,
    setSelectedAccountableRightBatchId,
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
  }
}
