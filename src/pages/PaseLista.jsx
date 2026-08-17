import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function PaseLista() {
  const [tiposClase, setTiposClase] = useState([])
  const [claseId, setClaseId] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [alumnas, setAlumnas] = useState([])
  const [asistencias, setAsistencias] = useState({})
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [guardado, setGuardado] = useState(false)

  useEffect(() => {
    supabase.from('tipos_clase').select('*').eq('activo', true).order('nombre')
      .then(({ data }) => {
        setTiposClase(data || [])
        if (data?.length > 0) setClaseId(data[0].id)
      })
  }, [])

  useEffect(() => {
    if (claseId && fecha) cargarAlumnas()
  }, [claseId, fecha])

  async function cargarAlumnas() {
    setLoading(true)
    setGuardado(false)

    const { data: ins } = await supabase
      .from('inscripciones')
      .select('alumna_id, alumnas(id, nombre)')
      .eq('tipo_clase_id', claseId)
      .eq('activa', true)

    const lista = ins?.map(i => i.alumnas).filter(Boolean) || []
    lista.sort((a, b) => a.nombre.localeCompare(b.nombre))
    setAlumnas(lista)

    // Cargar asistencias ya guardadas
    const ids = lista.map(a => a.id)
    if (ids.length > 0) {
      const { data: ast } = await supabase
        .from('asistencias')
        .select('alumna_id, presente')
        .eq('tipo_clase_id', claseId)
        .eq('fecha_clase', fecha)
        .in('alumna_id', ids)

      const mapa = {}
      lista.forEach(a => { mapa[a.id] = false })
      ast?.forEach(a => { mapa[a.alumna_id] = a.presente })
      setAsistencias(mapa)
    } else {
      setAsistencias({})
    }
    setLoading(false)
  }

  function toggleAsistencia(alumnaId) {
    setAsistencias(prev => ({ ...prev, [alumnaId]: !prev[alumnaId] }))
    setGuardado(false)
  }

  function marcarTodas(valor) {
    const nuevo = {}
    alumnas.forEach(a => { nuevo[a.id] = valor })
    setAsistencias(nuevo)
    setGuardado(false)
  }

  async function guardar() {
    setGuardando(true)
    const { data: { user } } = await supabase.auth.getUser()

    const rows = alumnas.map(a => ({
      user_id: user.id,
      alumna_id: a.id,
      tipo_clase_id: claseId,
      fecha_clase: fecha,
      presente: asistencias[a.id] ?? false,
    }))

    await supabase.from('asistencias').upsert(rows, { onConflict: 'alumna_id,tipo_clase_id,fecha_clase' })
    setGuardando(false)
    setGuardado(true)
  }

  const presentes = Object.values(asistencias).filter(Boolean).length
  const total = alumnas.length

  return (
    <div className="px-4 py-5 flex flex-col gap-4">

      {/* Selectores */}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-1.5 block">Clase</label>
          <select
            value={claseId}
            onChange={e => setClaseId(e.target.value)}
            className="w-full bg-white border border-azul/15 rounded-2xl px-4 py-3 text-texto text-sm shadow-sm focus:outline-none focus:border-azul"
          >
            {tiposClase.map(tc => (
              <option key={tc.id} value={tc.id}>{tc.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-1.5 block">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={e => setFecha(e.target.value)}
            className="w-full bg-white border border-azul/15 rounded-2xl px-4 py-3 text-texto text-sm shadow-sm focus:outline-none focus:border-azul"
          />
        </div>
      </div>

      {/* Checklist */}
      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-7 h-7 border-2 border-azul border-t-transparent rounded-full animate-spin" />
        </div>
      ) : alumnas.length === 0 ? (
        <div className="text-center py-12 text-texto-muted">
          <p className="text-3xl mb-3">📋</p>
          <p className="font-medium">Sin alumnas inscriptas en esta clase</p>
        </div>
      ) : (
        <>
          {/* Header con conteo y acciones rápidas */}
          <div className="flex items-center justify-between">
            <p className="text-texto-muted text-sm">
              <span className="font-bold text-azul text-base">{presentes}</span>/{total} presentes
            </p>
            <div className="flex gap-2">
              <button onClick={() => marcarTodas(true)} className="text-xs font-semibold text-azul bg-azul/10 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                Todas
              </button>
              <button onClick={() => marcarTodas(false)} className="text-xs font-semibold text-texto-muted bg-gray-100 px-3 py-1.5 rounded-full active:scale-95 transition-transform">
                Ninguna
              </button>
            </div>
          </div>

          <ul className="flex flex-col gap-2">
            {alumnas.map(alumna => {
              const presente = asistencias[alumna.id] ?? false
              return (
                <li key={alumna.id}>
                  <button
                    onClick={() => toggleAsistencia(alumna.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all active:scale-[.98] ${
                      presente
                        ? 'bg-emerald-50 border-2 border-emerald-300 shadow-sm'
                        : 'bg-white border-2 border-transparent shadow-card'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      presente ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                    }`}>
                      {presente && (
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <span className={`font-medium flex-1 text-left ${presente ? 'text-emerald-800' : 'text-texto'}`}>
                      {alumna.nombre}
                    </span>
                    <span className={`text-xs font-semibold ${presente ? 'text-emerald-600' : 'text-gray-400'}`}>
                      {presente ? 'Presente' : 'Ausente'}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>

          {/* Guardar */}
          <button
            onClick={guardar}
            disabled={guardando || guardado}
            className={`py-4 rounded-2xl font-semibold text-base transition-all active:scale-95 ${
              guardado
                ? 'bg-emerald-500 text-white'
                : 'bg-azul text-white shadow-glow disabled:opacity-60'
            }`}
          >
            {guardando ? 'Guardando...' : guardado ? '✓ Lista guardada' : 'Guardar lista →'}
          </button>
        </>
      )}
    </div>
  )
}
