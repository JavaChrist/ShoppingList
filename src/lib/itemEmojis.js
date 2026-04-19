// =========================================================
//  itemEmojis.js
//  Mapping nom de produit → emoji spécifique (navet 🥔, pomme 🍎,
//  poulet 🍗…). Utilisé par ItemRow pour remplacer l'emoji
//  générique de catégorie par quelque chose qui correspond au
//  produit réel. Fallback sur l'emoji de la catégorie si aucun
//  match trouvé.
// =========================================================

import { getCategoryById } from './categories'

// Les clés DOIVENT être sans accents et en minuscules.
// Les mots multi-mots sont acceptés (ex: "pomme de terre").
// Lors de la recherche, on tente d'abord un match exact,
// puis un match "contient" (le plus long match gagne).
const ITEM_EMOJIS = {
  // --- Fruits ---
  'pomme': '🍎',
  'poire': '🍐',
  'banane': '🍌',
  'orange': '🍊',
  'clementine': '🍊',
  'mandarine': '🍊',
  'citron': '🍋',
  'lime': '🍋',
  'citron vert': '🍋',
  'fraise': '🍓',
  'framboise': '🫐',
  'myrtille': '🫐',
  'cassis': '🫐',
  'raisin': '🍇',
  'cerise': '🍒',
  'peche': '🍑',
  'abricot': '🍑',
  'ananas': '🍍',
  'mangue': '🥭',
  'kiwi': '🥝',
  'melon': '🍈',
  'pasteque': '🍉',
  'avocat': '🥑',
  'noix de coco': '🥥',
  'coco': '🥥',
  'figue': '🟣',
  'prune': '🟣',
  'grenade': '🍎',

  // --- Légumes ---
  'tomate': '🍅',
  'carotte': '🥕',
  'pomme de terre': '🥔',
  'patate': '🥔',
  'patate douce': '🍠',
  'aubergine': '🍆',
  'courgette': '🥒',
  'concombre': '🥒',
  'poivron': '🫑',
  'piment': '🌶️',
  'brocoli': '🥦',
  'chou fleur': '🥦',
  'chou-fleur': '🥦',
  'salade': '🥬',
  'laitue': '🥬',
  'epinard': '🥬',
  'roquette': '🥬',
  'mache': '🥬',
  'chou': '🥬',
  'chou rouge': '🥬',
  'oignon': '🧅',
  'echalote': '🧅',
  'ail': '🧄',
  'champignon': '🍄',
  'mais': '🌽',
  'haricot': '🫛',
  'haricot vert': '🫛',
  'petit pois': '🫛',
  'pois': '🫛',
  'navet': '🥔',
  'radis': '🥕',
  'celeri': '🌿',
  'poireau': '🌿',
  'courge': '🎃',
  'potimarron': '🎃',
  'citrouille': '🎃',
  'betterave': '🫐',
  'artichaut': '🥬',
  'asperge': '🌿',
  'fenouil': '🌿',

  // --- Boulangerie ---
  'pain': '🍞',
  'baguette': '🥖',
  'pain de mie': '🍞',
  'croissant': '🥐',
  'pain au chocolat': '🥐',
  'chocolatine': '🥐',
  'brioche': '🥐',
  'viennoiserie': '🥐',
  'madeleine': '🧁',
  'cake': '🍰',
  'tarte': '🥧',
  'chausson': '🥐',
  'eclair': '🥐',
  'toast': '🍞',

  // --- Épicerie ---
  'pates': '🍝',
  'spaghetti': '🍝',
  'nouille': '🍜',
  'vermicelle': '🍜',
  'riz': '🍚',
  'farine': '🌾',
  'semoule': '🌾',
  'quinoa': '🌾',
  'sucre': '🍬',
  'sel': '🧂',
  'poivre': '🧂',
  'huile': '🫒',
  'huile olive': '🫒',
  'vinaigre': '🍶',
  'sauce': '🥫',
  'soupe': '🥣',
  'bouillon': '🥣',
  'conserve': '🥫',
  'ketchup': '🥫',
  'moutarde': '🥫',
  'mayonnaise': '🥫',
  'pesto': '🥫',
  'miel': '🍯',
  'confiture': '🍓',
  'chocolat': '🍫',
  'biscuit': '🍪',
  'cookie': '🍪',
  'gateau': '🍰',
  'chips': '🍟',
  'cereales': '🥣',
  'muesli': '🥣',
  'lentille': '🫘',
  'pois chiche': '🫘',
  'haricot sec': '🫘',
  'soja': '🫘',
  'cacahuete': '🥜',
  'noix': '🥜',
  'amande': '🥜',
  'noisette': '🥜',

  // --- Laitier ---
  'lait': '🥛',
  'beurre': '🧈',
  'fromage': '🧀',
  'camembert': '🧀',
  'brie': '🧀',
  'emmental': '🧀',
  'gruyere': '🧀',
  'comte': '🧀',
  'mozzarella': '🧀',
  'parmesan': '🧀',
  'cheddar': '🧀',
  'ricotta': '🧀',
  'mascarpone': '🧀',
  'feta': '🧀',
  'chevre': '🧀',
  'fromage blanc': '🥛',
  'yaourt': '🥛',
  'yogourt': '🥛',
  'creme': '🥛',
  'creme fraiche': '🥛',
  'oeuf': '🥚',

  // --- Viande / Poisson ---
  'poulet': '🍗',
  'dinde': '🍗',
  'canard': '🍗',
  'lapin': '🍗',
  'boeuf': '🥩',
  'steak': '🥩',
  'roti': '🥩',
  'filet': '🥩',
  'escalope': '🥩',
  'cotelette': '🥩',
  'porc': '🥓',
  'veau': '🥩',
  'agneau': '🥩',
  'bacon': '🥓',
  'lardons': '🥓',
  'jambon': '🥓',
  'saucisse': '🌭',
  'merguez': '🌭',
  'chorizo': '🌭',
  'poisson': '🐟',
  'saumon': '🐟',
  'thon': '🐟',
  'cabillaud': '🐟',
  'sardine': '🐟',
  'maquereau': '🐟',
  'colin': '🐟',
  'lieu': '🐟',
  'merlu': '🐟',
  'merlan': '🐟',
  'sole': '🐟',
  'bar': '🐟',
  'dorade': '🐟',
  'daurade': '🐟',
  'rouget': '🐟',
  'truite': '🐟',
  'hareng': '🐟',
  'anchois': '🐟',
  'limande': '🐟',
  'turbot': '🐟',
  'raie': '🐟',
  'lotte': '🐟',
  'julienne': '🐟',
  'eglefin': '🐟',
  'surimi': '🐟',
  'crevette': '🦐',
  'langoustine': '🦐',
  'crabe': '🦀',
  'homard': '🦞',
  'moule': '🦪',
  'huitre': '🦪',
  'coquille saint-jacques': '🦪',
  'calamar': '🦑',
  'calmar': '🦑',
  'encornet': '🦑',
  'poulpe': '🐙',
  'viande': '🥩',

  // --- Surgelés ---
  'glace': '🍦',
  'sorbet': '🍦',
  'frite': '🍟',
  'pizza': '🍕',
  'surgele': '❄️',
  'congele': '❄️',

  // --- Boissons ---
  'eau': '💧',
  'jus': '🧃',
  'jus orange': '🧃',
  'jus pomme': '🧃',
  'soda': '🥤',
  'coca': '🥤',
  'coca cola': '🥤',
  'pepsi': '🥤',
  'schweppes': '🥤',
  'orangina': '🥤',
  'limonade': '🥤',
  'biere': '🍺',
  'vin': '🍷',
  'vin rouge': '🍷',
  'vin blanc': '🥂',
  'vin rose': '🥂',
  'champagne': '🍾',
  'whisky': '🥃',
  'rhum': '🥃',
  'cafe': '☕',
  'the': '🍵',
  'tisane': '🍵',
  'sirop': '🍶',

  // --- Hygiène ---
  'shampoing': '🧴',
  'shampooing': '🧴',
  'savon': '🧼',
  'gel douche': '🧴',
  'dentifrice': '🪥',
  'brosse a dents': '🪥',
  'deodorant': '🧴',
  'rasoir': '🪒',
  'coton': '🪷',
  'parfum': '🧴',
  'creme visage': '🧴',
  'creme corps': '🧴',
  'serviette hygienique': '🧻',
  'tampon': '🧻',
  'lingette': '🧻',
  'coton-tige': '🪶',

  // --- Entretien ---
  'lessive': '🧺',
  'liquide vaisselle': '🧽',
  'eponge': '🧽',
  'nettoyant': '🧴',
  'desinfectant': '🧴',
  'papier toilette': '🧻',
  'essuie-tout': '🧻',
  'essuie tout': '🧻',
  'sopalin': '🧻',
  'sac poubelle': '🗑️',
  'javel': '🧴',
  'adoucissant': '🧴',
  'tablette lave-vaisselle': '🧽',
}

/**
 * Retourne l'emoji le plus spécifique pour un produit donné.
 * Si aucun match trouvé, retourne l'emoji de la catégorie en fallback.
 *
 * @param {string} name - nom du produit (ex: "Navet", "pomme de terre")
 * @param {string} category - id de catégorie (ex: "legumes")
 * @returns {string} emoji
 */
export function getItemEmoji(name, category) {
  const normalized = (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()

  if (!normalized) return getCategoryById(category).emoji

  // 1) match exact
  if (ITEM_EMOJIS[normalized]) return ITEM_EMOJIS[normalized]

  // 2) match "contient" — on teste les clés de la plus longue à la plus courte
  //    pour que "pomme de terre" matche avant "pomme"
  const keys = Object.keys(ITEM_EMOJIS).sort((a, b) => b.length - a.length)
  for (const key of keys) {
    if (normalized.includes(key)) return ITEM_EMOJIS[key]
  }

  // 3) fallback catégorie
  return getCategoryById(category).emoji
}
