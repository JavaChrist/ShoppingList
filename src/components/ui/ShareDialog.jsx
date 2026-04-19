import { useState } from 'react'

/**
 * Modal qui affiche le code d'invitation d'une liste avec un bouton copier.
 * Props:
 *   list : { name, invite_code }
 *   onClose : () => void
 */
export default function ShareDialog({ list, onClose }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(list.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard peut échouer en dev / sans HTTPS
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Liste "${list.name}"`,
          text: `Rejoins ma liste "${list.name}" avec le code : ${list.invite_code}`
        })
      } catch {
        /* l'utilisateur a annulé */
      }
    } else {
      handleCopy()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4 animate-[fadeIn_0.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden animate-[slideUp_0.2s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 space-y-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Partager la liste</h3>
            <p className="text-sm text-gray-500 mt-1">
              Partage ce code pour inviter quelqu'un sur <strong>{list.name}</strong>.
            </p>
          </div>

          <button
            onClick={handleCopy}
            className="w-full bg-brand-50 border-2 border-dashed border-brand-200 rounded-xl py-6 hover:bg-brand-100 transition group"
          >
            <p className="text-3xl font-mono font-bold tracking-[0.25em] text-brand-700">
              {list.invite_code}
            </p>
            <p className="text-xs text-brand-600 mt-2 group-hover:underline">
              {copied ? '✓ Copié dans le presse-papiers' : 'Cliquer pour copier'}
            </p>
          </button>
        </div>

        <div className="flex gap-2 p-3 bg-gray-50 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition"
          >
            Fermer
          </button>
          <button
            onClick={handleShare}
            className="flex-1 py-2.5 rounded-lg font-medium text-white bg-brand-500 hover:bg-brand-600 transition"
          >
            Partager
          </button>
        </div>
      </div>
    </div>
  )
}
