// =========================================================
//  FrequentItemsModal.jsx
//  Modal "Mes produits" : affiche les favoris épinglés puis
//  les produits les plus utilisés de l'historique.
//  En un tap on ajoute à la liste active. L'étoile ⭐ permet
//  d'épingler/désépingler un produit dans les favoris.
// =========================================================

import { useEffect, useState, useMemo } from 'react'
import { getFrequentItems, toggleFavorite, deleteHistoryItem } from '../../lib/history'
import { getItemEmoji } from '../../lib/itemEmojis'

export default function FrequentItemsModal({ existingItems = [], onAdd, onClose }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [adding, setAdding] = useState(new Set())

  async function load() {
    setLoading(true)
    const data = await getFrequentItems(50)
    setItems(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  // Noms déjà présents dans la liste active (pour griser les déjà ajoutés)
  const existingNames = useMemo(() => {
    return new Set(existingItems.map(i => i.name?.toLowerCase().trim()))
  }, [existingItems])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(i => i.name.toLowerCase().includes(q))
  }, [items, query])

  const favorites = filtered.filter(i => i.is_favorite)
  const others = filtered.filter(i => !i.is_favorite)

  async function handleAdd(item) {
    setAdding(prev => new Set(prev).add(item.id))
    await onAdd(item.name, 1, item.category, item.unit)
    // petite anim puis retire du set
    setTimeout(() => {
      setAdding(prev => {
        const next = new Set(prev)
        next.delete(item.id)
        return next
      })
    }, 600)
  }

  async function handleToggleFav(item, e) {
    e.stopPropagation()
    const newState = await toggleFavorite(item.id, item.is_favorite)
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, is_favorite: newState } : i
    ))
  }

  async function handleDelete(item, e) {
    e.stopPropagation()
    await deleteHistoryItem(item.id)
    setItems(prev => prev.filter(i => i.id !== item.id))
  }

  function renderItem(item) {
    const isAdded = existingNames.has(item.name.toLowerCase().trim())
    const isAdding = adding.has(item.id)

    return (
      <li key={item.id}>
        <button
          onClick={() => !isAdded && handleAdd(item)}
          disabled={isAdded}
          className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 text-left transition ${isAdded ? 'opacity-40' : ''}`}
        >
          <span className="text-xl flex-shrink-0">
            {getItemEmoji(item.name, item.category)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{item.name}</p>
            <p className="text-xs text-gray-400">
              {item.use_count} achat{item.use_count > 1 ? 's' : ''}
              {item.unit ? ` · ${item.unit}` : ''}
            </p>
          </div>
          <button
            onClick={(e) => handleToggleFav(item, e)}
            className="text-xl p-1 flex-shrink-0"
            title={item.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            {item.is_favorite ? '⭐' : '☆'}
          </button>
          <span className={`text-brand-600 font-bold text-lg flex-shrink-0 w-6 text-center ${isAdding ? 'animate-pulse' : ''}`}>
            {isAdded ? '✓' : (isAdding ? '✓' : '+')}
          </span>
        </button>
      </li>
    )
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-lg">⭐ Mes produits</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Fermer">
            ✕
          </button>
        </div>

        <div className="p-3 border-b border-gray-100">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans mes produits…"
            className="input w-full text-sm"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="text-center text-gray-500 py-8 text-sm">Chargement…</p>
          ) : filtered.length === 0 ? (
            <div className="p-6 text-center text-gray-500 text-sm">
              {items.length === 0 ? (
                <>
                  Aucun produit dans ton historique.<br />
                  Ajoute des articles à tes listes pour les retrouver ici.
                </>
              ) : (
                <>Aucun résultat pour "{query}".</>
              )}
            </div>
          ) : (
            <>
              {favorites.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">
                    Favoris
                  </p>
                  <ul className="divide-y divide-gray-100">
                    {favorites.map(renderItem)}
                  </ul>
                </>
              )}
              {others.length > 0 && (
                <>
                  <p className="px-4 pt-3 pb-1 text-xs font-semibold text-gray-400 uppercase">
                    Les plus achetés
                  </p>
                  <ul className="divide-y divide-gray-100">
                    {others.map(renderItem)}
                  </ul>
                </>
              )}
            </>
          )}
        </div>

        <div className="p-3 border-t border-gray-100 text-xs text-gray-400 text-center">
          Tape sur un produit pour l'ajouter · ⭐ pour épingler
        </div>
      </div>
    </div>
  )
}
