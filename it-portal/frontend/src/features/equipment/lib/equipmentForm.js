export const createEmptyEquipmentDevice = () => ({
  type_name: '',
  manufacturer: '',
  model: '',
  title: '',
  serial: '',
  inventory_number: '',
  supplied_at: '',
  ram: '',
  cpu: '',
  system: '',
  gpu: '',
  printer_location_id: '',
  is_primary: false
})

export const createEmptyEquipmentForm = () => ({
  employee_id: '',
  department: '',
  cabinetsText: '',
  owner: '',
  position: '',
  assignmentKind: 'personal',
  devices: [createEmptyEquipmentDevice()]
})

const deriveCabinetsText = (record) => {
  const locations = Array.isArray(record.locations) ? record.locations : []
  if (locations.length > 0) {
    return locations
      .map((location) => location.locationName || location.location_name || '')
      .filter(Boolean)
      .join('\n')
  }

  return record.locationName || record.location_name || record.cabinet || ''
}

export const createEquipmentFormFromRecord = (record) => ({
  employee_id: record.employeeId || record.employee_id || '',
  department: record.department || '',
  cabinetsText: deriveCabinetsText(record),
  owner: record.owner || '',
  position: record.position || '',
  assignmentKind: record.assignmentKind || 'personal',
  devices: (record.devices || []).length > 0
    ? record.devices.map((device) => ({
        type_name: device.type || device.type_name || '',
        manufacturer: device.manufacturer || '',
        model: device.model || '',
        title: device.title || '',
        serial: device.serial || '',
        inventory_number: device.inventoryNumber || device.inventory_number || '',
        supplied_at: device.suppliedAt || device.supplied_at || '',
        ram: device.ram || '',
        cpu: device.cpu || '',
        system: device.system || '',
        gpu: device.gpu || '',
        printer_location_id: device.printerLocationId || device.printer_location_id || '',
        is_primary: Boolean(device.isPrimary || device.is_primary)
      }))
    : [createEmptyEquipmentDevice()]
})

const trimValue = (value) => value.trim()

const parseCabinets = (value) => value
  .split(/\r?\n|,/)
  .map((item) => trimValue(item || ''))
  .filter(Boolean)

export const buildEquipmentPayload = (form) => {
  const cabinets = parseCabinets(form.cabinetsText || '')

  return {
    employee_id: form.employee_id ? Number(form.employee_id) : null,
    department: trimValue(form.department || ''),
    cabinet: cabinets[0] || null,
    cabinets,
    owner: trimValue(form.owner || '') || null,
    position: trimValue(form.position || '') || null,
    assignment_kind: form.assignmentKind || 'personal',
    devices: (form.devices || []).map((device) => ({
      type_name: trimValue(device.type_name || ''),
      manufacturer: trimValue(device.manufacturer || '') || null,
      model: trimValue(device.model || '') || null,
      title: trimValue(device.title || '') || null,
      serial: trimValue(device.serial || '') || null,
      inventory_number: trimValue(device.inventory_number || '') || null,
      supplied_at: trimValue(device.supplied_at || '') || null,
      ram: trimValue(device.ram || '') || null,
      cpu: trimValue(device.cpu || '') || null,
      system: trimValue(device.system || '') || null,
      gpu: trimValue(device.gpu || '') || null,
      printer_location_id: device.printer_location_id ? Number(device.printer_location_id) : null,
      is_primary: Boolean(device.is_primary)
    }))
  }
}
