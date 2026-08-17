import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const DIA_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIA_ORDER  = [1, 2, 3, 4, 5, 6, 0] // Lun→Dom para UI

function formatTime(t) { return t ? t.slice(0, 5) : '' }

function formatDias(dias) {
  return DIA_ORDER.filter(d => dias.includes(d)).map(d => DIA_LABELS[d]).join(', ')
}

function getMonOffset(year, month) {
  // Offset so Monday is col 0
  return (new Date(year, month, 1).getDay() + 6) % 7
}

export default function Horarios() {
  const hoy = new Date()
  const [viewDate, setViewDate] = useState(new Date(hoy.getFullYear(), hoy.getMonth(), 1))
  const [horarios, setHorarios] = useState([])
  const [tiposClase, setTiposClase] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [deleting, setDeleting] = useState(null)

  // Create form
  const [formTipo, setFormTipo] = useState('')
  const [formDias, setFormDias] = useState([])
  const [formInicio, setFormInicio] = useState('10:00')
  const [formFin, setFormFin]     = useState('11:00')
  const [creating, setCreating]   = useState(false)

  useEffect(() => { fetchData() }, [])

  async function fetchData() {
    const [{ data: h }, { data: tc }] = await Promise.all([
      supabase.from('horarios').select('*, tipos_clase(id, nombre, color)').order('created_at'),
      supabase.from('tipos_clase').select('*').eq('activo', true).order('nombre'),
    ])
    setHorarios(h || [])
    setTiposClase(tc || [])
    if (tc?.length && !formTipo) setFormTipo(tc[0].id)
  }

  async function handleCreate() {
    if (!formTipo || formDias.length === 0 || !formInicio || !formFin) return
    setCreating(true)
    await supabase.from('horarios').insert({
      tipo_clase_id: formTipo,
      dias: formDias,
      hora_inicio: formInicio,
      hora_fin: formFin,
    })
    setCreating(false)
    setShowCreate(false)
    setFormDias([])
    fetchData()
  }

  async function handleDelete(id) {
    setDeleting(id)
    await supabase.from('horarios').delete().eq('id', id)
    setHorarios(prev => prev.filter(h => h.id !== id))
    setDeleting(null)
  }

  function toggleDia(d) {
    setFormDias(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  // Calendar
  const year  = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const offset = getMonOffset(year, month)
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  while (cells.length % 7 !== 0) cells.push(null)

  function horariosForDay(day) {
    if (!day) return []
    const wd = new Date(year, month, day).getDay()
    return horarios.filter(h => h.dias.includes(wd))
  }

  const monthLabel = viewDate.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

  return (
    <div className="px-4 py-5 flex flex-col gap-5">

      {/* Navegador de mes */}
      <div className="bg-marino rounded-2xl flex items-center justify-between px-4 py-3 text-white">
        <button
          onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          className="p-2 active:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <p className="font-display text-base font-bold capitalize">{monthLabel}</p>
        <button
          onClick={() => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          className="p-2 active:bg-white/10 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendario */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        {/* Cabecera días */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d => (
            <div key={d} className="text-center text-[10px] font-bold uppercase tracking-widest text-texto-muted py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            const isToday = day && year === hoy.getFullYear() && month === hoy.getMonth() && day === hoy.getDate()
            const hs = horariosForDay(day)
            return (
              <div
                key={i}
                className={`min-h-[52px] p-1 border-b border-r border-gray-50 flex flex-col items-center ${!day ? 'bg-gray-50/50' : ''}`}
              >
                {day && (
                  <>
                    <span className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full mb-0.5 ${
                      isToday ? 'bg-azul text-white' : 'text-texto-muted'
                    }`}>
                      {day}
                    </span>
                    <div className="flex flex-wrap gap-0.5 justify-center">
                      {hs.map(h => (
                        <div
                          key={h.id}
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: h.tipos_clase?.color || '#3d5afe' }}
                          title={h.tipos_clase?.nombre}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Leyenda de colores */}
      {horarios.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {[...new Map(horarios.map(h => [h.tipo_clase_id, h.tipos_clase])).values()].map(tc => tc && (
            <div key={tc.id} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tc.color }} />
              <span className="text-xs text-texto-muted font-medium">{tc.nombre}</span>
            </div>
          ))}
        </div>
      )}

      {/* Lista de horarios */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-semibold text-texto">Horarios configurados</h3>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-azul text-white text-sm font-semibold px-4 py-1.5 rounded-full active:scale-95 transition-transform shadow-glow"
          >
            + Agregar
          </button>
        </div>

        {horarios.length === 0 ? (
          <div className="text-center py-10 text-texto-muted bg-white rounded-2xl shadow-card">
            <p className="text-3xl mb-3">📅</p>
            <p className="font-medium">Sin horarios configurados</p>
            <p className="text-sm mt-1">Tocá "+ Agregar" para empezar</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-card overflow-hidden">
            <ul>
              {horarios.map((h, i) => (
                <li key={h.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < horarios.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: h.tipos_clase?.color || '#3d5afe' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-texto">{h.tipos_clase?.nombre || '—'}</p>
                    <p className="text-xs text-texto-muted mt-0.5">
                      {formatDias(h.dias)} · {formatTime(h.hora_inicio)} a {formatTime(h.hora_fin)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(h.id)}
                    disabled={deleting === h.id}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1 flex-shrink-0"
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

      {/* Modal crear horario */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm px-4 pb-0">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full max-w-md shadow-lg">
            <div className="px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="font-display text-xl font-bold text-texto">Nuevo horario</h3>
            </div>
            <div className="px-6 py-5 flex flex-col gap-5">

              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-2 block">Tipo de clase</label>
                <select
                  value={formTipo}
                  onChange={e => setFormTipo(e.target.value)}
                  className="w-full border border-azul/15 rounded-2xl px-4 py-3 text-texto text-sm focus:outline-none focus:border-azul"
                >
                  {tiposClase.map(tc => <option key={tc.id} value={tc.id}>{tc.nombre}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-2 block">Días</label>
                <div className="flex gap-2">
                  {DIA_ORDER.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleDia(d)}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        formDias.includes(d)
                          ? 'bg-azul text-white'
                          : 'bg-gray-50 border border-gray-200 text-texto-muted'
                      }`}
                    >
                      {DIA_LABELS[d].slice(0, 2)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-2 block">Desde</label>
                  <input
                    type="time"
                    value={formInicio}
                    onChange={e => setFormInicio(e.target.value)}
                    className="w-full border border-azul/15 rounded-2xl px-4 py-3 text-texto text-sm focus:outline-none focus:border-azul"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-widest font-semibold text-texto-muted mb-2 block">Hasta</label>
                  <input
                    type="time"
                    value={formFin}
                    onChange={e => setFormFin(e.target.value)}
                    className="w-full border border-azul/15 rounded-2xl px-4 py-3 text-texto text-sm focus:outline-none focus:border-azul"
                  />
                </div>
              </div>

            </div>
            <div className="px-6 pb-6 flex gap-3">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-3 border border-gray-200 rounded-2xl text-texto-muted font-semibold">
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !formTipo || formDias.length === 0}
                className="flex-1 py-3 bg-azul text-white rounded-2xl font-semibold shadow-glow active:scale-95 transition-transform disabled:opacity-50"
              >
                {creating ? 'Guardando...' : 'Guardar →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
