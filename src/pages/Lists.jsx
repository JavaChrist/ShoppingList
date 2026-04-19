import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useDialog } from '../components/ui/DialogProvider'
import ShareDialog from '../components/ui/ShareDialog'
import RecipePicker from '../components/recipes/RecipePicker'

export default function Lists() {
  const { user, signOut } = useAuth()
  const { confirm, toast } = useDialog()
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)
  const [newName, setNewName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)
  const [showRecipePicker, setShowRecipePicker] = useState(false)
  const [shareList, setShareList] = useState(null)
  const [error, setError] = useState(null)

  async function loadLists() {
    setLoading(true)
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) setError(error.message)
    else setLists(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadLists()
  }, [])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newName.trim()) return
    const { error } = await supabase
      .from('lists')
      .insert({ name: newName.trim(), owner_id: user.id })
    if (error) setError(error.message)
    else {
      setNewName('')
      loadLists()
    }
  }

  async function handleJoin(e) {
    e.preventDefault()
    if (!joinCode.trim()) return
    const { error } = await supabase.rpc('join_list_by_code', {
      code: joinCode.trim()
    })
    if (error) setError(error.message)
    else {
      setJoinCode('')
      setShowJoin(false)
      loadLists()
    }
  }

  async function handleDelete(id) {
    const ok = await confirm({
      title: 'Supprimer cette liste ?',
      message: 'Cette action est irréversible et supprimera aussi tous ses articles.',
      confirmLabel: 'Supprimer',
      variant: 'danger'
    })
    if (!ok) return
    const { error } = await supabase.from('lists').delete().eq('id', id)
    if (error) {
      setError(error.message)
      toast('Erreur lors de la suppression', 'error')
    } else {
      toast('Liste supprimée')
      loadLists()
    }
  }

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 safe-top safe-bottom">
      <header className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="text-3xl page-title">Mes listes</h1>
          <p className="page-subtitle truncate">{user?.email}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link to="/templates" className="icon-btn text-lg" title="Modèles" aria-label="Modèles">📋</Link>
          <button onClick={signOut} className="icon-btn text-sm" title="Déconnexion" aria-label="Déconnexion">⏻</button>
        </div>
      </header>

      <form onSubmit={handleCreate} className="flex gap-2">
        <input
          className="input flex-1"
          placeholder="Nouvelle liste…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button type="submit" className="btn-primary">
          +
        </button>
      </form>

      <button
        onClick={() => setShowRecipePicker(true)}
        className="w-full btn-accent flex items-center justify-center gap-2"
      >
        🍳 Créer depuis une recette
      </button>

      <button
        onClick={() => setShowJoin((s) => !s)}
        className="w-full text-sm text-white/90 hover:text-white hover:underline font-medium"
      >
        {showJoin ? 'Annuler' : 'Rejoindre une liste avec un code'}
      </button>

      {showJoin && (
        <form onSubmit={handleJoin} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Code d'invitation"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
          />
          <button type="submit" className="btn-primary">
            Rejoindre
          </button>
        </form>
      )}

      {error && (
        <p className="text-sm text-white bg-red-500/90 p-3 rounded-xl shadow-md">{error}</p>
      )}

      {loading ? (
        <p className="text-center text-white/80 py-8 font-medium">Chargement…</p>
      ) : lists.length === 0 ? (
        <div className="card p-6 text-center text-gray-500">
          Aucune liste pour le moment.<br />Crée ta première liste ci-dessus !
        </div>
      ) : (
        <ul className="space-y-2">
          {lists.map((list) => (
            <li key={list.id} className="card p-4 flex items-center justify-between gap-2">
              <Link to={`/lists/${list.id}`} className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{list.name}</h3>
              </Link>
              <button
                onClick={() => setShareList(list)}
                className="text-gray-400 hover:text-brand-600 p-2"
                aria-label="Partager"
                title="Partager la liste"
              >
                📤
              </button>
              {list.owner_id === user.id && (
                <button
                  onClick={() => handleDelete(list.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                  aria-label="Supprimer"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {showRecipePicker && (
        <RecipePicker
          userId={user.id}
          onClose={() => setShowRecipePicker(false)}
          onCreated={() => loadLists()}
        />
      )}

      {shareList && (
        <ShareDialog list={shareList} onClose={() => setShareList(null)} />
      )}
    </div>
  )
}
