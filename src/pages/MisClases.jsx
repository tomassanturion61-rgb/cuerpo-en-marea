import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const TODAY = () => new Date().toISOString().split('T')[0]

function formatFecha(f) {
  if (!f) return null
  return new Date(f + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function isPast(fecha) {
  return fecha && fecha < TODAY()
}

export default function MisClases() {
  const [clases, setClases] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected] = useState(null)
  const [attendanceCounts, setAttendanceCounts] = useState({})
  const [notas, setNotas] = useState('')
  const [notasSaved, setNotasSaved] = useState(false)
  const [filtroAlumna, setFiltroAlumna] = useState('')

  // Create form
  const [tiposClase, setTiposClase] = useState([])
  const [allAlumnas, setAllAlumnas] = useState([])
  const [formTipo, setFormTipo] = useState('')
  const [formAlumnas, setFormAlumnas] = useState([])
  const [formFecha, setFormFecha] = useState(TODAY())
  const [creating, setCreating] = useState(false)

  useEffect(() => { fetchClases() }, [])

  async function fetchClases() {
    setLoading(true)
    const { data } = await supabase
      .from('clases_planificadas')
      .select(`*, tipos_clase(id, nombre, color), clase_alumnas(alumna_id, alumnas(id, nombre))`)
      .order('fecha', { ascending: false, nullsFirst: false })
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
    setFormFecha(TODAY())
    setShowCreate(true)
  }

  async function handleCreate() {
    if (formAlumnas.length === 0) return
    setCreating(true)
    const { data: nueva, error: errInsert } = await supabase
      .from('clases_planificadas')
      .insert({ tipo_clase_id: formTipo || null, notas: '', fecha: formFecha || null })
      .select()
      .single()
    if (errInsert) {
      alert('Error al guardar: ' + errInsert.message)
      setCreating(false)
      return
    }
    const { error: errAlumnas } = await supabase.from('clase_alumnas').insert(
      formAlumnas.map(aid => ({ clase_planificada_id: nueva.id, alumna_id: aid }))
    )
    if (errAlumnas) {
      alert('Error al guardar alumnas: ' + errAlumnas.message)
      setCreating(false)
      return
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

  function getAlumnaNames(clase) {
    const names = clase.clase_alumnas.map(ca => ca.alumnas?.nombre).filter(Boolean)
    if (names.length === 0) return 'Sin alumnas'
    if (names.length <= 2) return names.join(' · ')
    return `${names.slice(0, 2).join(' · ')} y ${names.length - 2} más`
  }

  const today = TODAY()
  const proximas = clases.filter(c => !c.fecha || c.fecha >= today)
  const historial = clases.filter(c => c.fecha && c.fecha < today)

  // Alumnas únicas con historial para el filtro
  const alumnasFiltro = [...new Map(
    historial.flatMap(c => c.clase_alumnas.map(ca => [ca.alumna_id, ca.alumnas]))
  ).entries()]
    .map(([id, a]) => ({ id, nombre: a?.nombre }))
    .filter(a => a.nombre)
    .sort((a, b) => a.nombre.localeCompare(b.nombre))

  const historialFiltrado = filtroAlumna
    ? historial.filter(c => c.clase_alumnas.some(ca => ca.alumna_id === filtroAlumna))
    : historial

  const pasado = selected ? isPast(selected.fecha) : false

  return (
    <div className="px-4 py-5 flex flex-col gap-6 relative">

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-7 h-7 border-2 border-azul border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Próximas / sin fecha */}
          <section>
            <h3 className="font-display font-semibold text-texto mb-3">Próximas</h3>
            {proximas.length === 0 ? (
              <div className="text-center py-10 text-texto-muted bg-white rounded-2xl shadow-card">
                <p className="text-3xl mb-2">📋</p>
                <p className="font-medium text-sm">Sin clases próximas</p>
                <p className="text-xs mt-1">Tocá el + para crear una sesión</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {proximas.map(clase => <ClaseCard key={clase.id} clase={clase} onOpen={openDetalle} getAlumnaNames={getAlumnaNames} />)}
              </ul>
            )}
          </section>

          {/* Historial */}
          {historial.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-semibold text-texto">Historial</h3>
                {alumnasFiltro.length > 1 && (
                  <select
                    value={filtroAlumna}
                    onChange={e => setFiltroAlumna(e.target.value)}
                    className="text-xs border border-azul/20 rounded-full px-3 py-1.5 text-texto-muted focus:outline-none focus:border-azul bg-white"
                  >
                    <option value="">Todas</option>
                    {alumnasFiltro.map(a => <option key={a.id} value={a.id}>{a.nombre}</option>)}
                  </select>
                )}
              </div>
              <ul className="flex flex-col gap-3">
                {historialFiltrado.map(clase => <ClaseCard key={clase.id} clase={clase} onOpen={openDetalle} getAlumnaNames={getAlumnaNames} past />)}
              </ul>
            </section>
          )}
        </>
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
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-lg max-h-[90vh] flex flex-col">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="font-display text-xl font-bold text-texto">Nueva sesión</h3>
            </div>
            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-5">

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-2 block">Tipo de clase</label>
                  <select
                    value={formTipo}
                    onChange={e => setFormTipo(e.target.value)}
                    className="w-full border border-azul/15 rounded-2xl px-4 py-3 text-texto text-sm focus:outline-none focus:border-azul"
                  >
                    <option value="">Sin tipo</option>
                    {tiposClase.map(tc => <option key={tc.id} value={tc.id}>{tc.nombre}</option>)}
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-2 block">Fecha</label>
                  <input
                    type="date"
                    value={formFecha}
                    onChange={e => setFormFecha(e.target.value)}
                    className="w-full border border-azul/15 rounded-2xl px-4 py-3 text-texto text-sm focus:outline-none focus:border-azul"
                  />
                </div>
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
                        formAlumnas.includes(a.id) ? 'bg-azul text-white' : 'bg-gray-50 border border-gray-200 text-texto'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
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
                {creating ? 'Creando...' : 'Crear sesión →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom sheet detalle */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-lg shadow-lg max-h-[90vh] flex flex-col">

            <div className="px-6 pt-5 pb-4 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {selected.tipos_clase && (
                      <span
                        className="text-xs font-semibold px-2.5 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: selected.tipos_clase.color }}
                      >
                        {selected.tipos_clase.nombre}
                      </span>
                    )}
                    {pasado && (
                      <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                        Sesión pasada
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-texto">{getAlumnaNames(selected)}</h3>
                  {selected.fecha && (
                    <p className="text-xs text-texto-muted mt-0.5 capitalize">{formatFecha(selected.fecha)}</p>
                  )}
                </div>
                <button onClick={() => setSelected(null)} className="text-gray-400 p-1 flex-shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-4 flex flex-col gap-5">

              {/* Alumnas */}
              <div>
                <p className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-3">
                  Alumnas{selected.tipos_clase ? ` · ${selected.tipos_clase.nombre}` : ''}
                </p>
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

              {/* Planificación */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs uppercase tracking-widest font-semibold text-texto-muted">
                    Planificación{selected.tipos_clase ? ` — ${selected.tipos_clase.nombre}` : ''}
                  </p>
                  {notasSaved && <span className="text-xs text-emerald-500 font-semibold">Guardado ✓</span>}
                </div>
                <textarea
                  value={notas}
                  onChange={e => { if (!pasado) { setNotas(e.target.value); setNotasSaved(false) } }}
                  onBlur={saveNotas}
                  readOnly={pasado}
                  placeholder={pasado ? 'Sin notas registradas.' : 'Escribí acá qué vas a trabajar en esta clase: ejercicios, secuencia, objetivos...'}
                  rows={6}
                  className={`w-full border rounded-2xl px-4 py-3 text-sm text-texto placeholder-gray-300 focus:outline-none resize-none leading-relaxed ${
                    pasado
                      ? 'border-gray-100 bg-gray-50 text-texto-muted focus:border-gray-100 cursor-default'
                      : 'border-azul/15 bg-white focus:border-azul'
                  }`}
                />
                {pasado && (
                  <p className="text-xs text-texto-muted mt-1.5">Esta sesión ya pasó — las notas son de solo lectura.</p>
                )}
              </div>

            </div>

            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button onClick={deleteClase} className="text-red-400 text-sm font-medium px-4 py-3">
                Eliminar
              </button>
              {!pasado && (
                <button
                  onClick={saveNotas}
                  className="flex-1 py-3 bg-azul text-white rounded-2xl font-semibold shadow-glow active:scale-95 transition-transform"
                >
                  Guardar notas
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ClaseCard({ clase, onOpen, getAlumnaNames, past = false }) {
  return (
    <li>
      <button
        onClick={() => onOpen(clase)}
        className={`w-full rounded-2xl shadow-card p-4 text-left active:scale-[.98] transition-transform ${
          past ? 'bg-gray-50' : 'bg-white'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            {/* Tipo de clase como chip coloreado */}
            {clase.tipos_clase && (
              <span
                className="inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full text-white mb-1.5"
                style={{ backgroundColor: clase.tipos_clase.color }}
              >
                {clase.tipos_clase.nombre}
              </span>
            )}
            <p className={`font-semibold truncate ${past ? 'text-texto-muted' : 'text-texto'}`}>
              {getAlumnaNames(clase)}
            </p>
            {clase.fecha && (
              <p className="text-xs text-texto-muted mt-0.5 capitalize">{formatFecha(clase.fecha)}</p>
            )}
            {clase.notas ? (
              <p className="text-xs text-texto-muted mt-1.5 line-clamp-1 leading-relaxed">{clase.notas}</p>
            ) : !past ? (
              <p className="text-xs text-azul/50 mt-1.5">Sin planificación aún →</p>
            ) : null}
          </div>
          <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </button>
    </li>
  )
}
