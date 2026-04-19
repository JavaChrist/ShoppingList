import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

function EyeIcon({ open }) {
  return open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.477 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
    </svg>
  )
}

export default function Login() {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [info, setInfo] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password)
        if (error) throw error
      } else {
        const { error } = await signUp(email, password)
        if (error) throw error
        setInfo('Compte créé ! Vérifie tes emails si la confirmation est activée.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setError('Entre ton email pour réinitialiser ton mot de passe.')
      return
    }
    setError(null)
    setInfo(null)
    setLoading(true)
    try {
      const { error } = await resetPassword(email)
      if (error) throw error
      setInfo('Email de réinitialisation envoyé ! Vérifie ta boîte mail.')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card w-full max-w-sm p-6" style={{ boxShadow: '0 20px 50px -12px rgba(99, 102, 241, 0.35), 0 8px 20px -8px rgba(0,0,0,0.12)' }}>
        <div className="text-center mb-6">
          <img src="/logo256.png" alt="Logo" className="w-24 h-24 rounded-2xl mb-3 mx-auto shadow-lg" />
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">Ma Liste</h1>
          <p className="text-sm text-gray-500 mt-1">
            {mode === 'signin' ? 'Connexion à ton compte' : 'Crée ton compte'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
            autoComplete="email"
          />

          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input pr-10"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              tabIndex={-1}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
          )}
          {info && (
            <p className="text-sm text-green-700 bg-green-50 p-2 rounded-lg">{info}</p>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? '…' : mode === 'signin' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        {mode === 'signin' && (
          <button
            onClick={handleForgotPassword}
            disabled={loading}
            className="w-full mt-2 text-sm text-gray-500 hover:text-brand-600 hover:underline"
          >
            Mot de passe oublié ?
          </button>
        )}

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null) }}
          className="w-full mt-3 text-sm text-brand-600 hover:underline"
        >
          {mode === 'signin'
            ? 'Pas de compte ? Inscription'
            : 'Déjà un compte ? Connexion'}
        </button>
      </div>
    </div>
  )
}
