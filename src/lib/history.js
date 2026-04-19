// =========================================================
//  history.js
//  Gestion de l'historique produits et des favoris.
//  La table item_history tracke chaque produit ajouté à une
//  liste avec son use_count et un flag is_favorite épinglable.
// =========================================================

import { supabase } from './supabase'

/**
 * Suggestions d'autocomplete lorsqu'on tape dans le champ "ajouter".
 */
export async function getSuggestions(query) {
  if (!query || query.length < 1) return []
  const { data } = await supabase
    .from('item_history')
    .select('name, category, unit, use_count')
    .ilike('name', `${query}%`)
    .order('use_count', { ascending: false })
    .limit(5)
  return data ?? []
}

/**
 * Enregistre / incrémente un produit dans l'historique utilisateur.
 */
export async function recordUsage(name, category, unit) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('item_history')
    .select('id, use_count')
    .eq('user_id', user.id)
    .eq('name', name)
    .maybeSingle()

  if (existing) {
    await supabase.from('item_history')
      .update({
        use_count: existing.use_count + 1,
        last_used_at: new Date().toISOString(),
        category: category || 'autre',
        unit: unit || null
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('item_history').insert({
      user_id: user.id,
      name,
      category: category || 'autre',
      unit: unit || null,
      use_count: 1,
      last_used_at: new Date().toISOString()
    })
  }
}

/**
 * Récupère les produits "mes produits" :
 * - favoris d'abord (is_favorite = true)
 * - puis triés par use_count décroissant
 * Limite à 30 pour éviter de surcharger le modal.
 */
export async function getFrequentItems(limit = 30) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('item_history')
    .select('id, name, category, unit, use_count, is_favorite')
    .eq('user_id', user.id)
    .order('is_favorite', { ascending: false })
    .order('use_count', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('getFrequentItems error', error)
    return []
  }
  return data ?? []
}

/**
 * Bascule le statut favori d'un produit.
 */
export async function toggleFavorite(id, current) {
  const { error } = await supabase
    .from('item_history')
    .update({ is_favorite: !current })
    .eq('id', id)
  if (error) console.error('toggleFavorite error', error)
  return !current
}

/**
 * Supprime un produit de l'historique (par ex. faute de frappe).
 */
export async function deleteHistoryItem(id) {
  const { error } = await supabase
    .from('item_history')
    .delete()
    .eq('id', id)
  if (error) console.error('deleteHistoryItem error', error)
}
