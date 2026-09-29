async function readJson(response, fallbackMessage) {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || fallbackMessage)
  return payload
}

export async function fetchEcpInstallTarget(itemId) {
  return readJson(await fetch(`/api/items/${itemId}/ecp-install-target`), 'Не удалось проверить компьютер')
}

export async function startEcpInstall(itemId, agentId, containerPin = '') {
  const response = await fetch(`/api/items/${itemId}/ecp-install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_id: agentId, container_pin: containerPin })
  })
  return readJson(response, 'Не удалось запустить установку')
}

export async function fetchEcpInstallStatus(itemId) {
  return readJson(await fetch(`/api/items/${itemId}/ecp-install-status`), 'Не удалось получить статус установки')
}

export async function fetchEcpInstallOptions() {
  return readJson(await fetch('/api/ecp-install/options'), 'Не удалось загрузить мастер установки')
}

export async function startDelegatedEcpInstall(itemId, agentId, targetEmployeeId, containerPin = '') {
  const response = await fetch('/api/ecp-install/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      item_id: itemId,
      target_employee_id: targetEmployeeId,
      agent_id: agentId,
      acknowledged: true,
      container_pin: containerPin
    })
  })
  return readJson(response, 'Не удалось запустить установку')
}

export async function fetchEcpInstallJobStatus(jobId) {
  return readJson(await fetch(`/api/ecp-install/jobs/${encodeURIComponent(jobId)}/status`), 'Не удалось получить статус установки')
}
