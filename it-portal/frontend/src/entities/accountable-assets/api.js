function toBase64(bytes) {
  let binary = ''
  const chunkSize = 0x8000

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize)
    binary += String.fromCharCode(...chunk)
  }

  return window.btoa(binary)
}

export async function fetchAccountableAssets(filters = {}) {
  const params = new URLSearchParams()

  if (filters.search) {
    params.set('search', String(filters.search).trim())
  }

  if (filters.location) {
    params.set('location', String(filters.location).trim())
  }

  if (filters.withoutLocation) {
    params.set('without_location', 'true')
  }

  if (filters.writtenOff === true) {
    params.set('written_off', 'true')
  }

  const query = params.toString()
  const response = await fetch(query ? `/api/accountable-assets?${query}` : '/api/accountable-assets')
  if (!response.ok) throw new Error(await response.text() || 'Failed to fetch accountable assets')
  return response.json()
}

export async function importAccountableAssetsXlsx(file) {
  const bytes = new Uint8Array(await file.arrayBuffer())
  const response = await fetch('/api/accountable-assets/import-xlsx', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      file_name: file.name,
      content_base64: toBase64(bytes)
    })
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to import accountable assets')
  return response.json()
}

export async function fetchAccountableImportBatches() {
  const response = await fetch('/api/accountable-assets/import-batches')
  if (!response.ok) throw new Error(await response.text() || 'Failed to fetch accountable import batches')
  return response.json()
}

export async function fetchAccountableImportDiff(leftBatchId, rightBatchId) {
  const params = new URLSearchParams({
    left_batch_id: String(leftBatchId),
    right_batch_id: String(rightBatchId)
  })

  const response = await fetch(`/api/accountable-assets/import-compare?${params.toString()}`)
  if (!response.ok) throw new Error(await response.text() || 'Failed to fetch accountable import diff')
  return response.json()
}

export async function rollbackAccountableImportBatch(batchId) {
  const response = await fetch(`/api/accountable-assets/import-batches/${batchId}/rollback`, {
    method: 'POST'
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to rollback accountable import batch')
  return response.json()
}

export async function generateAccountableWriteoffArchive(assetIds) {
  const response = await fetch('/api/accountable-assets/writeoff-archive', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      asset_ids: assetIds
    })
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to generate writeoff archive')

  const disposition = response.headers.get('content-disposition') || ''
  const match = disposition.match(/filename=\"([^\"]+)\"/)

  return {
    blob: await response.blob(),
    fileName: match?.[1] || 'spisanie_podotchet.zip'
  }
}

export async function fetchAccountableWriteoffHistory() {
  const response = await fetch('/api/accountable-assets/writeoff-history')
  if (!response.ok) throw new Error(await response.text() || 'Failed to fetch writeoff history')
  return response.json()
}

export async function fetchAccountableWrittenOffAssets() {
  const response = await fetch('/api/accountable-assets/written-off')
  if (!response.ok) throw new Error(await response.text() || 'Failed to fetch written off assets')
  return response.json()
}

export async function restoreAccountableWriteoffHistoryEntry(entryId) {
  const response = await fetch(`/api/accountable-assets/writeoff-history/${entryId}`, {
    method: 'DELETE'
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to restore writeoff history entry')
}

export async function completeAccountableWriteoffHistoryEntry(entryId) {
  const response = await fetch(`/api/accountable-assets/writeoff-history/${entryId}/complete`, {
    method: 'POST'
  })

  if (!response.ok) throw new Error(await response.text() || 'Failed to complete writeoff history entry')
}

export async function createAccountableAsset(payload) {
  const response = await fetch('/api/accountable-assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  return response
}

export async function updateAccountableAsset(assetId, payload) {
  const response = await fetch(`/api/accountable-assets/${assetId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  return response
}

export async function deleteAccountableAsset(assetId) {
  return fetch(`/api/accountable-assets/${assetId}`, {
    method: 'DELETE'
  })
}
