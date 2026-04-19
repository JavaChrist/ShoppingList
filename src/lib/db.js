import Dexie from 'dexie'

// Base locale IndexedDB pour le mode offline
export const db = new Dexie('shopping-list-db')

db.version(1).stores({
  lists: 'id, name, owner_id, created_at',
  items: 'id, list_id, name, checked, created_at, updated_at, _pending',
  pendingActions: '++id, type, payload, created_at'
})

/**
 * Ajoute une action en attente de synchronisation
 */
export async function queueAction(type, payload) {
  return db.pendingActions.add({
    type,
    payload,
    created_at: new Date().toISOString()
  })
}

/**
 * Synchronise les actions en attente avec Supabase
 */
export async function syncPendingActions(supabase) {
  const pending = await db.pendingActions.toArray()

  for (const action of pending) {
    try {
      if (action.type === 'add_item') {
        await supabase.from('items').insert(action.payload)
      } else if (action.type === 'update_item') {
        const { id, ...rest } = action.payload
        await supabase.from('items').update(rest).eq('id', id)
      } else if (action.type === 'delete_item') {
        await supabase.from('items').delete().eq('id', action.payload.id)
      }
      await db.pendingActions.delete(action.id)
    } catch (err) {
      console.error('Sync error for action', action, err)
    }
  }
}
