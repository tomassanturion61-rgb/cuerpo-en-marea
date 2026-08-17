import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { session } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (session) navigate('/alumnas', { replace: true })
  }, [session, navigate])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin } })
    setLoading(false)
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen bg-marino flex flex-col items-center justify-center px-6">
      {/* Logo area */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-azul/20 border border-azul/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-azul-light text-3xl">✦</span>
        </div>
        <h1 className="font-display text-3xl text-white font-bold">Cuerpo en Marea</h1>
        <p className="text-white/45 text-sm mt-1 tracking-wide uppercase font-medium">Gestión de clases</p>
      </div>

      <div className="w-full max-w-sm bg-marino-2 border border-white/10 rounded-3xl p-8 shadow-lg">
        {!sent ? (
          <>
            <h2 className="font-display text-white text-xl mb-1">Ingresar</h2>
            <p className="text-white/50 text-sm mb-6">Te enviamos un link mágico a tu mail.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-white/60 text-xs uppercase tracking-widest font-medium mb-2 block">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-azul transition-colors"
                />
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="bg-azul text-white font-semibold py-3 rounded-2xl active:scale-95 transition-transform shadow-glow disabled:opacity-60"
              >
                {loading ? 'Enviando...' : 'Enviar link →'}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="font-display text-white text-xl mb-2">¡Revisá tu mail!</h2>
            <p className="text-white/50 text-sm">Te enviamos el link a <strong className="text-white/80">{email}</strong>. Hacé click ahí para entrar.</p>
          </div>
        )}
      </div>
    </div>
  )
}
