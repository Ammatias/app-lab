export const emptyEmployeeAccountForm = {
  full_name: '',
  department_id: '',
  department: '',
  location_id: '',
  room: '',
  position: '',
  email: '',
  phone: '',
  internal: '',
  mobile: ''
}

export const createEmptyEmployeeAccountForm = () => ({ ...emptyEmployeeAccountForm })

export const createEmployeeAccountFormFromEmployee = (employee) => ({
  full_name: employee?.full_name || '',
  department_id: employee?.department_id || '',
  department: employee?.department || '',
  location_id: employee?.location_id || '',
  room: employee?.room || '',
  position: employee?.position || '',
  email: employee?.email || '',
  phone: employee?.phone || '',
  internal: employee?.internal || '',
  mobile: employee?.mobile || ''
})
