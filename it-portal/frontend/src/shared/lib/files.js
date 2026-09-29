export const readFileAsBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => {
    const result = typeof reader.result === 'string' ? reader.result : ''
    const base64 = result.includes(',') ? result.split(',')[1] : result
    resolve(base64)
  }
  reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
  reader.readAsDataURL(file)
})

export const readFileAsArrayBuffer = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader()
  reader.onload = () => resolve(reader.result)
  reader.onerror = () => reject(reader.error || new Error('Failed to read file'))
  reader.readAsArrayBuffer(file)
})

export const downloadStoredFile = (fileName, mimeType, base64Data) => {
  if (!base64Data) return

  try {
    const binary = window.atob(base64Data)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }

    const blob = new Blob([bytes], { type: mimeType || 'application/octet-stream' })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = fileName || 'ecp-open-signature'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(objectUrl)
  } catch (error) {
    console.error('Failed to download file', error)
  }
}
