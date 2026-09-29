export async function requestTacticalAgentAction(agentId, action, reason) {
  const response = await fetch(`/api/tactical/agents/${encodeURIComponent(agentId)}/${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason })
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(payload.message || 'Не удалось выполнить действие в TRMM')
  return payload
}
