import { useState, useRef } from 'react'
import { getCategoryById } from '../../lib/categories'
import { getItemEmoji } from '../../lib/itemEmojis'
import { formatQuantity } from '../../lib/units'

export default function ItemRow({ item, onToggle, onDelete, onUpdateNote }) {
  const cat = getCategoryById(item.category)
  const qtyLabel = formatQuantity(item.quantity, item.unit)
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState(item.note || '')
  const longPressTimer = useRef(null)

  function startLongPress() {
    longPressTimer.current = setTimeout(() => setExpanded(e => !e), 500)
  }

  function cancelLongPress() {
    clearTimeout(longPressTimer.current)
  }

  async function saveNote() {
    await onUpdateNote(item, note)
    setExpanded(false)
  }

  return (
    <li>
      <div className="flex items-center gap-3 p-3">
        <button
          onClick={() => onToggle(item)}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition
            ${item.checked
              ? 'bg-brand-500 border-brand-500 text-white'
              : 'border-gray-300 hover:border-brand-500'}`}
          aria-label={item.checked ? 'Décocher' : 'Cocher'}
        >
          {item.checked && (
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <span className="text-lg flex-shrink-0" title={cat.name}>{getItemEmoji(item.name, item.category)}</span>

        <div
          className="flex-1 min-w-0 cursor-pointer select-none"
          onMouseDown={startLongPress}
          onMouseUp={cancelLongPress}
          onMouseLeave={cancelLongPress}
          onTouchStart={startLongPress}
          onTouchEnd={cancelLongPress}
        >
          <p className={`font-medium ${item.checked ? 'line-through text-gray-400' : ''}`}>
            {item.name}
            {item.note && !expanded && (
              <span className="ml-1.5 text-gray-400 text-sm">📝</span>
            )}
          </p>
          {qtyLabel && <p className="text-xs text-gray-500">{qtyLabel}</p>}
          {!expanded && item.note && (
            <p className="text-xs text-gray-400 italic truncate">{item.note}</p>
          )}
        </div>

        <button
          onClick={() => onDelete(item)}
          className="text-gray-400 hover:text-red-500 p-1 flex-shrink-0"
          aria-label="Supprimer"
        >
          ✕
        </button>
      </div>

      {expanded && (
        <div className="px-3 pb-3 flex gap-2">
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ajouter une note…"
            className="input flex-1 text-sm"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && saveNote()}
          />
          <button onClick={saveNote} className="btn-primary text-sm px-3">OK</button>
          <button onClick={() => setExpanded(false)} className="btn-secondary text-sm px-3">✕</button>
        </div>
      )}
    </li>
  )
}
