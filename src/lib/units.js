export const UNITS = ['unité', 'kg', 'g', 'L', 'ml', 'paquet', 'boîte', 'pack']

const UNIT_ALIASES = {
  kg: ['kg', 'kilo', 'kilos', 'kilogramme'],
  g: ['g', 'gr', 'gramme', 'grammes'],
  L: ['l', 'litre', 'litres'],
  ml: ['ml', 'millilitre', 'millilitres', 'cl', 'centilitre'],
  paquet: ['paquet', 'paquets', 'pqt'],
  boîte: ['boite', 'boîte', 'boîtes', 'boites', 'bte'],
  pack: ['pack', 'packs', 'lot'],
}

export function parseInput(raw) {
  const trimmed = raw.trim()

  const match = trimmed.match(/^(\d+(?:[.,]\d+)?)\s*([a-zA-Zéîèàûùâêôç]+)\s+(.+)$/)
  if (match) {
    const qty = parseFloat(match[1].replace(',', '.'))
    const rawUnit = match[2].toLowerCase()
    const name = match[3].trim()

    for (const [unit, aliases] of Object.entries(UNIT_ALIASES)) {
      if (aliases.includes(rawUnit)) {
        return { name, quantity: qty, unit }
      }
    }
    return { name: trimmed, quantity: 1, unit: 'unité' }
  }

  const numOnly = trimmed.match(/^(\d+)\s+(.+)$/)
  if (numOnly) {
    return { name: numOnly[2].trim(), quantity: parseInt(numOnly[1]), unit: 'unité' }
  }

  return { name: trimmed, quantity: 1, unit: 'unité' }
}

/**
 * Formate une quantité "à la française" :
 * - 0.5 → ½, 0.25 → ¼, 0.75 → ¾
 * - 1.5 → 1½, 2.5 → 2½
 * - autres décimales → virgule (0,3 au lieu de 0.3)
 */
function prettyNumber(n) {
  if (n == null) return ''
  const num = Number(n)
  if (Number.isNaN(num)) return String(n)

  const FRACS = { 0.5: '½', 0.25: '¼', 0.75: '¾', 0.33: '⅓', 0.67: '⅔' }
  const int = Math.trunc(num)
  const frac = Math.round((num - int) * 100) / 100

  if (frac === 0) return String(int)
  if (FRACS[frac]) return int === 0 ? FRACS[frac] : `${int}${FRACS[frac]}`
  // Sinon, décimale "à la française"
  return String(num).replace('.', ',')
}

export function formatQuantity(quantity, unit) {
  const q = prettyNumber(quantity)
  if (!unit || unit === 'unité') {
    return Number(quantity) > 1 ? `× ${q}` : null
  }
  return `${q} ${unit}`
}
