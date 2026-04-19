import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/**
 * Hook qui charge et écoute en temps réel les items d'une liste.
 */
export function useRealtimeList(listId) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listId) return

    let mounted = true

    async function loadItems() {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('list_id', listId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('Error loading items', error)
      } else if (mounted) {
        setItems(data ?? [])
      }
      if (mounted) setLoading(false)
    }

    loadItems()

    const channel = supabase
      .channel(`list:${listId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'items',
          filter: `list_id=eq.${listId}`
        },
        (payload) => {
          setItems((prev) => {
            if (payload.eventType === 'INSERT') {
              if (prev.some((i) => i.id === payload.new.id)) return prev
              return [...prev, payload.new]
            }
            if (payload.eventType === 'UPDATE') {
              return prev.map((i) =>
                i.id === payload.new.id ? payload.new : i
              )
            }
            if (payload.eventType === 'DELETE') {
              return prev.filter((i) => i.id !== payload.old.id)
            }
            return prev
          })
        }
      )
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [listId])

  return { items, loading, setItems }
}
