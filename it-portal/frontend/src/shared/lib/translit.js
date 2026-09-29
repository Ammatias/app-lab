export const RU_TO_EN = {
  'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p', 'х': '[', 'ъ': ']',
  'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k', 'д': 'l', 'ж': ';', 'э': '\'',
  'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm', 'б': ',', 'ю': '.', '.': '/', 'ё': '`'
}

export const EN_TO_RU = Object.fromEntries(Object.entries(RU_TO_EN).map(([ru, en]) => [en, ru]))

export const translitToEn = (text) => {
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  }

  return String(text || '')
    .toLowerCase()
    .split('')
    .map((char) => map[char] || char)
    .join('')
}

export const translitToRu = (text) => {
  let result = String(text || '').toLowerCase()
  const map = {
    yo: 'ё', zh: 'ж', ch: 'ч', sh: 'ш', sch: 'щ', yu: 'ю', ya: 'я', ts: 'ц',
    a: 'а', b: 'б', v: 'в', g: 'г', d: 'д', e: 'е', z: 'з', i: 'и',
    j: 'й', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р',
    s: 'с', t: 'т', u: 'у', f: 'ф', h: 'х', c: 'к', y: 'й', w: 'в', q: 'к', x: 'кс'
  }

  const keys = Object.keys(map).sort((a, b) => b.length - a.length)
  keys.forEach((key) => {
    if (result.includes(key)) {
      result = result.split(key).join(map[key])
    }
  })

  return result
}
