import { useMemo } from 'react'
import {
  buildEquipmentDepartments,
  buildEquipmentPhoneGroups,
  buildEquipmentSummary,
  filterEquipmentIpPhones,
  filterEquipmentRecords,
  prepareEquipmentIpPhones,
  prepareEquipmentRecords
} from '../../features/equipment/lib/equipmentAudit'

const EMPTY_EQUIPMENT_SUMMARY = {
  departmentCount: 0,
  stationCount: 0,
  deviceCount: 0,
  ipPhoneCount: 0,
  sharedCount: 0,
  primarySystemsCount: 0
}

export function useEquipmentPageData({
  active,
  searchable,
  equipment,
  equipmentPhones,
  employees,
  searchQuery,
  loadingData
}) {
  const shouldPrepareEquipmentData = active || searchable

  const equipmentIpPhones = useMemo(
    () => (shouldPrepareEquipmentData ? prepareEquipmentIpPhones(equipmentPhones, employees) : []),
    [shouldPrepareEquipmentData, equipmentPhones, employees]
  )

  const equipmentWithPhones = useMemo(
    () => (shouldPrepareEquipmentData ? prepareEquipmentRecords(equipment, equipmentIpPhones) : []),
    [shouldPrepareEquipmentData, equipment, equipmentIpPhones]
  )

  const filteredEquipmentRecords = useMemo(
    () => (active ? filterEquipmentRecords(equipmentWithPhones, searchQuery) : []),
    [active, equipmentWithPhones, searchQuery]
  )

  const filteredEquipmentPhones = useMemo(
    () => (active ? filterEquipmentIpPhones(equipmentIpPhones, searchQuery) : []),
    [active, equipmentIpPhones, searchQuery]
  )

  const equipmentDepartments = useMemo(
    () => (active ? buildEquipmentDepartments(filteredEquipmentRecords) : []),
    [active, filteredEquipmentRecords]
  )

  const equipmentPhoneGroups = useMemo(
    () => (active ? buildEquipmentPhoneGroups(filteredEquipmentPhones) : []),
    [active, filteredEquipmentPhones]
  )

  const equipmentSummary = useMemo(
    () => (active ? buildEquipmentSummary(filteredEquipmentRecords) : EMPTY_EQUIPMENT_SUMMARY),
    [active, filteredEquipmentRecords]
  )

  return {
    equipmentIpPhones,
    equipmentWithPhones,
    filteredEquipmentRecords,
    filteredEquipmentPhones,
    equipmentDepartments,
    equipmentPhoneGroups,
    equipmentSummary,
    equipmentLoading: active && loadingData && equipment.length === 0 && equipmentPhones.length === 0
  }
}
