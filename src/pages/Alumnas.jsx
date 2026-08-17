import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Alumnas() {
  const [alumnas, setAlumnas] = useState([])
  const [inactivas, setInactivas] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [showInactivas, setShowInactivas] = useState(false)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAlumnas()
  }, [])

  async function fetchAlumnas() {
    setLoading(true)
    const { data } = await supabase
      .from('alumnas')
      .select(`
        id, nombre, contacto, activa,
        inscripciones (
          tipos_clase ( nombre, color )
        ),
        pagos ( monto, periodo_mes, periodo_anio )
      `)
      .order('nombre')
    setAlumnas((data || []).filter(a => a.activa))
    setInactivas((data || []).filter(a => !a.activa))
    setLoading(false)
  }

  async function reactivar(alumna) {
    await supabase.from('alumnas').update({ activa: true }).eq('id', alumna.id)
    fetchAlumnas()
  }

  const hoy = new Date()
  const mesActual = hoy.getMonth() + 1
  const anioActual = hoy.getFullYear()

  function pagoMesActual(alumna) {
    return alumna.pagos?.some(p => p.periodo_mes === mesActual && p.periodo_anio === anioActual)
  }

  const filtradas = alumnas.filter(a =>
    a.nombre.toLowerCase().includes(busqueda.toLowerCase())
  )

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-azul border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="px-4 py-5">
      {/* Search */}
      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-texto-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Buscar alumna..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="w-full bg-white border border-azul/15 rounded-2xl pl-9 pr-4 py-3 text-sm text-texto placeholder-texto-muted focus:outline-none focus:border-azul transition-colors shadow-sm"
        />
      </div>

      {/* Count */}
      <p className="text-texto-muted text-xs uppercase tracking-widest font-medium mb-3">
        {filtradas.length} {filtradas.length === 1 ? 'alumna' : 'alumnas'}
      </p>

      {filtradas.length === 0 ? (
        <div className="text-center py-16 text-texto-muted">
          <p className="text-4xl mb-3">🩰</p>
          <p className="font-medium">No hay alumnas todavía</p>
          <p className="text-sm mt-1">Tocá "+ Nueva" para agregar la primera</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {filtradas.map(alumna => {
            const pago = pagoMesActual(alumna)
            const clases = alumna.inscripciones?.map(i => i.tipos_clase?.nombre).filter(Boolean) || []
            return (
              <li key={alumna.id}>
                <button
                  onClick={() => navigate(`/alumnas/${alumna.id}`)}
                  className="w-full bg-white rounded-2xl p-4 shadow-card text-left active:scale-[.98] transition-transform flex items-center gap-4"
                >
                  <div className="w-11 h-11 rounded-full bg-azul/10 flex items-center justify-center flex-shrink-0">
                    <span className="font-display text-azul font-bold text-lg">
                      {alumna.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-texto truncate">{alumna.nombre}</p>
                    {clases.length > 0 && (
                      <p className="text-xs text-texto-muted truncate mt-0.5">{clases.join(' · ')}</p>
                    )}
                  </div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                    pago ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'
                  }`}>
                    {pago ? 'Pagó' : 'Debe'}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {/* Alumnas inactivas */}
      {inactivas.length > 0 && (
        <div className="mt-4">
          <button
            onClick={() => setShowInactivas(v => !v)}
            className="flex items-center gap-2 text-texto-muted text-sm font-medium w-full py-2"
          >
            <svg className={`w-4 h-4 transition-transform ${showInactivas ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Dadas de baja ({inactivas.length})
          </button>

          {showInactivas && (
            <ul className="flex flex-col gap-2 mt-2">
              {inactivas.map(alumna => (
                <li key={alumna.id} className="flex items-center gap-3 bg-white/60 rounded-2xl p-3 border border-gray-200">
                  <button
                    onClick={() => navigate(`/alumnas/${alumna.id}`)}
                    className="flex-1 flex items-center gap-3 text-left"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-gray-400 font-bold">{alumna.nombre.charAt(0).toUpperCase()}</span>
                    </div>
                    <p className="font-medium text-texto-muted text-sm truncate">{alumna.nombre}</p>
                  </button>
                  <button
                    onClick={() => reactivar(alumna)}
                    className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full flex-shrink-0 active:scale-95 transition-transform"
                  >
                    Reactivar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
