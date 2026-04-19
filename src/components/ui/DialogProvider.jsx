import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const DialogContext = createContext(null)

export function useDialog() {
  const ctx = useContext(DialogContext)
  if (!ctx) throw new Error('useDialog doit être utilisé dans un <DialogProvider>')
  return ctx
}

export default function DialogProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null) // { title, message, confirmLabel, cancelLabel, variant, resolve }
  const [toasts, setToasts] = useState([]) // [{ id, message, type }]
  const toastIdRef = useRef(0)

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmState({
        title: options.title ?? 'Confirmer ?',
        message: options.message ?? '',
        confirmLabel: options.confirmLabel ?? 'Confirmer',
        cancelLabel: options.cancelLabel ?? 'Annuler',
        variant: options.variant ?? 'default', // 'default' | 'danger'
        resolve
      })
    })
  }, [])

  const toast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  function closeConfirm(result) {
    if (confirmState) confirmState.resolve(result)
    setConfirmState(null)
  }

  // Ferme la modal avec Échap
  useEffect(() => {
    if (!confirmState) return
    function onKey(e) {
      if (e.key === 'Escape') closeConfirm(false)
      else if (e.key === 'Enter') closeConfirm(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [confirmState])

  return (
    <DialogContext.Provider value={{ confirm, toast }}>
      {children}

      {/* --- Modal de confirmation --- */}
      {confirmState && (
        <div
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
          onClick={() => closeConfirm(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-[slideUp_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 space-y-2">
              <h3 className="font-bold text-lg text-gray-900">{confirmState.title}</h3>
              {confirmState.message && (
                <p className="text-sm text-gray-600">{confirmState.message}</p>
              )}
            </div>
            <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => closeConfirm(false)}
                className="flex-1 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition"
              >
                {confirmState.cancelLabel}
              </button>
              <button
                onClick={() => closeConfirm(true)}
                autoFocus
                className={
                  'flex-1 py-2.5 rounded-lg font-medium text-white transition ' +
                  (confirmState.variant === 'danger'
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-brand-500 hover:bg-brand-600')
                }
              >
                {confirmState.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Toasts --- */}
      <div className="fixed top-4 inset-x-0 z-[110] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={
              'pointer-events-auto max-w-sm w-full sm:w-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2 animate-[slideDown_0.2s_ease-out] ' +
              (t.type === 'success'
                ? 'bg-emerald-500 text-white'
                : t.type === 'error'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-800 text-white')
            }
          >
            <span>{t.type === 'success' ? '✓' : t.type === 'error' ? '⚠' : 'ℹ'}</span>
            <span className="flex-1">{t.message}</span>
          </div>
        ))}
      </div>
    </DialogContext.Provider>
  )
}
