import { EN_TO_RU, RU_TO_EN, translitToEn, translitToRu } from './translit.js'

export const generateSearchVariations = (query) => {
  const qStr = String(query || '').toLowerCase()
  const ruMapped = qStr.split('').map((char) => RU_TO_EN[char] || char).join('')
  const enMapped = qStr.split('').map((char) => EN_TO_RU[char] || char).join('')

  const vars = new Set([qStr, ruMapped, enMapped])
  ;[qStr, ruMapped, enMapped].forEach((value) => {
    vars.add(translitToEn(value))
    vars.add(translitToRu(value))
  })

  return Array.from(vars)
}

export const matchSearchValues = (values, query) => {
  if (!query) return true
  const vars = generateSearchVariations(query)

  return values.some((value) => {
    if (value === null || value === undefined) return false
    const stringValue = String(value).toLowerCase()
    return vars.some((variation) => stringValue.includes(variation))
  })
}
