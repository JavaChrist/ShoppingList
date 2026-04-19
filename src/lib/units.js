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

export function formatQuantity(quantity, unit) {
  if (!unit || unit === 'unité') {
    return quantity > 1 ? `× ${quantity}` : null
  }
  return `${quantity} ${unit}`
}
