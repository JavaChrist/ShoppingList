import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { getItemEmoji } from '../lib/itemEmojis'
import { useDialog } from '../components/ui/DialogProvider'

export default function Templates() {
  const { confirm, toast } = useDialog()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(null)
  const [newListName, setNewListName] = useState('')
  const [error, setError] = useState(null)

  async function loadTemplates() {
    setLoading(true)
    const { data } = await supabase
      .from('list_templates')
      .select('*')
      .order('created_at', { ascending: false })
    setTemplates(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadTemplates() }, [])

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Supprimer ce modèle ?',
      message: 'Tu pourras toujours en recréer un depuis une liste existante.',
      confirmLabel: 'Supprimer',
      variant: 'danger'
    })
    if (!ok) return
    const { error } = await supabase.from('list_templates').delete().eq('id', id)
    if (error) toast('Erreur lors de la suppression', 'error')
    else {
      toast('Modèle supprimé')
      loadTemplates()
    }
  }

  async function handleCreateFromTemplate(template) {
    setCreating(template.id)
    setNewListName(template.name)
  }

  async function handleConfirmCreate(template) {
    if (!newListName.trim()) return
    setError(null)
    const { data: { user } } = await supabase.auth.getUser()

    const { data: list, error: listErr } = await supabase
      .from('lists')
      .insert({ name: newListName.trim(), owner_id: user.id })
      .select()
      .single()

    if (listErr) { setError(listErr.message); setCreating(null); return }

    const items = (template.items ?? []).map(item => ({
      list_id: list.id,
      name: item.name,
      quantity: item.quantity || 1,
      unit: item.unit || null,
      category: item.category || 'autre',
      added_by: user.id
    }))

    if (items.length > 0) {
      await supabase.from('items').insert(items)
    }

    setCreating(null)
    setNewListName('')
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 safe-top safe-bottom">
      <header className="space-y-3">
        <Link to="/" className="back-btn" aria-label="Retour">
          <span className="text-base leading-none">‹</span>
          <span>Retour</span>
        </Link>
        <h1 className="text-3xl page-title">Mes modèles</h1>
      </header>

      {error && <p className="text-sm text-white bg-red-500/90 p-3 rounded-xl shadow-md">{error}</p>}

      {loading ? (
        <p className="text-center text-white/80 py-8 font-medium">Chargement…</p>
      ) : templates.length === 0 ? (
        <div className="card p-6 text-center text-gray-500">
          Aucun modèle.<br />
          <span className="text-sm">Sauvegarde une liste comme modèle depuis le détail d'une liste.</span>
        </div>
      ) : (
        <ul className="space-y-3">
          {templates.map(t => (
            <li key={t.id} className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{t.name}</h3>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="text-gray-400 hover:text-red-500 p-1 text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-gray-400">
                {(t.items ?? []).map(i => `${getItemEmoji(i.name, i.category)} ${i.name}`).join(' · ') || 'Aucun article'}
              </p>

              {creating === t.id ? (
                <div className="flex gap-2 pt-1">
                  <input
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    className="input flex-1 text-sm"
                    placeholder="Nom de la liste…"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleConfirmCreate(t)}
                  />
                  <button onClick={() => handleConfirmCreate(t)} className="btn-primary text-sm px-3">
                    Créer
                  </button>
                  <button onClick={() => setCreating(null)} className="btn-secondary text-sm px-3">
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleCreateFromTemplate(t)}
                  className="btn-secondary text-sm w-full"
                >
                  Créer une liste depuis ce modèle
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
