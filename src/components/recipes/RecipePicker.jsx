import { useState, useEffect, useMemo } from 'react'
import {
  searchRecipes,
  scaleRecipe,
  createListFromRecipe,
  generateRecipeWithAI
} from '../../lib/recipes'
import { getItemEmoji } from '../../lib/itemEmojis'

export default function RecipePicker({ userId, onClose, onCreated }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)
  const [servings, setServings] = useState(4)
  const [listName, setListName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const results = useMemo(() => searchRecipes(query), [query])

  useEffect(() => {
    if (selected) {
      setServings(selected.servings)
      setListName(selected.name)
    }
  }, [selected])

  const scaled = useMemo(() => {
    if (!selected) return null
    return scaleRecipe(selected, servings)
  }, [selected, servings])

  async function handleGenerateAI() {
    if (!query.trim()) return
    setAiLoading(true)
    setError(null)
    try {
      const generated = await generateRecipeWithAI(query, servings)
      setSelected(generated)
    } catch (err) {
      setError(
        "L'IA n'est pas configurée ou a échoué. Voir docs/AI-SETUP.md. Erreur : " + err.message
      )
    } finally {
      setAiLoading(false)
    }
  }

  async function handleCreate() {
    if (!scaled || !listName.trim()) return
    setBusy(true)
    setError(null)
    try {
      const list = await createListFromRecipe(selected, servings, listName.trim(), userId)
      onCreated && onCreated(list)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl max-h-[92vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-lg">🍳 Créer depuis une recette</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Fermer">
            ✕
          </button>
        </div>

        {!selected ? (
          <>
            <div className="p-4 space-y-3">
              <input
                type="text"
                placeholder="Rechercher… (ex: couscous, pâtes, tajine)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="input w-full"
                autoFocus
              />
              {query.trim() && (
                <button
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                  className="w-full btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  {aiLoading ? '✨ Génération…' : `✨ Générer "${query}" avec IA`}
                </button>
              )}
              {error && (
                <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4">
              {results.length === 0 ? (
                <p className="text-center text-gray-500 py-8 text-sm">
                  Aucune recette trouvée.<br />
                  Essaie un autre terme ou utilise ✨ l'IA.
                </p>
              ) : (
                <ul className="space-y-2">
                  {results.map((r) => (
                    <li key={r.id}>
                      <button
                        onClick={() => setSelected(r)}
                        className="w-full card p-3 flex items-center gap-3 hover:bg-gray-50 text-left"
                      >
                        <span className="text-2xl flex-shrink-0">{r.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{r.name}</p>
                          <p className="text-xs text-gray-500">
                            {r.ingredients.length} ingrédients · {r.servings} pers.
                          </p>
                        </div>
                        <span className="text-gray-300">›</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="p-4 space-y-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{selected.emoji || '🍽️'}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold">{selected.name}</p>
                  <p className="text-xs text-gray-500">
                    {scaled.ingredients.length} ingrédients
                  </p>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-sm text-brand-600 hover:underline"
                >
                  Changer
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-500 flex items-center justify-between">
                  <span>Nombre de personnes</span>
                  <span className="font-semibold text-gray-700">{servings}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                  className="w-full accent-brand-500"
                />
              </div>

              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                className="input w-full"
                placeholder="Nom de la liste"
              />
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              <p className="text-xs text-gray-500 mb-2">Aperçu des articles :</p>
              <ul className="space-y-1">
                {scaled.ingredients.map((ing, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0"
                  >
                    <span>{getItemEmoji(ing.name, ing.category)}</span>
                    <span className="flex-1 text-sm">{ing.name}</span>
                    <span className="text-xs text-gray-500">
                      {ing.quantity} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {error && (
              <p className="mx-4 mb-2 text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
            )}

            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button onClick={onClose} className="btn-secondary flex-1">
                Annuler
              </button>
              <button
                onClick={handleCreate}
                disabled={busy || !listName.trim()}
                className="btn-primary flex-1"
              >
                {busy ? 'Création…' : 'Créer la liste'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
