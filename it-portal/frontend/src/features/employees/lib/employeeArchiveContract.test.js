import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const modalSource = await readFile(new URL('../components/EmployeeAccountsModal.jsx', import.meta.url), 'utf8')
const controllerSource = await readFile(new URL('../../../app/hooks/useDirectoryManagementController.js', import.meta.url), 'utf8')

test('employee archive keeps linked records when no replacement is selected', () => {
  assert.match(modalSource, /Не передавать \(сохранить за архивным сотрудником\)/)
  assert.match(modalSource, /останутся привязаны к архивному профилю как исторические данные/)
  assert.match(modalSource, /replacement_employee_id:\s*replacementEmployeeId \? Number\(replacementEmployeeId\) : null/)
  assert.doesNotMatch(modalSource, /selectedTransferLinkCount\s*>\s*0\s*&&\s*!replacementEmployeeId/)
})

test('employee archive still supports optional reassignment', () => {
  assert.match(modalSource, /Передать связанные записи/)
  assert.match(modalSource, /Передать и архивировать/)
  assert.match(
    controllerSource,
    /payload\.replacement_employee_id\s*\?\s*\{\s*\.\.\.item,\s*employee_id:\s*payload\.replacement_employee_id\s*\}\s*:\s*item/s
  )
})
