import assert from 'node:assert/strict'
import test from 'node:test'
import {
  certificateIssues,
  delegatedInstallSummary,
  containerPinHint,
  installStatusPresentation,
  isCertificateReady,
  isRunnableTarget,
  matchesInstallOption,
  selectDefaultTarget,
  validateContainerPin
} from './ecpInstall.js'

test('chooses only an online computer with a logged-in Windows user', () => {
  const targets = [
    { agent_id: 'offline', status: 'offline', logged_username: 'DEMO\\user' },
    { agent_id: 'empty', status: 'online', logged_username: '' },
    { agent_id: 'ready', status: 'online', logged_username: 'DEMO\\user' }
  ]
  assert.equal(isRunnableTarget(targets[0]), false)
  assert.equal(selectDefaultTarget(targets), 'ready')
})

test('presents terminal install states without exposing credentials', () => {
  const state = installStatusPresentation({ status: 'succeeded', message: 'Контейнер и сертификат установлены' })
  assert.deepEqual(state, {
    tone: 'succeeded', label: 'ЭЦП установлена', detail: 'Контейнер и сертификат установлены', terminal: true
  })
})

test('distinguishes an already installed certificate from a new installation', () => {
  const state = installStatusPresentation({
    status: 'succeeded',
    message: 'ЭЦП уже установлена на этом компьютере'
  })
  assert.deepEqual(state, {
    tone: 'succeeded',
    label: 'ЭЦП уже установлена',
    detail: 'ЭЦП уже установлена на этом компьютере',
    terminal: true
  })
})

test('blocks certificates with either missing key or missing owner', () => {
  const incomplete = { owner_employee_id: 4, has_public_key: true, has_private_key: false }
  assert.deepEqual(certificateIssues(incomplete), ['Нет закрытого ключа ZIP'])
  assert.equal(isCertificateReady(incomplete), false)
  assert.equal(isCertificateReady({ owner_employee_id: 4, has_public_key: true, has_private_key: true }), true)
})

test('makes source and destination explicit in delegated summary', () => {
  const summary = delegatedInstallSummary(
    { owner_name: 'Иванов Иван' },
    { employee_name: 'Сотрудник 01', hostname: 'PC-12', logged_username: 'DEMO\\employee01' }
  )
  assert.equal(summary, 'ЭЦП Иванов Иван → Петров Петр')
})

test('filters delegated options across employee, host and username', () => {
  assert.equal(matchesInstallOption(['Сотрудник 01', 'PC-12', 'DEMO\\employee01'], 'pc-12'), true)
  assert.equal(matchesInstallOption(['Петров Петр', 'PC-12'], 'иванов'), false)
})

test('explains that an empty ECP password means a passwordless container', () => {
  assert.equal(containerPinHint(''), 'Пусто — контейнер без пароля')
  assert.equal(containerPinHint('1234'), 'Пароль будет передан только для этой установки')
})

test('validates the one-time ECP password before installation', () => {
  assert.equal(validateContainerPin(''), '')
  assert.equal(validateContainerPin('1234'), '')
  assert.match(validateContainerPin('bad\nvalue'), /недопустимые/)
  assert.match(validateContainerPin('1'.repeat(129)), /128/)
})
