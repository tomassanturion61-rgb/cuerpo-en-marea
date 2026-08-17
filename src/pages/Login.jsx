import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const PASSWORD = '1133573805'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    if (password === PASSWORD) {
      localStorage.setItem('cem_auth', '1')
      navigate('/', { replace: true })
    } else {
      setError('Contraseña incorrecta')
    }
  }

  return (
    <div className="min-h-screen bg-marino flex flex-col items-center justify-center px-6">
      <div className="mb-10 text-center">
        <img
          src="/logo.jpeg"
          alt="Cuerpo en Marea"
          className="w-24 h-24 rounded-full mx-auto mb-4 shadow-lg border-2 border-white/10"
        />
        <h1 className="font-display text-3xl text-white font-bold">Cuerpo en Marea</h1>
        <p className="text-white/45 text-sm mt-1 tracking-wide uppercase font-medium">Gestión de clases</p>
      </div>

      <div className="w-full max-w-sm bg-marino-2 border border-white/10 rounded-3xl p-8 shadow-lg">
        <h2 className="font-display text-white text-xl mb-1">Ingresar</h2>
        <p className="text-white/50 text-sm mb-6">Ingresá la contraseña para entrar.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-white/60 text-xs uppercase tracking-widest font-medium mb-2 block">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              placeholder="••••••••"
              required
              autoFocus
              className="w-full bg-white/8 border border-white/15 rounded-2xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-azul transition-colors"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-azul text-white font-semibold py-3 rounded-2xl active:scale-95 transition-transform shadow-glow"
          >
            Entrar →
          </button>
        </form>
      </div>
    </div>
  )
}
