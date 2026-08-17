import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const COLORES = ['#3d5afe', '#e91e8c', '#9c27b0', '#00bcd4', '#4caf50', '#ff9800', '#f44336', '#607d8b']

export default function Clases() {
  const navigate = useNavigate()
  const [clases, setClases] = useState([])
  const [nombre, setNombre] = useState('')
  const [color, setColor] = useState(COLORES[0])
  const [loading, setLoading] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [inactivas, setInactivas] = useState([])

  useEffect(() => { fetchClases(); fetchInactivas() }, [])

  async function fetchClases() {
    setLoading(true)
    const { data } = await supabase.from('tipos_clase').select('*').order('nombre')
    setClases(data || [])
    setLoading(false)
  }

  async function agregarClase(e) {
    e.preventDefault()
    if (!nombre.trim()) return
    setGuardando(true)
    await supabase.from('tipos_clase').insert({ nombre: nombre.trim(), color })
    setNombre('')
    setGuardando(false)
    fetchClases()
  }

  async function toggleActivo(clase) {
    await supabase.from('tipos_clase').update({ activo: !clase.activo }).eq('id', clase.id)
    fetchClases()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar este tipo de clase? Si tiene alumnas inscriptas, se desactivará primero.')) return
    await supabase.from('tipos_clase').delete().eq('id', id)
    fetchClases()
  }

  async function fetchInactivas() {
    const { data } = await supabase.from('alumnas').select('id, nombre').eq('activa', false).order('nombre')
    setInactivas(data || [])
  }

  async function reactivarAlumna(id) {
    await supabase.from('alumnas').update({ activa: true }).eq('id', id)
    fetchInactivas()
  }

  async function eliminarAlumna(alumna) {
    if (!confirm(`¿Eliminar a ${alumna.nombre} permanentemente?\n\nSe borrarán TODOS sus datos: pagos, asistencias e inscripciones. Esta acción no se puede deshacer.`)) return
    await supabase.from('alumnas').delete().eq('id', alumna.id)
    fetchInactivas()
  }

  return (
    <div className="px-4 py-5 flex flex-col gap-5">

      {/* Formulario nueva clase */}
      <form onSubmit={agregarClase} className="bg-white rounded-2xl shadow-card p-4">
        <h3 className="font-display font-semibold text-texto mb-3">Nueva clase</h3>
        <input
          type="text"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Ej: Expresión Corporal"
          className="w-full border border-azul/15 rounded-2xl px-4 py-3 text-sm text-texto focus:outline-none focus:border-azul mb-3"
        />
        {/* Selector de color */}
        <div className="flex items-center gap-2 mb-3">
          <p className="text-xs text-texto-muted uppercase tracking-widest font-medium mr-1">Color</p>
          {COLORES.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        <button
          type="submit"
          disabled={guardando || !nombre.trim()}
          className="w-full bg-azul text-white font-semibold py-3 rounded-2xl active:scale-95 transition-transform shadow-glow disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : '+ Agregar clase'}
        </button>
      </form>

      {/* Lista de clases */}
      {loading ? (
        <div className="flex items-center justify-center h-24">
          <div className="w-7 h-7 border-2 border-azul border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clases.length === 0 ? (
        <div className="text-center py-10 text-texto-muted">
          <p className="text-3xl mb-3">🩰</p>
          <p>No hay tipos de clase todavía</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <ul>
            {clases.map((c, i) => (
              <li key={c.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < clases.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: c.color }} />
                <span className={`flex-1 font-medium text-sm ${c.activo ? 'text-texto' : 'text-texto-muted line-through'}`}>
                  {c.nombre}
                </span>
                <button
                  onClick={() => toggleActivo(c)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full transition-colors ${
                    c.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {c.activo ? 'Activa' : 'Inactiva'}
                </button>
                <button onClick={() => eliminar(c.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-xs text-texto-muted text-center">Las clases inactivas no aparecen en el pase de lista ni en inscripciones.</p>

      {/* Alumnas dadas de baja */}
      {inactivas.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-display font-semibold text-texto">Dadas de baja ({inactivas.length})</h3>
            <p className="text-xs text-texto-muted mt-0.5">Reactivá o eliminá permanentemente</p>
          </div>
          <ul>
            {inactivas.map((a, i) => (
              <li key={a.id} className={`flex items-center gap-3 px-4 py-3 ${i < inactivas.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <button
                  onClick={() => navigate(`/alumnas/${a.id}`)}
                  className="flex-1 text-left text-sm font-medium text-texto-muted truncate"
                >
                  {a.nombre}
                </button>
                <button
                  onClick={() => reactivarAlumna(a.id)}
                  className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full flex-shrink-0 active:scale-95 transition-transform"
                >
                  Reactivar
                </button>
                <button
                  onClick={() => eliminarAlumna(a)}
                  className="text-gray-300 hover:text-red-400 active:text-red-500 transition-colors p-1 flex-shrink-0"
                  title="Eliminar permanentemente"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
