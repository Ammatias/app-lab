export const EMPLOYEE_NONE_VALUE = ''

export const findEmployeeById = (employees, employeeId) => {
  if (!employeeId) return null
  return employees.find((employee) => Number(employee.id) === Number(employeeId)) || null
}

export const applyEmployeeToPhonebookForm = (form, employee) => ({
  ...form,
  employee_id: employee.id,
  department_id: employee.department_id || '',
  department: employee.department || '',
  location_id: employee.location_id || '',
  name: employee.full_name || '',
  position: employee.position || '',
  room: employee.room || '',
  email: employee.email || '',
  phone: employee.phone || '',
  internal: employee.internal || '',
  mobile: employee.mobile || ''
})

export const applyEmployeeToPrinterForm = (form, employee) => ({
  ...form,
  employee_id: employee.id,
  fio: employee.full_name || '',
  room: employee.room || ''
})

export const applyEmployeeToEquipmentForm = (form, employee) => ({
  ...form,
  employee_id: employee.id,
  department: employee.department || '',
  cabinetsText: employee.room || '',
  owner: employee.full_name || '',
  position: employee.position || ''
})

export const applyEmployeeToItemForm = (form, employee, itemType) => {
  if (itemType === 'anydesk') {
    return {
      ...form,
      employee_id: employee.id,
      fio: employee.full_name || '',
      room: employee.room || '',
      title: employee.full_name || ''
    }
  }

  if (itemType === 'password') {
    return {
      ...form,
      employee_id: employee.id,
      fio: employee.full_name || '',
      room: employee.room || ''
    }
  }

  if (itemType === 'ecp') {
    return {
      ...form,
      employee_id: employee.id,
      fio: employee.full_name || '',
      room: employee.room || '',
      title: employee.full_name || ''
    }
  }

  return {
    ...form,
    employee_id: employee.id,
    fio: employee.full_name || '',
    room: employee.room || ''
  }
}
