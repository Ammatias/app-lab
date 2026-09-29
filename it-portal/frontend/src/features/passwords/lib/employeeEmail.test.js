import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import {
  getPasswordSearchTokens,
  getPasswordSubtypeLabel,
  normalizePasswordSubtype,
  PASSWORD_PRIMARY_VIEWS,
  resolvePasswordSubtypeByView
} from './passwordSubtypes.js'

const sectionTabsSource = await readFile(new URL('../components/PasswordSectionTabs.jsx', import.meta.url), 'utf8')
const statsSource = await readFile(new URL('../components/PasswordStats.jsx', import.meta.url), 'utf8')
const routeStateSource = await readFile(new URL('../../../app/hooks/usePortalRouteState.js', import.meta.url), 'utf8')
const itemFormSource = await readFile(new URL('../../item-modal/components/ItemFormFields.jsx', import.meta.url), 'utf8')

test('employee mail is a dedicated password subtype and primary view', () => {
  assert.equal(normalizePasswordSubtype('employee_email'), 'employee_email')
  assert.equal(getPasswordSubtypeLabel('employee_email'), 'Почта сотрудников')
  assert.equal(
    resolvePasswordSubtypeByView({ primaryView: PASSWORD_PRIMARY_VIEWS.employeeMail, networkView: 'wifi' }),
    'employee_email'
  )
})

test('employee mail records are searchable by Russian and email terms', () => {
  const tokens = getPasswordSearchTokens({
    subtype: 'employee_email',
    title: 'Иванов Иван',
    login: 'employee01@demo.example.com',
    value: 'secret'
  })

  assert.ok(tokens.includes('Почта сотрудников'))
  assert.ok(tokens.includes('почта'))
  assert.ok(tokens.includes('email'))
})

test('password UI exposes the exact employee mail section and compact statistic', () => {
  assert.match(sectionTabsSource, /Почта сотрудников/)
  assert.match(sectionTabsSource, /PASSWORD_PRIMARY_VIEWS\.employeeMail/)
  assert.match(statsSource, /label:\s*'Почта сотрудников'/)
  assert.match(statsSource, /compactLabel:\s*'Почта'/)
})

test('route and create form preserve the employee mail subtype', () => {
  assert.match(routeStateSource, /PASSWORD_PRIMARY_VIEWS\.employeeMail/)
  assert.match(itemFormSource, /value:\s*'employee_email'/)
  assert.match(itemFormSource, />Сотрудник</)
  assert.match(itemFormSource, />Email</)
  assert.match(itemFormSource, />Пароль</)
})
