const TOKEN_REPLACEMENTS = {
  printer_model: {
    lj: 'laserjet',
    laser: 'laserjet'
  }
}

export function normalizeInventoryWhitespace(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function normalizeAliasKey(value, kind) {
  const normalized = normalizeInventoryWhitespace(value).toLowerCase()

  if (kind === 'cartridge_model' || kind === 'cartridge_type') {
    return normalized.replace(/[^a-z0-9]+/gi, '')
  }

  const tokens = normalized
    .replace(/[^a-z0-9]+/gi, ' ')
    .split(' ')
    .filter(Boolean)
    .map((token) => TOKEN_REPLACEMENTS[kind]?.[token] || token)

  return tokens.join(' ')
}

function humanizePrinterModel(value) {
  return normalizeInventoryWhitespace(value)
    .split(' ')
    .map((part) => {
      const upper = part.toUpperCase()
      if (['HP', 'MFP', 'MFP410', 'M402', 'M404'].includes(upper)) return upper
      if (/\d/.test(part)) return upper
      return upper.charAt(0) + upper.slice(1).toLowerCase()
    })
    .join(' ')
}

function humanizeCartridge(value) {
  return normalizeInventoryWhitespace(value).toUpperCase()
}

export function buildInventoryAliasMap(aliases) {
  const map = {
    printer_model: new Map(),
    cartridge_model: new Map(),
    cartridge_type: new Map()
  }

  for (const alias of aliases || []) {
    const kind = alias.entity_kind
    if (!map[kind]) continue
    map[kind].set(normalizeAliasKey(alias.alias_value, kind), normalizeInventoryWhitespace(alias.canonical_value))
  }

  return map
}

export function normalizeInventoryValue(value, kind, aliasMap) {
  const trimmed = normalizeInventoryWhitespace(value)
  if (!trimmed) return ''

  const key = normalizeAliasKey(trimmed, kind)
  const aliased = aliasMap?.[kind]?.get(key)
  if (aliased) return aliased

  if (kind === 'printer_model') return humanizePrinterModel(trimmed)
  return humanizeCartridge(trimmed)
}
