import { useState, useEffect, useRef } from 'react'
import { CATEGORIES, detectCategory } from '../../lib/categories'
import { UNITS, parseInput } from '../../lib/units'
import { getSuggestions } from '../../lib/history'

export default function AddItemForm({ onAdd }) {
  const [raw, setRaw] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [unit, setUnit] = useState('unité')
  const [category, setCategory] = useState('autre')
  const [autoDetected, setAutoDetected] = useState(false)
  const [parsedName, setParsedName] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const debounceRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  function handleRawChange(e) {
    const val = e.target.value
    setRaw(val)

    const parsed = parseInput(val)
    setParsedName(parsed.name)
    setQuantity(parsed.quantity)
    setUnit(parsed.unit)

    if (parsed.name.length >= 2) {
      const detected = detectCategory(parsed.name)
      setCategory(detected)
      setAutoDetected(detected !== 'autre')
    } else {
      setCategory('autre')
      setAutoDetected(false)
    }

    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      const results = await getSuggestions(parsed.name || val)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    }, 200)
  }

  function applySuggestion(s) {
    setRaw(s.name)
    setParsedName(s.name)
    setCategory(s.category || 'autre')
    setUnit(s.unit || 'unité')
    setQuantity(1)
    setAutoDetected(false)
    setShowSuggestions(false)
    setSuggestions([])
  }

  function reset() {
    setRaw('')
    setQuantity(1)
    setUnit('unité')
    setCategory('autre')
    setAutoDetected(false)
    setParsedName('')
    setSuggestions([])
    setShowSuggestions(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const name = parsedName || raw.trim()
    if (!name) return
    await onAdd(name, quantity, category, unit === 'unité' ? null : unit)
    reset()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2" ref={containerRef}>
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder='Ex: "2 kg farine" ou "lait"'
            value={raw}
            onChange={handleRawChange}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            className="input w-full shadow-md"
            autoComplete="off"
          />
          {showSuggestions && (
            <ul className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
              {suggestions.map((s) => {
                const cat = CATEGORIES.find(c => c.id === s.category)
                return (
                  <li key={s.name}>
                    <button
                      type="button"
                      onClick={() => applySuggestion(s)}
                      className="w-full flex items-center gap-2 px-3 py-2.5 hover:bg-gray-50 text-left"
                    >
                      <span>{cat?.emoji ?? '📦'}</span>
                      <span className="flex-1 font-medium text-sm">{s.name}</span>
                      {s.unit && s.unit !== 'unité' && (
                        <span className="text-xs text-gray-400">{s.unit}</span>
                      )}
                      <span className="text-xs text-gray-300">×{s.use_count}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
        <button type="submit" className="btn-primary shadow-md px-4" aria-label="Ajouter">+</button>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <input
          type="number"
          min="1"
          step="0.1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="input w-16 text-center text-sm py-1"
          aria-label="Quantité"
        />
        <select
          value={unit}
          onChange={(e) => setUnit(e.target.value)}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-400"
        >
          {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
        </select>
        <span className="text-xs text-gray-300">|</span>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setAutoDetected(false) }}
          className="text-xs border border-gray-200 rounded-lg px-2 py-1 bg-white text-gray-600 focus:outline-none focus:ring-1 focus:ring-brand-400"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.emoji} {cat.name}</option>
          ))}
        </select>
        {autoDetected && <span className="text-xs text-brand-500">✦ auto</span>}
      </div>
    </form>
  )
}
