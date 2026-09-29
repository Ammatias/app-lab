import { formatDayMonthYear } from '../../../shared/lib/dates'

const ASN1_CLASSES = {
  UNIVERSAL: 0,
  CONTEXT_SPECIFIC: 2
}

const ASN1_TAGS = {
  SEQUENCE: 16,
  UTC_TIME: 23,
  GENERALIZED_TIME: 24
}

const readTag = (bytes, offset) => {
  const firstByte = bytes[offset]
  return {
    tagClass: firstByte >> 6,
    constructed: (firstByte & 0x20) === 0x20,
    tagNumber: firstByte & 0x1f,
    offset: offset + 1
  }
}

const readLength = (bytes, offset) => {
  const firstByte = bytes[offset]
  if ((firstByte & 0x80) === 0) {
    return { length: firstByte, offset: offset + 1 }
  }

  const byteCount = firstByte & 0x7f
  if (byteCount === 0) {
    throw new Error('Indefinite ASN.1 lengths are not supported')
  }

  let length = 0
  for (let index = 0; index < byteCount; index += 1) {
    length = (length << 8) | bytes[offset + 1 + index]
  }

  return { length, offset: offset + 1 + byteCount }
}

const readNode = (bytes, offset) => {
  const tag = readTag(bytes, offset)
  const { length, offset: valueOffset } = readLength(bytes, tag.offset)
  const endOffset = valueOffset + length

  return {
    ...tag,
    length,
    valueOffset,
    endOffset,
    totalLength: endOffset - offset
  }
}

const readChildren = (bytes, node) => {
  const children = []
  let cursor = node.valueOffset

  while (cursor < node.endOffset) {
    const child = readNode(bytes, cursor)
    children.push(child)
    cursor = child.endOffset
  }

  return children
}

const parseAsn1Time = (value) => {
  const normalized = value.trim()

  if (/^\d{12}Z$/.test(normalized) || /^\d{10}Z$/.test(normalized)) {
    const yearPrefix = Number.parseInt(normalized.slice(0, 2), 10) >= 50 ? '19' : '20'
    const year = Number.parseInt(`${yearPrefix}${normalized.slice(0, 2)}`, 10)
    const month = Number.parseInt(normalized.slice(2, 4), 10)
    const day = Number.parseInt(normalized.slice(4, 6), 10)
    const hours = Number.parseInt(normalized.slice(6, 8), 10)
    const minutes = Number.parseInt(normalized.slice(8, 10), 10)
    const seconds = normalized.length === 13 ? Number.parseInt(normalized.slice(10, 12), 10) : 0
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds))
  }

  if (/^\d{14}Z$/.test(normalized)) {
    const year = Number.parseInt(normalized.slice(0, 4), 10)
    const month = Number.parseInt(normalized.slice(4, 6), 10)
    const day = Number.parseInt(normalized.slice(6, 8), 10)
    const hours = Number.parseInt(normalized.slice(8, 10), 10)
    const minutes = Number.parseInt(normalized.slice(10, 12), 10)
    const seconds = Number.parseInt(normalized.slice(12, 14), 10)
    return new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds))
  }

  return null
}

const decodeAscii = (bytes, start, end) => {
  let value = ''
  for (let index = start; index < end; index += 1) {
    value += String.fromCharCode(bytes[index])
  }
  return value
}

const extractCertificateNotAfter = (bytes) => {
  const root = readNode(bytes, 0)
  if (root.tagClass !== ASN1_CLASSES.UNIVERSAL || root.tagNumber !== ASN1_TAGS.SEQUENCE) {
    throw new Error('Invalid certificate root sequence')
  }

  const rootChildren = readChildren(bytes, root)
  const tbsCertificate = rootChildren[0]
  const tbsChildren = readChildren(bytes, tbsCertificate)

  const baseIndex = tbsChildren[0]?.tagClass === ASN1_CLASSES.CONTEXT_SPECIFIC && tbsChildren[0]?.tagNumber === 0
    ? 1
    : 0

  const validityNode = tbsChildren[baseIndex + 3]
  if (!validityNode || validityNode.tagClass !== ASN1_CLASSES.UNIVERSAL || validityNode.tagNumber !== ASN1_TAGS.SEQUENCE) {
    throw new Error('Certificate validity section not found')
  }

  const validityChildren = readChildren(bytes, validityNode)
  const notAfterNode = validityChildren[1]
  if (!notAfterNode) {
    throw new Error('Certificate expiration date not found')
  }

  const rawValue = decodeAscii(bytes, notAfterNode.valueOffset, notAfterNode.endOffset)
  const date = parseAsn1Time(rawValue)
  if (!date || Number.isNaN(date.getTime())) {
    throw new Error('Unsupported certificate expiration date format')
  }

  return date
}

export const extractValidUntilFromCertificate = async (arrayBuffer) => {
  try {
    const bytes = new Uint8Array(arrayBuffer)
    const notAfter = extractCertificateNotAfter(bytes)
    return formatDayMonthYear(notAfter)
  } catch (error) {
    console.warn('Failed to parse certificate expiration date', error)
    return null
  }
}
