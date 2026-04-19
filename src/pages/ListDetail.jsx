import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useDialog } from '../components/ui/DialogProvider'
import ShareDialog from '../components/ui/ShareDialog'
import { useRealtimeList } from '../hooks/useRealtimeList'
import AddItemForm from '../components/items/AddItemForm'
import ItemRow from '../components/items/ItemRow'
import FrequentItemsModal from '../components/items/FrequentItemsModal'
import { CATEGORIES, detectCategory } from '../lib/categories'
import { recordUsage } from '../lib/history'

export default function ListDetail() {
  const { listId } = useParams()
  const { user } = useAuth()
  const { confirm, toast } = useDialog()
  const [listInfo, setListInfo] = useState(null)
  const { items, loading, setItems } = useRealtimeList(listId)
  const [showShare, setShowShare] = useState(false)
  const [showFrequent, setShowFrequent] = useState(false)
  const [collapsed, setCollapsed] = useState(new Set())

  useEffect(() => {
    async function loadList() {
      const { data } = await supabase
        .from('lists')
        .select('*')
        .eq('id', listId)
        .single()
      setListInfo(data)
    }
    loadList()
  }, [listId])

  async function handleAdd(name, quantity, category, unit) {
    const cat = category || detectCategory(name)
    const { data, error } = await supabase.from('items').insert({
      list_id: listId,
      name,
      quantity: quantity || 1,
      unit: unit || null,
      category: cat,
      added_by: user.id
    }).select().single()
    if (error) {
      toast('Erreur lors de l\'ajout', 'error')
      return
    }
    // Ajout local immédiat (dédup géré par le hook realtime)
    setItems(prev => prev.some(i => i.id === data.id) ? prev : [...prev, data])
    recordUsage(name, cat, unit)
  }

  async function handleToggle(item) {
    // Optimistic update — UI réagit immédiatement
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, checked: !i.checked } : i
    ))
    const { error } = await supabase.from('items').update({ checked: !item.checked }).eq('id', item.id)
    if (error) {
      // Rollback en cas d'erreur
      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, checked: item.checked } : i
      ))
      toast('Erreur lors de la mise à jour', 'error')
    }
  }

  async function handleDelete(item) {
    // Optimistic update — on retire l'article tout de suite
    const previous = items
    setItems(prev => prev.filter(i => i.id !== item.id))
    const { error } = await supabase.from('items').delete().eq('id', item.id)
    if (error) {
      setItems(previous) // rollback
      toast('Erreur lors de la suppression', 'error')
    }
  }

  async function handleUpdateNote(item, note) {
    setItems(prev => prev.map(i =>
      i.id === item.id ? { ...i, note: note || null } : i
    ))
    const { error } = await supabase.from('items').update({ note: note || null }).eq('id', item.id)
    if (error) {
      setItems(prev => prev.map(i =>
        i.id === item.id ? { ...i, note: item.note } : i
      ))
      toast('Erreur lors de la mise à jour de la note', 'error')
    }
  }

  async function handleClearChecked() {
    const ok = await confirm({
      title: 'Supprimer les articles cochés ?',
      message: `${checkedItems.length} article(s) seront supprimés.`,
      confirmLabel: 'Supprimer',
      variant: 'danger'
    })
    if (!ok) return
    // Optimistic update
    const previous = items
    setItems(prev => prev.filter(i => !i.checked))
    const { error } = await supabase.from('items').delete().eq('list_id', listId).eq('checked', true)
    if (error) {
      setItems(previous)
      toast('Erreur lors de la suppression', 'error')
    } else {
      toast('Articles supprimés')
    }
  }

  async function handleSaveTemplate() {
    const { data: { user } } = await supabase.auth.getUser()
    const templateItems = items.map(({ name, quantity, unit, category }) => ({ name, quantity, unit, category }))
    const { error } = await supabase.from('list_templates').insert({
      user_id: user.id,
      name: listInfo?.name ?? 'Modèle',
      items: templateItems
    })
    if (error) toast('Erreur : ' + error.message, 'error')
    else toast('Modèle sauvegardé !')
  }

  function toggleCollapse(catId) {
    setCollapsed(prev => {
      const next = new Set(prev)
      next.has(catId) ? next.delete(catId) : next.add(catId)
      return next
    })
  }

  const uncheckedItems = items.filter(i => !i.checked)
  const checkedItems = items.filter(i => i.checked)

  const groupedByCategory = CATEGORIES
    .map(cat => ({
      cat,
      items: uncheckedItems.filter(i => (i.category || 'autre') === cat.id)
    }))
    .filter(g => g.items.length > 0)

  return (
    <div className="max-w-md mx-auto p-4 space-y-4 pb-36 safe-top">
      <header className="space-y-3">
        <Link to="/" className="back-btn" aria-label="Retour">
          <span className="text-base leading-none">‹</span>
          <span>Retour</span>
        </Link>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl page-title flex-1 truncate">{listInfo?.name ?? 'Liste'}</h1>
          <button
            onClick={() => setShowFrequent(true)}
            className="icon-btn text-lg"
            title="Mes produits fréquents"
            aria-label="Mes produits"
          >
            ⭐
          </button>
          {listInfo && (
            <button
              onClick={() => setShowShare(true)}
              className="icon-btn text-lg"
              title="Partager la liste"
              aria-label="Partager"
            >
              📤
            </button>
          )}
          <button
            onClick={handleSaveTemplate}
            className="icon-btn text-lg"
            title="Sauvegarder comme modèle"
            aria-label="Modèle"
          >
            📋
          </button>
        </div>
      </header>

      {loading ? (
        <p className="text-center text-white/80 py-8 font-medium">Chargement…</p>
      ) : (
        <>
          {uncheckedItems.length === 0 && checkedItems.length === 0 ? (
            <div className="card p-6 text-center text-gray-500">
              Aucun article.<br />Ajoute-en un ci-dessous !
            </div>
          ) : (
            <>
              {groupedByCategory.map(({ cat, items: catItems }) => {
                const isCollapsed = collapsed.has(cat.id)
                return (
                  <div key={cat.id} className="card overflow-hidden">
                    <button
                      onClick={() => toggleCollapse(cat.id)}
                      className={`w-full flex items-center justify-between px-4 py-2.5 ${cat.color} border-b border-gray-100`}
                    >
                      <span className="flex items-center gap-2 font-semibold text-sm text-gray-700">
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                        <span className="text-xs font-normal text-gray-400">({catItems.length})</span>
                      </span>
                      <span className="text-gray-400 text-xs">{isCollapsed ? '▶' : '▼'}</span>
                    </button>

                    {!isCollapsed && (
                      <ul className="divide-y divide-gray-100">
                        {catItems.map(item => (
                          <ItemRow
                            key={item.id}
                            item={item}
                            onToggle={handleToggle}
                            onDelete={handleDelete}
                            onUpdateNote={handleUpdateNote}
                          />
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}

              {checkedItems.length > 0 && (
                <>
                  <div className="flex items-center justify-between text-sm text-white/90 pt-2 px-1 font-medium">
                    <span>{checkedItems.length} article(s) coché(s)</span>
                    <button onClick={handleClearChecked} className="text-white hover:underline bg-red-500/80 hover:bg-red-500 px-3 py-1 rounded-full text-xs font-semibold">
                      Tout supprimer
                    </button>
                  </div>
                  <ul className="card divide-y divide-gray-100 overflow-hidden opacity-70">
                    {checkedItems.map(item => (
                      <ItemRow
                        key={item.id}
                        item={item}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    ))}
                  </ul>
                </>
              )}
            </>
          )}
        </>
      )}

      <div className="fixed bottom-0 inset-x-0 p-4 safe-bottom bg-gradient-to-t from-black/30 via-black/10 to-transparent backdrop-blur-sm">
        <div className="max-w-md mx-auto">
          <AddItemForm onAdd={handleAdd} />
        </div>
      </div>

      {showShare && listInfo && (
        <ShareDialog list={listInfo} onClose={() => setShowShare(false)} />
      )}

      {showFrequent && (
        <FrequentItemsModal
          existingItems={items}
          onAdd={handleAdd}
          onClose={() => setShowFrequent(false)}
        />
      )}
    </div>
  )
}
