import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

export default function MisClases() {
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)
  const [attendanceCounts, setAttendanceCounts] = useState({})
  const [notas, setNotas] = useState('')
  const [notasSaved, setNotasSaved] = useState(false)

  // Create form
  const [tiposClase, setTiposClase] = useState([])
  const [allAlumnas, setAllAlumnas] = useState([])
  const [formTipo, setFormTipo] = useState('')
  const [formAlumnas, setFormAlumnas] = useState([])
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchClases() }, [])

  async function fetchClases() {
    setLoading(true)
    const { data } = await supabase
      .from('clases_planificadas')
      .select(`*, tipos_clase(id, nombre, color), clase_alumnas(alumna_id, alumnas(id, nombre))`)
      .order('created_at', { ascending: false })
    setClases(data || [])
    setLoading(false)
  }

  async function openCreate() {
    const [{ data: tipos }, { data: alumnas }] = await Promise.all([
      supabase.from('tipos_clase').select('*').eq('activo', true).order('nombre'),
      supabase.from('alumnas').select('id, nombre').eq('activa', true).order('nombre'),
    ])
    setTiposClase(tipos || [])
    setAllAlumnas(alumnas || [])
    setFormTipo(tipos?.[0]?.id || '')
    setFormAlumnas([])
    setShowCreate(true)
  }

  async function handleCreate() {
    if (formAlumnas.length === 0) return
    setCreating(true)
    const { data: nueva, error: errInsert } = await supabase
      .from('clases_planificadas')
      .insert({ tipo_clase_id: formTipo || null, notas: '' })
      .select()
      .single()
    if (errInsert) {
      alert('Error al guardar: ' + errInsert.message)
      setCreating(false)
      return
    }
    if (nueva && formAlumnas.length > 0) {
      const { error: errAlumnas } = await supabase.from('clase_alumnas').insert(
        formAlumnas.map(aid => ({ clase_planificada_id: nueva.id, alumna_id: aid }))
      )
      if (errAlumnas) {
        alert('Error al guardar alumnas: ' + errAlumnas.message)
        setCreating(false)
        return
      }
    }
    setCreating(false)
    setShowCreate(false)
    fetchClases()
  }

  async function openDetalle(clase) {
    setSelected(clase)
    setNotas(clase.notas || '')
    setNotasSaved(false)

    const alumnaIds = clase.clase_alumnas.map(ca => ca.alumna_id)
    if (alumnaIds.length === 0) { setAttendanceCounts({}); return }

    const { data } = await supabase
      .from('asistencias')
      .select('alumna_id')
      .in('alumna_id', alumnaIds)
      .eq('presente', true)

    const counts = {}
    data?.forEach(a => { counts[a.alumna_id] = (counts[a.alumna_id] || 0) + 1 })
    setAttendanceCounts(counts)
  }

  async function saveNotas() {
    if (!selected || notas === selected.notas) return
    await supabase.from('clases_planificadas').update({ notas }).eq('id', selected.id)
    setClases(prev => prev.map(c => c.id === selected.id ? { ...c, notas } : c))
    setSelected(prev => ({ ...prev, notas }))
    setNotasSaved(true)
    setTimeout(() => setNotasSaved(false), 2000)
  }

  async function deleteClase() {
    if (!confirm('¿Eliminar esta clase planificada?')) return
    await supabase.from('clases_planificadas').delete().eq('id', selected.id)
    setSelected(null)
    fetchClases()
  }

  function toggleFormAlumna(id) {
    setFormAlumnas(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id])
  }

  function getTitle(clase) {
    const names = clase.clase_alumnas.map(ca => ca.alumnas?.nombre).filter(Boolean)
    if (names.length === 0) return 'Sin alumnas'
    if (names.length <= 2) return names.join(' · ')
    return `${names.slice(0, 2).join(' · ')} y ${names.length - 2} más`
  }

  return (
    <div className="px-4 py-5 flex flex-col gap-4 relative">

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-azul border-t-transparent rounded-full animate-spin" />
        </div>
      ) : clases.length === 0 ? (
        <div className="text-center py-20 text-texto-muted">
          <p className="text-5xl mb-4">📋</p>
          <p className="font-display text-lg font-semibold text-texto mb-1">Sin clases planificadas</p>
          <p className="text-sm">Tocá el + para crear tu primera sesión</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {clases.map(clase => (
            <li key={clase.id}>
              <button
                onClick={() => openDetalle(clase)}
                className="w-full bg-white rounded-2xl shadow-card p-4 text-left active:scale-[.98] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
                    style={{ backgroundColor: clase.tipos_clase?.color || '#3d5afe' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-texto truncate">{getTitle(clase)}</p>
                    <p className="text-xs text-texto-muted mt-0.5">{clase.tipos_clase?.nombre || 'Sin tipo'}</p>
                    {clase.notas && (
                      <p className="text-sm text-texto-muted mt-2 line-clamp-2 leading-relaxed">{clase.notas}</p>
                    )}
                  </div>
                  <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* FAB */}
      <button
        onClick={openCreate}
        className="fixed bottom-24 right-5 md:bottom-8 w-14 h-14 bg-azul text-white rounded-full shadow-glow flex items-center justify-center active:scale-95 transition-transform z-20 text-2xl font-light"
      >
        +
      </button>

      {/* Modal crear */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-0 md:pb-0">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-lg max-h-[85vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="font-display text-xl font-bold text-texto">Nueva clase planificada</h3>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-5">
              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-2 block">Tipo de clase</label>
                <select
                  value={formTipo}
                  onChange={e => setFormTipo(e.target.value)}
                  className="w-full border border-azul/15 rounded-2xl px-4 py-3 text-texto text-sm focus:outline-none focus:border-azul"
                >
                  <option value="">Sin tipo asignado</option>
                  {tiposClase.map(tc => (
                    <option key={tc.id} value={tc.id}>{tc.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-2 block">
                  Alumnas <span className="text-red-400">*</span>
                </label>
                <div className="flex flex-col gap-2">
                  {allAlumnas.map(a => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => toggleFormAlumna(a.id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all active:scale-[.98] text-left ${
                        formAlumnas.includes(a.id)
                          ? 'bg-azul text-white'
                          : 'bg-gray-50 border border-gray-200 text-texto'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                        formAlumnas.includes(a.id) ? 'border-white bg-white' : 'border-gray-300'
                      }`}>
                        {formAlumnas.includes(a.id) && (
                          <svg className="w-3 h-3 text-azul" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      {a.nombre}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-3 border border-gray-200 rounded-2xl text-texto-muted font-semibold">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || formAlumnas.length === 0}
                className="flex-1 py-3 bg-azul text-white rounded-2xl font-semibold shadow-glow active:scale-95 transition-transform disabled:opacity-50"
              >
                {creating ? 'Creando...' : 'Crear clase →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-lg max-h-[90vh] flex flex-col">

            {/* Header del sheet */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {selected.tipos_clase && (
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: selected.tipos_clase.color }}
                      >
                        {selected.tipos_clase.nombre}
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-texto">{getTitle(selected)}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-1 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-5">

              {/* Alumnas con asistencia */}
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-3">Alumnas</p>
                <div className="flex flex-col gap-2">
                  {selected.clase_alumnas.map(ca => (
                    <div key={ca.alumna_id} className="flex items-center justify-between bg-gray-50 rounded-2xl px-4 py-3">
                      <span className="font-medium text-texto text-sm">{ca.alumnas?.nombre}</span>
                      <span className="text-xs text-texto-muted font-medium">
                        {attendanceCounts[ca.alumna_id] || 0} clases
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notas de planificación */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-widest font-semibold text-texto-muted">Planificación</p>
                  {notasSaved && <span className="text-xs text-emerald-500 font-semibold">Guardado ✓</span>}
                </div>
                <textarea
                  value={notas}
                  onChange={e => { setNotas(e.target.value); setNotasSaved(false) }}
                  onBlur={saveNotas}
                  placeholder="Escribí acá qué vas a trabajar en esta clase: ejercicios, secuencia, objetivos..."
                  rows={6}
                  className="w-full border border-azul/15 rounded-2xl px-4 py-3 text-sm text-texto placeholder-gray-300 focus:outline-none focus:border-azul resize-none leading-relaxed"
                />
              </div>

            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={deleteClase} className="text-red-400 text-sm font-medium px-4 py-3">
                Eliminar
              </button>
              <button
                onClick={saveNotas}
                className="flex-1 py-3 bg-azul text-white rounded-2xl font-semibold shadow-glow active:scale-95 transition-transform"
              >
                Guardar notas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
