export const getNetworkRate = (contact, field) => {
  const value = Number(contact?.[field])
  return Number.isFinite(value) && value >= 0 ? value : -1
}

export const formatByteRate = (value) => {
  const bitsPerSecond = Number(value)
  if (!Number.isFinite(bitsPerSecond) || bitsPerSecond < 0) return null
  const bytesPerSecond = bitsPerSecond / 8
  if (bytesPerSecond >= 1_000_000_000) return `${(bytesPerSecond / 1_000_000_000).toFixed(1)} ГБ/с`
  if (bytesPerSecond >= 1_000_000) return `${(bytesPerSecond / 1_000_000).toFixed(1)} МБ/с`
  if (bytesPerSecond >= 1_000) return `${(bytesPerSecond / 1_000).toFixed(0)} КБ/с`
  return `${Math.round(bytesPerSecond)} Б/с`
}

export const getNetworkLimitMbps = (contact) => {
  const value = Number(contact?.network_limit_mbps)
  return Number.isFinite(value) && value > 0 ? value : null
}
