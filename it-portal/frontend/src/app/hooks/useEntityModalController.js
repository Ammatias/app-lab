import { useMemo, useState } from 'react'
import { findEmployeeById } from '../../features/employees/lib/employeeDirectory'
import { buildEquipmentPayload, createEmptyEquipmentForm, createEquipmentFormFromRecord } from '../../features/equipment/lib/equipmentForm'
import { createEmptyItemParams } from '../../features/item-modal/hooks/useItemForm'
import { normalizePasswordSubtype } from '../../features/passwords/lib/passwordSubtypes'
import { resolveEntityType } from '../../features/records/lib/recordTypeMeta'

export function useEntityModalController({
  activeTab,
  currentPasswordSubtype,
  phonebookDirectoryView,
  employees
}) {
  const [showItemModal, setShowItemModal] = useState(false)
  const [showEquipmentModal, setShowEquipmentModal] = useState(false)
  const [modalMode, setModalMode] = useState('add')
  const [editingItemId, setEditingItemId] = useState(null)
  const [editingEquipmentId, setEditingEquipmentId] = useState(null)
  const [modalEntityType, setModalEntityType] = useState('item')
  const [editingItemType, setEditingItemType] = useState(null)
  const [newItemParams, setNewItemParams] = useState(createEmptyItemParams)
  const [equipmentForm, setEquipmentForm] = useState(createEmptyEquipmentForm)

  const currentItemType = useMemo(
    () => editingItemType || activeTab,
    [activeTab, editingItemType]
  )

  const openAddModal = (entityType = (activeTab === 'phonebook' ? 'phonebook' : activeTab === 'cartridges' ? 'inventory' : 'item')) => {
    if (activeTab === 'equipment' || entityType === 'equipment') {
      setModalMode('add')
      setEditingEquipmentId(null)
      setEquipmentForm(createEmptyEquipmentForm())
      setShowEquipmentModal(true)
      return
    }

    setModalMode('add')
    setEditingItemId(null)
    setModalEntityType(entityType)
    setEditingItemType(entityType === 'item' ? activeTab : null)
    setNewItemParams(() => {
      const baseParams = createEmptyItemParams()

      if (entityType === 'item' && activeTab === 'password') {
        return {
          ...baseParams,
          subtype: currentPasswordSubtype
        }
      }

      return baseParams
    })

    if (entityType === 'phonebook') {
      setNewItemParams({
        ...createEmptyItemParams(),
        is_external: phonebookDirectoryView === 'external',
        organization: phonebookDirectoryView === 'external' ? '' : 'Демо-организация'
      })
      setShowItemModal(true)
      return
    }

    setShowItemModal(true)
  }

  const openAddIpPhoneModal = () => {
    setModalMode('add')
    setEditingItemId(null)
    setModalEntityType('equipment_phone')
    setEditingItemType(null)
    setNewItemParams(createEmptyItemParams())
    setShowItemModal(true)
  }

  const openEditModal = (event, item, entityType = null) => {
    event.stopPropagation()

    const resolvedEntityType = entityType || resolveEntityType(item.type)

    if (resolvedEntityType === 'equipment') {
      setModalMode('edit')
      setEditingEquipmentId(item.id)
      setEquipmentForm(createEquipmentFormFromRecord(item))
      setShowEquipmentModal(true)
      return
    }

    if (resolvedEntityType === 'equipment_phone') {
      const linkedEmployee = item.employee_id ? findEmployeeById(employees, item.employee_id) : null
      setModalMode('edit')
      setEditingItemId(item.id)
      setModalEntityType('equipment_phone')
      setEditingItemType(null)
      setNewItemParams({
        ...createEmptyItemParams(),
        employee_id: item.employee_id || '',
        title: linkedEmployee?.internal || item.internalNumber || item.internal_number || item.title || '',
        description: item.ipAddress || item.ip_address || item.description || '',
        mac_address: item.macAddress || item.mac_address || '',
        fio: item.users || item.users_text || item.fio || '',
        login: item.login || '',
        value: item.password || item.value || '',
        room: item.room || '',
        user_matches_login: Boolean(item.userMatchesLogin ?? item.user_matches_login),
        is_draft: Boolean(item.isDraft ?? item.is_draft)
      })
      setShowItemModal(true)
      return
    }

    setModalMode('edit')
    setEditingItemId(item.id)
    setModalEntityType(resolvedEntityType)
    setEditingItemType(resolvedEntityType === 'item' ? (item.type || activeTab) : null)

    if (resolvedEntityType === 'phonebook') {
      setNewItemParams({
        ...createEmptyItemParams(),
        employee_id: item.employee_id || '',
        department_id: item.department_id || '',
        department: item.department || '',
        location_id: item.location_id || '',
        organization: item.organization || '',
        is_external: Boolean(item.is_external),
        accounting_flag: Boolean(item.accounting_flag),
        room: item.room || '',
        name: item.name || '',
        position: item.position || '',
        email: item.email || '',
        phone: item.phone || '',
        internal: item.internal || '',
        mobile: item.mobile || '',
        note: item.note || ''
      })
    } else if (resolvedEntityType === 'inventory') {
      setNewItemParams({
        ...createEmptyItemParams(),
        name: item.name || item.title || '',
        cartridge_type_name: item.cartridge_type_name || '',
        refilled_count: String(item.refilled_count ?? 0),
        new_count: String(item.new_count ?? 0),
        critical_limit: String(item.critical_limit ?? 2),
        note: item.note || ''
      })
    } else if (resolvedEntityType === 'printer') {
      setNewItemParams({
        ...createEmptyItemParams(),
        employee_id: item.employee_id || '',
        room: item.room || '',
        fio: item.fio || '',
        model_name: item.model_name || item.model || '',
        cartridge_type_name: item.cartridge_type_name || item.cartridge_name || ''
      })
    } else {
      setNewItemParams({
        ...createEmptyItemParams(),
        employee_id: item.employee_id || '',
        title: item.title || '',
        value: item.value || '',
        description: item.description || '',
        subtype: normalizePasswordSubtype(item.subtype),
        source_sheet: item.source_sheet || '',
        is_draft: Boolean(item.is_draft),
        room: item.room || '',
        fio: item.fio || '',
        login: item.login || '',
        valid_until: item.valid_until || '',
        file_name: item.file_name || '',
        file_mime_type: item.file_mime_type || '',
        file_data: item.file_data || '',
        private_file_name: item.private_file_name || '',
        private_file_mime_type: item.private_file_mime_type || '',
        private_file_data: '',
        private_valid_until: item.private_valid_until || '',
        remove_public_file: false,
        remove_private_file: false
      })
    }

    setShowItemModal(true)
  }

  const closeModal = () => {
    setShowItemModal(false)
    setEditingItemId(null)
    setEditingItemType(null)
    setModalEntityType('item')
    setNewItemParams(createEmptyItemParams())
  }

  const closeEquipmentModal = () => {
    setShowEquipmentModal(false)
    setEditingEquipmentId(null)
    setEquipmentForm(createEmptyEquipmentForm())
  }

  return {
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
    setModalMode,
    setEditingItemId,
    setEditingEquipmentId,
    setModalEntityType,
    setEditingItemType,
    setNewItemParams,
    setEquipmentForm,
    openAddModal,
    openAddIpPhoneModal,
    openEditModal,
    closeModal,
    closeEquipmentModal,
    buildEquipmentPayload
  }
}
