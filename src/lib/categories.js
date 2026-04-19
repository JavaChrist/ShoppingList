export const CATEGORIES = [
  { id: 'fruits',       name: 'Fruits',            emoji: '🍎', color: 'bg-gradient-to-r from-red-100 to-rose-100',       sort_order: 1 },
  { id: 'legumes',      name: 'Légumes',            emoji: '🥕', color: 'bg-gradient-to-r from-orange-100 to-amber-100',   sort_order: 2 },
  { id: 'epicerie',     name: 'Épicerie',           emoji: '🥫', color: 'bg-gradient-to-r from-yellow-100 to-orange-100',  sort_order: 3 },
  { id: 'boulangerie',  name: 'Boulangerie',        emoji: '🥖', color: 'bg-gradient-to-r from-amber-100 to-yellow-100',   sort_order: 4 },
  { id: 'laitier',      name: 'Produits laitiers',  emoji: '🥛', color: 'bg-gradient-to-r from-blue-100 to-sky-100',       sort_order: 5 },
  { id: 'viande',       name: 'Viande / Poisson',   emoji: '🥩', color: 'bg-gradient-to-r from-pink-100 to-rose-100',      sort_order: 6 },
  { id: 'surgeles',     name: 'Surgelés',           emoji: '❄️', color: 'bg-gradient-to-r from-cyan-100 to-sky-100',       sort_order: 7 },
  { id: 'boissons',     name: 'Boissons',           emoji: '🍷', color: 'bg-gradient-to-r from-purple-100 to-violet-100',  sort_order: 8 },
  { id: 'hygiene',      name: 'Hygiène',            emoji: '🧴', color: 'bg-gradient-to-r from-green-100 to-emerald-100',  sort_order: 9 },
  { id: 'entretien',    name: 'Entretien',          emoji: '🧽', color: 'bg-gradient-to-r from-gray-100 to-slate-100',     sort_order: 10 },
  { id: 'autre',        name: 'Autre',              emoji: '📦', color: 'bg-gradient-to-r from-gray-50 to-slate-50',       sort_order: 11 },
]

const KEYWORDS = {
  fruits: ['pomme', 'poire', 'banane', 'orange', 'citron', 'fraise', 'framboise', 'raisin', 'pêche', 'abricot', 'cerise', 'kiwi', 'mangue', 'ananas', 'melon', 'pastèque', 'figue', 'prune', 'myrtille', 'clémentine', 'mandarine', 'grenade', 'fruit'],
  legumes: ['carotte', 'tomate', 'salade', 'laitue', 'courgette', 'aubergine', 'poivron', 'oignon', 'échalote', 'ail', 'poireau', 'brocoli', 'chou', 'épinard', 'haricot', 'petit pois', 'pomme de terre', 'patate', 'champignon', 'concombre', 'radis', 'navet', 'céleri', 'artichaut', 'asperge', 'betterave', 'fenouil', 'légume'],
  epicerie: ['pâtes', 'riz', 'farine', 'sucre', 'sel', 'huile', 'vinaigre', 'conserve', 'sauce', 'céréales', 'muesli', 'confiture', 'miel', 'café', 'thé', 'chocolat', 'biscuit', 'gâteau', 'chips', 'soupe', 'bouillon', 'épice', 'moutarde', 'ketchup', 'mayonnaise', 'pesto', 'tabasco', 'soja', 'lentille', 'pois chiche', 'haricot sec', 'semoule', 'quinoa', 'nouille', 'vermicelle'],
  boulangerie: ['pain', 'baguette', 'croissant', 'brioche', 'viennoiserie', 'madeleine', 'cake', 'tarte', 'chausson', 'éclair', 'pain de mie', 'toast'],
  laitier: ['lait', 'beurre', 'fromage', 'yaourt', 'yogourt', 'crème', 'œuf', 'oeuf', 'camembert', 'brie', 'emmental', 'gruyère', 'comté', 'mozzarella', 'parmesan', 'cheddar', 'ricotta', 'mascarpone', 'crème fraîche', 'fromage blanc'],
  viande: ['poulet', 'bœuf', 'porc', 'veau', 'agneau', 'viande', 'steak', 'saucisse', 'jambon', 'lardons', 'bacon', 'saumon', 'thon', 'cabillaud', 'crevette', 'poisson', 'dinde', 'canard', 'lapin', 'merguez', 'chorizo', 'escalope', 'côtelette', 'rôti', 'filet', 'sardine', 'maquereau', 'colin', 'lieu', 'merlu', 'merlan', 'sole', 'bar', 'dorade', 'daurade', 'rouget', 'truite', 'hareng', 'anchois', 'limande', 'turbot', 'raie', 'lotte', 'julienne', 'églefin', 'eglefin', 'moule', 'huître', 'huitre', 'calamar', 'calmar', 'poulpe', 'encornet', 'surimi', 'crabe', 'langoustine', 'homard', 'coquille saint-jacques'],
  surgeles: ['surgelé', 'congelé', 'glace', 'sorbet'],
  boissons: ['eau', 'jus', 'soda', 'bière', 'vin', 'champagne', 'limonade', 'sirop', 'boisson', 'coca', 'pepsi', 'schweppes', 'orangina', 'café capsule', 'jus de fruit', 'nectar', 'kombucha', 'energy drink'],
  hygiene: ['shampoing', 'shampooing', 'savon', 'gel douche', 'dentifrice', 'brosse à dents', 'déodorant', 'rasoir', 'coton', 'crème visage', 'crème corps', 'parfum', 'maquillage', 'serviette hygiénique', 'tampon', 'protection', 'lingette', 'coton-tige'],
  entretien: ['lessive', 'liquide vaisselle', 'éponge', 'nettoyant', 'désinfectant', 'papier toilette', 'essuie-tout', 'sac poubelle', 'produit ménager', 'javel', 'déboucheur', 'anticalcaire', 'adoucissant', 'tablette lave-vaisselle'],
}

export function detectCategory(name) {
  const lower = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  for (const cat of CATEGORIES.slice(0, -1)) {
    const kws = KEYWORDS[cat.id] ?? []
    const normalized = kws.map(k => k.normalize('NFD').replace(/[\u0300-\u036f]/g, ''))
    if (normalized.some(kw => lower.includes(kw))) return cat.id
  }
  return 'autre'
}

export function getCategoryById(id) {
  return CATEGORIES.find(c => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1]
}
