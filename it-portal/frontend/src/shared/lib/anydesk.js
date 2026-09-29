export const connectAnyDesk = (id, password) => {
  if (!id) return

  if (password) {
    navigator.clipboard.writeText(password)
  }

  window.location.href = `anydesk:${String(id).replace(/\s/g, '')}`
}
