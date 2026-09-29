import { useRef, useState } from 'react'
import { findEmployeeById } from '../../features/employees/lib/employeeDirectory'
import { normalizePasswordSubtype } from '../../features/passwords/lib/passwordSubtypes'
import { resolveEntityType } from '../../features/records/lib/recordTypeMeta'
import {
  createEquipmentPhoneRecord,
  createEquipmentRecord,
  deleteEquipmentPhoneRecord,
  deleteEquipmentRecord,
  updateEquipmentPhoneRecord,
  updateEquipmentRecord
} from '../../entities/equipment/api'
import { createItem, deleteItem, updateItem } from '../../entities/items/api'
import { createPhonebookContact, deletePhonebookContact, fetchPhonebook, updatePhonebookContact } from '../../entities/phonebook/api'
import { createInventoryItem, deleteInventoryItem, installInventoryCartridge, updateInventoryItem } from '../../entities/inventory/api'
import { createPrinterLocation, deletePrinterLocation, updatePrinterLocation } from '../../entities/printers/api'
import { fetchEmployees } from '../../entities/employees/api'

export function useRecordsController({
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
  showHistoryModal,
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
}) {
  const [itemToDelete, setItemToDelete] = useState(null)
  const [installingCartridgeKey, setInstallingCartridgeKey] = useState('')
  const installingCartridgeKeysRef = useRef(new Set())

  const refreshInventoryAndPrinters = async () => {
    await Promise.all([
      refreshInventory(),
      refreshPrinters()
    ])
  }

  const removeEntityLocally = (entityType, id) => {
    if (entityType === 'phonebook') {
      setPhonebook((prev) => prev.filter((item) => item.id !== id))
      return
    }

    if (entityType === 'inventory') {
      setInventory((prev) => prev.filter((item) => item.id !== id))
      return
    }

    if (entityType === 'printer') {
      setPrinters((prev) => prev.filter((item) => item.id !== id))
      return
    }

    if (entityType === 'equipment') {
      setEquipment((prev) => prev.filter((item) => item.id !== id))
      return
    }

    if (entityType === 'equipment_phone') {
      setEquipmentPhones((prev) => prev.filter((item) => item.id !== id))
      return
    }

    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleDeleteClick = (event, item, explicitEntityType = null) => {
    event.stopPropagation()
    setItemToDelete({
      id: item.id,
      entityType: explicitEntityType || resolveEntityType(item.type),
      item
    })
  }

  const confirmDelete = async () => {
    if (!itemToDelete) return

    try {
      let response
      let errorOptions = { fallback: 'Не удалось удалить запись' }

      if (itemToDelete.entityType === 'phonebook') {
        response = await deletePhonebookContact(itemToDelete.id)
        errorOptions = {
          fallback: 'Не удалось удалить контакт',
          notFound: 'Контакт уже удален или не найден.'
        }
      } else if (itemToDelete.entityType === 'inventory') {
        response = await deleteInventoryItem(itemToDelete.id)
        errorOptions = {
          fallback: 'Не удалось удалить модель картриджа',
          notFound: 'Модель картриджа уже удалена или не найдена.',
          conflict: 'Нельзя удалить модель картриджа, пока по ней ещё есть остаток.'
        }
      } else if (itemToDelete.entityType === 'printer') {
        response = await deletePrinterLocation(itemToDelete.id)
        errorOptions = {
          fallback: 'Не удалось удалить размещение принтера',
          notFound: 'Размещение принтера уже удалено или не найдено.',
          conflict: 'Не удалось удалить размещение принтера из-за связанных данных.'
        }
      } else if (itemToDelete.entityType === 'equipment') {
        response = await deleteEquipmentRecord(itemToDelete.id)
        errorOptions = {
          fallback: 'Не удалось удалить карточку оборудования',
          notFound: 'Карточка оборудования уже удалена или не найдена.'
        }
      } else if (itemToDelete.entityType === 'equipment_phone') {
        response = await deleteEquipmentPhoneRecord(itemToDelete.id)
        errorOptions = {
          fallback: 'Не удалось удалить IP-телефон',
          notFound: 'IP-телефон уже удален или не найден.'
        }
      } else {
        response = await deleteItem(itemToDelete.id)
        errorOptions = {
          fallback: 'Не удалось удалить запись',
          notFound: 'Запись уже удалена или не найдена.',
          conflict: 'Запись нельзя удалить из-за связанных данных.'
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          removeEntityLocally(itemToDelete.entityType, itemToDelete.id)
          setItemToDelete(null)
          if (itemToDelete.entityType === 'equipment_phone') {
            setEmployees(await fetchEmployees())
          }
          if (
            itemToDelete.entityType === 'inventory'
            || (itemToDelete.entityType === 'item' && itemToDelete.item?.type === 'ecp')
          ) {
            await refreshNotifications({ announce: true, silent: true, force: true })
          }
          alert(await getRequestErrorMessage(response, errorOptions))
          return
        }

        throw new Error(await getRequestErrorMessage(response, errorOptions))
      }

      removeEntityLocally(itemToDelete.entityType, itemToDelete.id)
      setItemToDelete(null)
      if (itemToDelete.entityType === 'inventory' || itemToDelete.entityType === 'printer') {
        await refreshInventoryAndPrinters()
      }
      if (itemToDelete.entityType === 'equipment_phone') {
        setEmployees(await fetchEmployees())
      }
      if (
        itemToDelete.entityType === 'inventory'
        || (itemToDelete.entityType === 'item' && itemToDelete.item?.type === 'ecp')
      ) {
        await refreshNotifications({ announce: true, silent: true, force: true })
      }
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить запись')
    }
  }

  const handleEquipmentSave = async (event) => {
    event.preventDefault()

    const payload = buildEquipmentPayloadFromModal(equipmentForm)

    try {
      if (modalMode === 'add') {
        await createEquipmentRecord(payload)
      } else {
        await updateEquipmentRecord(editingEquipmentId, payload)
      }

      await refreshEquipment()
      closeEquipmentModal()
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось сохранить рабочее место')
    }
  }

  const handleSave = async (event) => {
    event.preventDefault()

    if (modalEntityType === 'phonebook') {
      const isExternalPhonebook = Boolean(newItemParams.is_external)
      const payload = {
        employee_id: !isExternalPhonebook && newItemParams.employee_id ? Number(newItemParams.employee_id) : null,
        department_id: !isExternalPhonebook && newItemParams.department_id ? Number(newItemParams.department_id) : null,
        department: newItemParams.department,
        organization: newItemParams.organization || null,
        is_external: isExternalPhonebook,
        accounting_flag: Boolean(newItemParams.accounting_flag),
        location_id: !isExternalPhonebook && newItemParams.location_id ? Number(newItemParams.location_id) : null,
        room: newItemParams.room,
        name: newItemParams.name,
        position: newItemParams.position,
        email: newItemParams.email,
        phone: newItemParams.phone,
        internal: newItemParams.internal,
        mobile: newItemParams.mobile,
        note: isExternalPhonebook ? newItemParams.note : null
      }

      try {
        if (modalMode === 'add') {
          const response = await createPhonebookContact(payload)
          if (!response.ok) {
            throw new Error(await getRequestErrorMessage(response, {
              fallback: 'Не удалось сохранить контакт',
              conflict: 'Контакт с таким ФИО уже существует в этом отделе.'
            }))
          }
          const addedItem = await response.json()
          setPhonebook((prev) => [{ ...addedItem, type: 'phonebook' }, ...prev])
          setEmployees(await fetchEmployees())
        } else {
          const response = await updatePhonebookContact(editingItemId, payload)
          if (!response.ok) {
            throw new Error(await getRequestErrorMessage(response, {
              fallback: 'Не удалось сохранить контакт',
              notFound: 'Контакт уже удален или не найден.',
              conflict: 'Контакт с таким ФИО уже существует в этом отделе.'
            }))
          }
          const updatedItem = await response.json()
          setPhonebook((prev) => prev.map((item) => (item.id === editingItemId ? { ...updatedItem, type: 'phonebook' } : item)))
          setEmployees(await fetchEmployees())
        }
        closeModal()
      } catch (error) {
        console.error(error)
        alert(error.message || 'Не удалось сохранить контакт')
      }
      return
    }

    if (modalEntityType === 'inventory') {
      const payload = {
        name: newItemParams.name,
        cartridge_type_name: newItemParams.cartridge_type_name,
        refilled_count: Number.parseInt(newItemParams.refilled_count || '0', 10) || 0,
        new_count: Number.parseInt(newItemParams.new_count || '0', 10) || 0,
        critical_limit: newItemParams.critical_limit === '' ? null : (Number.parseInt(newItemParams.critical_limit, 10) || 0),
        note: newItemParams.note || null
      }

      try {
        if (modalMode === 'add') {
          const response = await createInventoryItem(payload)
          if (!response.ok) {
            throw new Error(await getRequestErrorMessage(response, {
              fallback: 'Не удалось сохранить модель картриджа',
              conflict: 'Модель картриджа с таким названием уже существует.'
            }))
          }
          await response.json()
        } else {
          const response = await updateInventoryItem(editingItemId, payload)
          if (!response.ok) {
            throw new Error(await getRequestErrorMessage(response, {
              fallback: 'Не удалось сохранить модель картриджа',
              notFound: 'Модель картриджа уже удалена или не найдена.',
              conflict: 'Модель картриджа с таким названием уже существует.'
            }))
          }
          await response.json()
        }
        await refreshInventoryAndPrinters()
        closeModal()
        await refreshNotifications({ announce: true, silent: true, force: true })
      } catch (error) {
        console.error(error)
        alert(error.message || 'Не удалось сохранить модель картриджа')
      }
      return
    }

    if (modalEntityType === 'printer') {
      const payload = {
        employee_id: newItemParams.employee_id ? Number(newItemParams.employee_id) : null,
        room: newItemParams.room || null,
        fio: newItemParams.fio || null,
        model_name: newItemParams.model_name,
        cartridge_type_name: newItemParams.cartridge_type_name
      }

      try {
        if (modalMode === 'add') {
          const response = await createPrinterLocation(payload)
          if (!response.ok) {
            throw new Error(await getRequestErrorMessage(response, {
              fallback: 'Не удалось сохранить размещение принтера',
              conflict: 'Такое размещение принтера уже существует или конфликтует со связанными данными.'
            }))
          }
          await response.json()
        } else {
          const response = await updatePrinterLocation(editingItemId, payload)
          if (!response.ok) {
            throw new Error(await getRequestErrorMessage(response, {
              fallback: 'Не удалось сохранить размещение принтера',
              notFound: 'Размещение принтера уже удалено или не найдено.',
              conflict: 'Такое размещение принтера уже существует или конфликтует со связанными данными.'
            }))
          }
          await response.json()
        }
        await refreshInventoryAndPrinters()
        closeModal()
      } catch (error) {
        console.error(error)
        alert(error.message || 'Не удалось сохранить размещение принтера')
      }
      return
    }

    if (modalEntityType === 'equipment_phone') {
      const selectedEmployee = newItemParams.employee_id ? findEmployeeById(employees, newItemParams.employee_id) : null
      const internalFromDirectory = selectedEmployee?.internal || ''
      const payload = {
        employee_id: newItemParams.employee_id ? Number(newItemParams.employee_id) : null,
        internal_number: internalFromDirectory ? null : (newItemParams.title || null),
        ip_address: newItemParams.description || null,
        mac_address: newItemParams.mac_address || null,
        users_text: newItemParams.fio || null,
        login: newItemParams.login || null,
        password: newItemParams.value || null,
        user_matches_login: Boolean(newItemParams.user_matches_login),
        room: newItemParams.room || null,
        is_draft: Boolean(newItemParams.is_draft)
      }

      try {
        if (modalMode === 'add') {
          await createEquipmentPhoneRecord(payload)
        } else {
          await updateEquipmentPhoneRecord(editingItemId, payload)
        }

        await refreshEquipmentPhones()
        setEmployees(await fetchEmployees())
        closeModal()
      } catch (error) {
        console.error(error)
        alert(error.message || 'Не удалось сохранить IP-телефон')
      }
      return
    }

    const targetItemType = editingItemType || activeTab
    const category = categories.find((entry) => entry.type === targetItemType)
    if (!category) {
      alert('Категория не найдена! Проверьте базу.')
      return
    }

    const payload = {
      category_id: category.id,
      employee_id: newItemParams.employee_id ? Number(newItemParams.employee_id) : null,
      title: newItemParams.title,
      value: newItemParams.value,
      description: newItemParams.description,
      room: newItemParams.room,
      fio: newItemParams.fio,
      login: newItemParams.login,
      valid_until: newItemParams.valid_until,
      file_name: newItemParams.file_name || null,
      file_mime_type: newItemParams.file_mime_type || null,
      file_data: newItemParams.file_data || null,
      private_file_name: newItemParams.private_file_name || null,
      private_file_mime_type: newItemParams.private_file_mime_type || null,
      private_file_data: newItemParams.private_file_data || null,
      remove_public_file: Boolean(newItemParams.remove_public_file),
      remove_private_file: Boolean(newItemParams.remove_private_file),
      subtype: targetItemType === 'password' ? normalizePasswordSubtype(newItemParams.subtype) : null,
      source_sheet: targetItemType === 'password' ? (newItemParams.source_sheet || null) : null,
      is_draft: targetItemType === 'password' ? Boolean(newItemParams.is_draft) : null
    }

    try {
      if (modalMode === 'add') {
        const response = await createItem(payload)
        if (!response.ok) {
          throw new Error(await getRequestErrorMessage(response, {
            fallback: 'Не удалось сохранить запись',
            conflict: 'Не удалось сохранить запись из-за конфликта данных.'
          }))
        }
        const addedItem = await response.json()
        setItems((prev) => [{ ...addedItem, type: category.type }, ...prev])
      } else {
        const response = await updateItem(editingItemId, payload)
        if (!response.ok) {
          throw new Error(await getRequestErrorMessage(response, {
            fallback: 'Не удалось сохранить запись',
            notFound: 'Запись уже удалена или не найдена.',
            conflict: 'Не удалось сохранить запись из-за конфликта данных.'
          }))
        }
        const updatedItem = await response.json()
        setItems((prev) => prev.map((item) => (item.id === editingItemId ? { ...updatedItem, type: category.type } : item)))
      }
      closeModal()
      if (targetItemType === 'ecp') {
        await refreshNotifications({ announce: true, silent: true, force: true })
      }
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось сохранить запись')
    }
  }

  const handleTogglePhonebookAccounting = async (contact, nextValue) => {
    if (!contact?.id) return

    const payload = {
      employee_id: !contact.is_external && contact.employee_id ? Number(contact.employee_id) : null,
      department_id: !contact.is_external && contact.department_id ? Number(contact.department_id) : null,
      department: contact.department || '',
      organization: contact.organization || null,
      is_external: Boolean(contact.is_external),
      accounting_flag: Boolean(nextValue),
      location_id: !contact.is_external && contact.location_id ? Number(contact.location_id) : null,
      room: contact.room || '',
      name: contact.name || '',
      position: contact.position || '',
      email: contact.email || '',
      phone: contact.phone || '',
      internal: contact.internal || '',
      mobile: contact.mobile || '',
      note: contact.is_external ? (contact.note || null) : null
    }

    setTogglingPhonebookContactId(contact.id)

    try {
      const response = await updatePhonebookContact(contact.id, payload)
      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось обновить контакт',
          notFound: 'Контакт уже удален или не найден.',
          conflict: 'Не удалось обновить контакт из-за конфликта данных.'
        }))
      }

      const updatedItem = await response.json()
      setPhonebook((prev) => prev.map((item) => (
        item.id === contact.id ? { ...updatedItem, type: 'phonebook' } : item
      )))
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось обновить контакт')
    } finally {
      setTogglingPhonebookContactId(null)
    }
  }

  const handleInstallCartridge = async (cartridgeName, printerLocationId, stockType, manualChoice = null) => {
    let selectedModel = manualChoice
    let selectedPrinterLocationId = manualChoice ? installSelector.printerLocationId : printerLocationId
    let selectedStockType = manualChoice ? installSelector.stockType : stockType

    if (!manualChoice) {
      const normalizedRequestedType = normalizeInventoryValue(cartridgeName, 'cartridge_type', inventoryAliasMap)
      const compatibleModels = inventory.filter((item) => {
        const normalizedItemType = normalizeInventoryValue(item.cartridge_type_name, 'cartridge_type', inventoryAliasMap)
        return normalizedItemType && normalizedItemType === normalizedRequestedType
      })
      const availableModels = compatibleModels.filter((item) => (
        stockType === 'new' ? Number(item.new_count || 0) > 0 : Number(item.refilled_count || 0) > 0
      ))

      if (compatibleModels.length === 0) {
        alert(`Для типа ${cartridgeName || 'картриджа'} нет заведенных моделей на складе.`)
        return
      }

      if (availableModels.length === 0) {
        alert(stockType === 'new'
          ? `Нет новых картриджей типа ${cartridgeName} на складе.`
          : `Нет заправленных картриджей типа ${cartridgeName} на складе.`)
        return
      }

      if (availableModels.length > 1) {
        setInstallSelector({
          show: true,
          cartridgeName,
          printerLocationId,
          stockType,
          options: availableModels
        })
        return
      }

      selectedModel = availableModels[0]
    }

    if (!selectedModel?.id || !selectedPrinterLocationId || !selectedStockType) {
      alert('Не удалось определить параметры установки картриджа')
      return
    }

    const installKey = `${selectedPrinterLocationId}:${selectedStockType}`
    if (installingCartridgeKeysRef.current.has(installKey)) {
      return
    }

    installingCartridgeKeysRef.current.add(installKey)
    setInstallingCartridgeKey(installKey)

    try {
      const response = await installInventoryCartridge({
        cartridge_model_id: Number(selectedModel.id),
        printer_location_id: Number(selectedPrinterLocationId),
        stock_type: selectedStockType
      })

      if (!response.ok) {
        throw new Error(await getRequestErrorMessage(response, {
          fallback: 'Не удалось установить картридж',
          notFound: 'Модель картриджа или размещение принтера уже удалены.',
          conflict: 'Не удалось установить картридж: нет нужного остатка, не указан тип или выбранная модификация несовместима с этим принтером.'
        }))
      }

      setInstallSelector({ show: false, cartridgeName: '', printerLocationId: '', stockType: '', options: [] })

      try {
        await Promise.all([
          refreshInventory(),
          refreshPrinters(),
          refreshEquipment(),
          showHistoryModal ? refreshInventoryHistory({ silent: true }) : Promise.resolve()
        ])
        await refreshNotifications({ announce: true, silent: true, force: true })
      } catch (refreshError) {
        console.error('Installation saved, but refresh failed', refreshError)
        alert('Картридж установлен и записан, но экран не обновился. Обновите страницу, чтобы увидеть актуальные остатки.')
      }
    } catch (error) {
      console.error('Installation failed', error)
      alert(error.message || 'Не удалось установить картридж')
    } finally {
      installingCartridgeKeysRef.current.delete(installKey)
      setInstallingCartridgeKey((currentKey) => (currentKey === installKey ? '' : currentKey))
    }
  }

  return {
    itemToDelete,
    clearDelete: () => setItemToDelete(null),
    handleDeleteClick,
    confirmDelete,
    handleEquipmentSave,
    handleSave,
    handleTogglePhonebookAccounting,
    handleInstallCartridge,
    installingCartridgeKey
  }
}
