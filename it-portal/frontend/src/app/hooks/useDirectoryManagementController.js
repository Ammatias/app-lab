import { useCallback, useEffect, useState } from 'react'
import { archiveEmployee, createEmployee, deleteEmployee, fetchArchivedEmployees, fetchEmployees, restoreEmployee, updateEmployee } from '../../entities/employees/api'
import { fetchPhonebook } from '../../entities/phonebook/api'
import { fetchPrinters } from '../../entities/printers/api'
import {
  createDepartmentAliasEntry,
  createDepartmentEntry,
  deleteDepartmentAliasEntry,
  deleteDepartmentEntry,
  fetchDepartmentsDirectory,
  mergeDepartmentEntries,
  updateDepartmentAliasEntry,
  updateDepartmentEntry
} from '../../entities/departments/api'
import {
  createLocationAliasEntry,
  createLocationEntry,
  deleteLocationAliasEntry,
  deleteLocationEntry,
  fetchLocationsDirectory,
  generateLocationAgentScript,
  mergeLocationEntries,
  updateLocationAliasEntry,
  updateLocationEntry
} from '../../entities/locations/api'

export function useDirectoryManagementController({
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
}) {
  const [locationsDirectory, setLocationsDirectory] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(false)
  const [departmentsDirectory, setDepartmentsDirectory] = useState([])
  const [loadingDepartments, setLoadingDepartments] = useState(false)
  const [archivedEmployees, setArchivedEmployees] = useState([])
  const [loadingArchivedEmployees, setLoadingArchivedEmployees] = useState(false)

  const refreshEmployees = useCallback(async () => {
    const employeesData = await fetchEmployees()
    setEmployees(employeesData)
    loadedDatasetKeysRef.current.add('employees')
    return employeesData
  }, [loadedDatasetKeysRef, setEmployees])

  const refreshLocations = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoadingLocations(true)
    }

    try {
      const data = await fetchLocationsDirectory()
      setLocationsDirectory(data)
      loadedDatasetKeysRef.current.add('locations')
      return data
    } finally {
      if (!silent) {
        setLoadingLocations(false)
      }
    }
  }, [loadedDatasetKeysRef])

  const refreshDepartments = useCallback(async ({ silent = false } = {}) => {
    if (!silent) {
      setLoadingDepartments(true)
    }

    try {
      const data = await fetchDepartmentsDirectory()
      setDepartmentsDirectory(data)
      loadedDatasetKeysRef.current.add('departments')
      return data
    } finally {
      if (!silent) {
        setLoadingDepartments(false)
      }
    }
  }, [loadedDatasetKeysRef])

  const refreshArchivedEmployees = useCallback(async () => {
    setLoadingArchivedEmployees(true)

    try {
      const data = await fetchArchivedEmployees()
      setArchivedEmployees(data)
      return data
    } finally {
      setLoadingArchivedEmployees(false)
    }
  }, [])

  const handleSaveEmployeeAccount = async (employeeId, form) => {
    const payload = {
      full_name: form.full_name,
      department_id: form.department_id ? Number(form.department_id) : null,
      department: form.department,
      location_id: form.location_id ? Number(form.location_id) : null,
      room: form.room || null,
      position: form.position || null,
      email: form.email || null,
      phone: form.phone || null,
      internal: form.internal || null,
      mobile: form.mobile || null
    }

    const response = employeeId
      ? await updateEmployee(employeeId, payload)
      : await createEmployee(payload)

    if (!response.ok) {
      throw new Error(await getRequestErrorMessage(response, {
        fallback: 'Не удалось сохранить профиль сотрудника',
        notFound: 'Сотрудник уже удален или не найден.',
        conflict: 'Сотрудник с таким ФИО уже существует.'
      }))
    }

    await refreshEmployees()
    await refreshDepartments({ silent: true })
    await refreshLocations({ silent: true })
  }

  const handleDeleteEmployeeAccount = async (employeeId) => {
    const response = await deleteEmployee(employeeId)

    if (!response.ok) {
      throw new Error(await getRequestErrorMessage(response, {
        fallback: 'Не удалось удалить сотрудника',
        notFound: 'Сотрудник уже удален или не найден.',
        conflict: 'Сотрудника нельзя удалить из-за связанных данных.'
      }))
    }

    setEmployees(await fetchEmployees())
    setPhonebook(await fetchPhonebook())
    await refreshEquipment()
    setPrinters(await fetchPrinters())
    loadedDatasetKeysRef.current.add('employees')
    loadedDatasetKeysRef.current.add('phonebook')
    loadedDatasetKeysRef.current.add('printers')
    await refreshArchivedEmployees()
    setItems((prev) => prev.map((item) => (
      item.employee_id === employeeId
        ? { ...item, employee_id: null }
        : item
    )))
  }

  const handleRestoreEmployeeAccount = async (employeeId) => {
    const response = await restoreEmployee(employeeId)

    if (!response.ok) {
      throw new Error(await getRequestErrorMessage(response, {
        fallback: 'Не удалось восстановить сотрудника',
        notFound: 'Сотрудник уже восстановлен, удален или не найден.'
      }))
    }

    setEmployees(await response.json())
    setPhonebook(await fetchPhonebook())
    await refreshArchivedEmployees()
    loadedDatasetKeysRef.current.add('employees')
    loadedDatasetKeysRef.current.add('phonebook')
  }

  const handleCreateDepartment = async (payload) => {
    try {
      const created = await createDepartmentEntry(payload)
      await refreshDepartments({ silent: true })
      return created
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось создать отдел')
      throw error
    }
  }

  const handleUpdateDepartment = async (departmentId, payload) => {
    try {
      const updated = await updateDepartmentEntry(departmentId, payload)
      await refreshDepartments({ silent: true })
      await refreshEmployees()
      setPhonebook(await fetchPhonebook())
      loadedDatasetKeysRef.current.add('phonebook')
      return updated
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось обновить отдел')
      throw error
    }
  }

  const handleDeleteDepartment = async (departmentId) => {
    try {
      await deleteDepartmentEntry(departmentId)
      await refreshDepartments({ silent: true })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить отдел')
      throw error
    }
  }

  const handleCreateDepartmentAlias = async (departmentId, payload) => {
    try {
      const created = await createDepartmentAliasEntry(departmentId, payload)
      await refreshDepartments({ silent: true })
      return created
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось создать алиас')
      throw error
    }
  }

  const handleUpdateDepartmentAlias = async (aliasId, payload) => {
    try {
      const updated = await updateDepartmentAliasEntry(aliasId, payload)
      await refreshDepartments({ silent: true })
      return updated
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось обновить алиас')
      throw error
    }
  }

  const handleDeleteDepartmentAlias = async (aliasId) => {
    try {
      await deleteDepartmentAliasEntry(aliasId)
      await refreshDepartments({ silent: true })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить алиас')
      throw error
    }
  }

  const handleMergeDepartments = async (payload) => {
    try {
      const merged = await mergeDepartmentEntries(payload)
      await refreshDepartments({ silent: true })
      await refreshEmployees()
      setPhonebook(await fetchPhonebook())
      loadedDatasetKeysRef.current.add('phonebook')
      return merged
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось схлопнуть отделы')
      throw error
    }
  }

  const handleArchiveEmployeeAccount = async (employeeId, payload) => {
    const response = await archiveEmployee(employeeId, payload)

    if (!response.ok) {
      throw new Error(await getRequestErrorMessage(response, {
        fallback: 'Не удалось отправить сотрудника в архив',
        notFound: 'Сотрудник уже удален, архивирован или не найден.',
        conflict: 'Не удалось переназначить связанные записи.',
        badRequest: 'Для передачи связей выберите другого действующего сотрудника.'
      }))
    }

    setEmployees(await response.json())
    setPhonebook(await fetchPhonebook())
    await refreshEquipment()
    setPrinters(await fetchPrinters())
    await refreshAccountableAssets(accountableRequestFilters)
    await refreshArchivedEmployees()
    loadedDatasetKeysRef.current.add('employees')
    loadedDatasetKeysRef.current.add('phonebook')
    loadedDatasetKeysRef.current.add('printers')
    setItems((prev) => prev.map((item) => (
      Number(item.employee_id) === Number(employeeId)
        ? payload.replacement_employee_id
          ? { ...item, employee_id: payload.replacement_employee_id }
          : item
        : item
    )))
  }

  const handleCreateLocation = async (payload) => {
    try {
      const created = await createLocationEntry(payload)
      await refreshLocations({ silent: true })
      return created
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось создать кабинет')
      throw error
    }
  }

  const handleUpdateLocation = async (locationId, payload) => {
    try {
      const updated = await updateLocationEntry(locationId, payload)
      await refreshLocations({ silent: true })
      await refreshEmployees()
      setPhonebook(await fetchPhonebook())
      loadedDatasetKeysRef.current.add('phonebook')
      return updated
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось обновить кабинет')
      throw error
    }
  }

  const handleDeleteLocation = async (locationId) => {
    try {
      await deleteLocationEntry(locationId)
      await refreshLocations({ silent: true })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить кабинет')
      throw error
    }
  }

  const handleCreateLocationAlias = async (locationId, payload) => {
    try {
      const created = await createLocationAliasEntry(locationId, payload)
      await refreshLocations({ silent: true })
      return created
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось создать алиас')
      throw error
    }
  }

  const handleUpdateLocationAlias = async (aliasId, payload) => {
    try {
      const updated = await updateLocationAliasEntry(aliasId, payload)
      await refreshLocations({ silent: true })
      return updated
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось обновить алиас')
      throw error
    }
  }

  const handleDeleteLocationAlias = async (aliasId) => {
    try {
      await deleteLocationAliasEntry(aliasId)
      await refreshLocations({ silent: true })
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось удалить алиас')
      throw error
    }
  }

  const handleMergeLocations = async (payload) => {
    try {
      const merged = await mergeLocationEntries(payload)
      await refreshLocations({ silent: true })
      await refreshEquipment()
      setPrinters(await fetchPrinters())
      loadedDatasetKeysRef.current.add('printers')
      await refreshAccountableAssets(accountableRequestFilters)
      await refreshEmployees()
      setPhonebook(await fetchPhonebook())
      loadedDatasetKeysRef.current.add('phonebook')
      return merged
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось схлопнуть кабинеты')
      throw error
    }
  }

  const handleGenerateLocationAgentScript = async (locationId) => {
    try {
      const { blob, fileName } = await generateLocationAgentScript(locationId)
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error(error)
      alert(error.message || 'Не удалось создать установщик Tactical RMM')
      throw error
    }
  }

  useEffect(() => {
    if (user) return
    setLocationsDirectory([])
    setLoadingLocations(false)
    setDepartmentsDirectory([])
    setLoadingDepartments(false)
    setArchivedEmployees([])
    setLoadingArchivedEmployees(false)
  }, [user])

  return {
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
    handleDeleteEmployeeAccount,
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
  }
}
