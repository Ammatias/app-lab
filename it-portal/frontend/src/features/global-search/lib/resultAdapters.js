import { FAVORITES_GROUP_TITLE } from '../../home/config/homeLinkGroups'

const flattenHomeGroups = (groups, parentPath = '') => (
  groups.flatMap((group) => {
    const groupPath = parentPath ? `${parentPath} / ${group.title}` : group.title
    const groupLinks = (group.links || []).map((link) => ({
      id: link.id,
      name: link.name,
      href: link.href,
      desc: link.description || '',
      sourceTitle: groupPath
    }))

    return [
      ...groupLinks,
      ...flattenHomeGroups(group.children || [], groupPath)
    ]
  })
)

export const buildSearchableHomeLinks = ({ favoriteLinks, homeGroups }) => {
  const baseLinks = flattenHomeGroups(homeGroups)

  const favoriteEntries = favoriteLinks.map((link) => ({
    ...link,
    sourceTitle: link.sourceTitle || FAVORITES_GROUP_TITLE
  }))

  return [...baseLinks, ...favoriteEntries]
}
