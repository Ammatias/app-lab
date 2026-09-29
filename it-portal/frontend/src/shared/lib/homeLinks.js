export const createHomeLinkUniqueKey = (link) => (
  `${String(link?.name || '').trim()}::${String(link?.href || '').trim().toLowerCase()}`
)

export const buildHomeLinkSearchTarget = (link) => (
  `${link?.name || ''} ${link?.href || ''} ${link?.desc || ''} ${link?.sourceTitle || ''} home главная домашняя homepage`
    .toLowerCase()
)
