import { matchSearchValues } from '../../../shared/lib/search'

const buildEmployeeMap = (employees = []) => new Map(
  employees.map((employee) => [Number(employee.id), employee])
)

const buildIpPhoneSearchValues = (phone) => [
  phone.internalNumber,
  phone.ipAddress,
  phone.macAddress,
  phone.users,
  phone.login,
  phone.password,
  phone.room,
  phone.department,
  phone.employeeName,
  phone.userMatchesLogin ? 'user логин совпадают' : '',
  phone.isDraft ? 'черновик' : ''
]

export const prepareEquipmentIpPhones = (phones, employees = []) => {
  const employeeMap = buildEmployeeMap(employees)

  return (phones || [])
    .map((phone, index) => {
      const employee = phone.employee_id ? employeeMap.get(Number(phone.employee_id)) : null
      const users = phone.users_text || employee?.full_name || ''
      const internalNumber = employee?.internal || phone.internal_number || ''
      const ipAddress = phone.ip_address || ''
      const macAddress = phone.mac_address || ''
      const room = phone.room || employee?.room || ''

      const normalized = {
        ...phone,
        type: 'equipment_phone',
        equipmentPhoneId: phone.id || `ip-phone-${index + 1}`,
        title: internalNumber || users || ipAddress || `IP-телефон ${index + 1}`,
        description: ipAddress,
        value: phone.password || '',
        fio: users,
        internalNumber,
        ipAddress,
        macAddress,
        users,
        employeeName: employee?.full_name || '',
        department: employee?.department || '',
        room,
        login: phone.login || '',
        password: phone.password || '',
        userMatchesLogin: Boolean(phone.user_matches_login),
        isDraft: Boolean(phone.is_draft),
        displayTitle: internalNumber || users || ipAddress || `IP-телефон ${index + 1}`
      }

      normalized.searchValues = buildIpPhoneSearchValues(normalized)
      return normalized
    })
}

export const filterEquipmentIpPhones = (phones, query) => {
  if (!query) return phones
  return (phones || []).filter((phone) => matchSearchValues(phone.searchValues, query))
}

export const buildEquipmentPhoneGroups = (phones) => {
  const groups = new Map()

  ;(phones || []).forEach((phone) => {
    const departmentName = phone.department || 'Без отдела'

    if (!groups.has(departmentName)) {
      groups.set(departmentName, {
        id: `equipment-phone-group-${groups.size + 1}`,
        name: departmentName,
        items: []
      })
    }

    groups.get(departmentName).items.push(phone)
  })

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      items: group.items.slice().sort((left, right) => (
        (left.users || left.employeeName || left.displayTitle).localeCompare(right.users || right.employeeName || right.displayTitle, 'ru')
      ))
    }))
    .sort((left, right) => left.name.localeCompare(right.name, 'ru'))
}

const summarizeDeviceKinds = (devices, ipPhones = []) => {
  const counts = new Map()

  devices.forEach((device) => {
    counts.set(device.type, (counts.get(device.type) || 0) + 1)
  })

  // Add IP phones as a device kind
  if (ipPhones && ipPhones.length > 0) {
    counts.set('IP-телефон', (counts.get('IP-телефон') || 0) + ipPhones.length)
  }

  return Array.from(counts.entries()).map(([type, count]) => ({
    type,
    count,
    label: count > 1 ? `${type} x${count}` : type
  }))
}

const normalizeDevice = (device, index, recordId) => ({
  id: device.id || `${recordId}-device-${index + 1}`,
  type: device.type || device.type_name || '',
  manufacturer: device.manufacturer || '',
  model: device.model || '',
  title: device.title || [device.manufacturer, device.model].filter(Boolean).join(' ') || device.type || device.type_name || 'Устройство',
  serial: device.serial || '',
  inventoryNumber: device.inventoryNumber || device.inventory_number || '',
  suppliedAt: device.suppliedAt || device.supplied_at || '',
  ram: device.ram || '',
  cpu: device.cpu || '',
  system: device.system || '',
  gpu: device.gpu || '',
  printerLocationId: device.printerLocationId || device.printer_location_id || null,
  linkedPrinter: device.linkedPrinter || device.linked_printer
    ? {
        id: device.linkedPrinter?.id || device.linked_printer?.printer_location_id || device.printerLocationId || device.printer_location_id || null,
        employeeId: device.linkedPrinter?.employeeId || device.linked_printer?.employee_id || null,
        locationId: device.linkedPrinter?.locationId || device.linked_printer?.location_id || null,
        locationName: device.linkedPrinter?.locationName || device.linked_printer?.location_name || '',
        room: device.linkedPrinter?.room || device.linked_printer?.room || '',
        fio: device.linkedPrinter?.fio || device.linked_printer?.fio || '',
        department: device.linkedPrinter?.department || device.linked_printer?.department || '',
        modelName: device.linkedPrinter?.modelName || device.linked_printer?.model_name || '',
        cartridgeTypeName: device.linkedPrinter?.cartridgeTypeName || device.linked_printer?.cartridge_type_name || '',
        availableNewCount: device.linkedPrinter?.availableNewCount ?? device.linked_printer?.available_new_count ?? 0,
        availableRefilledCount: device.linkedPrinter?.availableRefilledCount ?? device.linked_printer?.available_refilled_count ?? 0
      }
    : null,
  isPrimary: Boolean(device.isPrimary || device.is_primary)
})

const buildSearchValues = (record, devices) => [
  record.department,
  record.locationName,
  record.cabinet,
  ...(record.locations || []).map((location) => location.locationName),
  record.owner,
  record.position,
  record.title,
  record.subtitle,
  record.assignmentKind === 'shared' ? 'общая техника' : 'рабочее место',
  ...(record.ipPhones || []).flatMap((phone) => [
    phone.internalNumber,
    phone.ipAddress,
    phone.macAddress,
    phone.users,
    phone.login,
    phone.password,
    phone.userMatchesLogin ? 'user логин совпадают' : ''
  ]),
  ...devices.flatMap((device) => [
    device.type,
    device.manufacturer,
    device.model,
    device.title,
    device.serial,
    device.inventoryNumber,
    device.suppliedAt,
    device.ram,
    device.cpu,
    device.system,
    device.gpu,
    device.linkedPrinter?.locationName,
    device.linkedPrinter?.fio,
    device.linkedPrinter?.department,
    device.linkedPrinter?.modelName,
    device.linkedPrinter?.cartridgeTypeName,
    String(device.linkedPrinter?.availableNewCount ?? ''),
    String(device.linkedPrinter?.availableRefilledCount ?? '')
  ])
]

export const prepareEquipmentRecords = (records, ipPhones = []) => records.map((record, index) => {
  const devices = (record.devices || []).map((device, deviceIndex) => normalizeDevice(device, deviceIndex, record.id || `equipment-${index + 1}`))
  const normalizedLocations = (record.locations || []).map((location, locationIndex) => ({
    id: location.id || `${record.id || `equipment-${index + 1}`}-location-${locationIndex + 1}`,
    locationId: location.locationId || location.location_id || null,
    locationName: location.locationName || location.location_name || '',
    sortOrder: location.sortOrder ?? location.sort_order ?? locationIndex
  }))
  const primaryLocationName = normalizedLocations[0]?.locationName || record.location_name || ''
  const employeeId = record.employeeId || record.employee_id || null
  const linkedPhones = (ipPhones || []).filter((phone) => (
    employeeId && phone.employee_id ? Number(phone.employee_id) === Number(employeeId) : false
  ))
  const primaryDevice = devices.find((device) => device.isPrimary)
    || (record.primary_device_title || record.primaryDeviceTitle
      ? {
          id: `${record.id || `equipment-${index + 1}`}-primary`,
          type: record.primary_device_type || record.primaryDeviceType || '',
          manufacturer: '',
          model: '',
          title: record.primary_device_title || record.primaryDeviceTitle || '',
          serial: '',
          inventoryNumber: '',
          suppliedAt: '',
          ram: record.ram || '',
          cpu: record.cpu || '',
          system: record.system || '',
          gpu: record.gpu || '',
          isPrimary: true
        }
      : null)

  const normalized = {
    id: record.id || `equipment-${index + 1}`,
    type: 'equipment',
    employeeId: employeeId,
    department: record.department || '',
    locationId: record.location_id || null,
    locationName: primaryLocationName,
    locations: normalizedLocations,
    cabinet: record.cabinet || '',
    owner: record.owner || '',
    position: record.position || '',
    assignmentKind: record.assignmentKind || record.assignment_kind || (record.owner ? 'personal' : 'shared'),
    title: record.title || record.owner || record.position || ((primaryLocationName || record.cabinet) ? `Кабинет ${primaryLocationName || record.cabinet}` : 'Без привязки'),
    subtitle: record.subtitle || '',
    devices,
    deviceKinds: summarizeDeviceKinds(devices, linkedPhones),
    deviceCount: (record.deviceCount ?? record.device_count ?? devices.length) + linkedPhones.length,
    primaryDevice,
    ram: record.ram || primaryDevice?.ram || '',
    cpu: record.cpu || primaryDevice?.cpu || '',
    system: record.system || primaryDevice?.system || '',
    gpu: record.gpu || primaryDevice?.gpu || '',
    sourceFile: record.sourceFile || record.source_file || '',
    ipPhones: linkedPhones
  }

  normalized.searchValues = buildSearchValues(normalized, devices)
  return normalized
})

export const filterEquipmentRecords = (records, query) => {
  if (!query) return records
  return records.filter((record) => matchSearchValues(record.searchValues, query))
}

export const equipmentRecordMatchesSearch = (record, query) => matchSearchValues(record.searchValues, query)

export const buildEquipmentDepartments = (records) => {
  const groups = new Map()

  records.forEach((record) => {
    const departmentName = record.department || 'Без отдела'

    if (!groups.has(departmentName)) {
      groups.set(departmentName, {
        id: `department-${groups.size + 1}`,
        name: departmentName,
        records: [],
        deviceCount: 0
      })
    }

    const group = groups.get(departmentName)
    group.records.push(record)
    group.deviceCount += record.deviceCount
  })

  return Array.from(groups.values())
}

export const buildEquipmentSummary = (records) => ({
  departmentCount: new Set(records.map((record) => record.department || 'Без отдела')).size,
  stationCount: records.length,
  deviceCount: records.reduce((sum, record) => sum + record.deviceCount, 0),
  ipPhoneCount: records.reduce((sum, record) => sum + (record.ipPhones?.length || 0), 0),
  sharedCount: records.filter((record) => record.assignmentKind === 'shared').length,
  primarySystemsCount: records.filter((record) => record.primaryDevice?.isPrimary).length
})
