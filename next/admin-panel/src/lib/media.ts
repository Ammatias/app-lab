import path from 'node:path'

export const MEDIA_ROOT = path.join(/* turbopackIgnore: true */ process.cwd(), 'uploads')
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const MEDIA_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/

export function projectMediaDirectory(projectId: string) {
  return path.join(MEDIA_ROOT, projectId)
}

export function mediaFilePath(projectId: string, filename: string) {
  const directory = projectMediaDirectory(projectId)
  const resolved = path.resolve(directory, filename)
  if (!resolved.startsWith(`${path.resolve(directory)}${path.sep}`)) {
    throw new Error('Invalid media path')
  }
  return resolved
}

export function mediaTokenFromId(id: string) {
  if (!UUID_PATTERN.test(id)) throw new Error('Invalid media id')
  return Buffer.from(id.replaceAll('-', ''), 'hex').toString('base64url')
}

export function mediaIdFromToken(token: string) {
  if (!MEDIA_TOKEN_PATTERN.test(token)) return null

  try {
    const bytes = Buffer.from(token, 'base64url')
    if (bytes.length !== 16) return null
    const hex = bytes.toString('hex')
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
  } catch {
    return null
  }
}

export function publicMediaUrl(origin: string, id: string) {
  const baseUrl = origin.replace(/\/$/, '')
  return `${baseUrl}/m/${mediaTokenFromId(id)}`
}

export function storedMediaFilePath(filePath: string) {
  const root = path.resolve(MEDIA_ROOT)
  const resolved = path.resolve(filePath)
  if (!resolved.startsWith(`${root}${path.sep}`)) throw new Error('Invalid media path')
  return resolved
}
