import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

export default function Pagos() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth() + 1)
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [alumnas, setAlumnas] = useState([])
  const [pagos, setPagos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(null)
  const [monto, setMonto] = useState('')
  const navigate = useNavigate()

  useEffect(() => { fetchData() }, [mes, anio])

  async function fetchData() {
    setLoading(true)
    const [{ data: a }, { data: p }] = await Promise.all([
      supabase.from('alumnas').select('id, nombre').eq('activa', true).order('nombre'),
      supabase.from('pagos').select('*').eq('periodo_mes', mes).eq('periodo_anio', anio),
    ])
    setAlumnas(a || [])
    setPagos(p || [])
    setLoading(false)
  }

  function pagoDe(alumnaId) {
    return pagos.find(p => p.alumna_id === alumnaId)
  }

  async function registrarPago(alumna) {
    if (!monto || parseFloat(monto) <= 0) return
    const { data: { user } } = await supabase.auth.getUser()
    const existing = pagoDe(alumna.id)

    if (existing) {
      await supabase.from('pagos').update({ monto: parseFloat(monto), fecha: hoy.toISOString().split('T')[0] }).eq('id', existing.id)
    } else {
      await supabase.from('pagos').insert({
        user_id: user.id,
        alumna_id: alumna.id,
        monto: parseFloat(monto),
        fecha: hoy.toISOString().split('T')[0],
        periodo_mes: mes,
        periodo_anio: anio,
      })
    }
    setMonto('')
    setShowModal(null)
    fetchData()
  }

  async function eliminarPago(pagoId) {
    await supabase.from('pagos').delete().eq('id', pagoId)
    fetchData()
  }

  function navMes(dir) {
    let m = mes + dir, a = anio
    if (m < 1) { m = 12; a-- }
    if (m > 12) { m = 1; a++ }
    setMes(m); setAnio(a)
  }

  const pagaron = alumnas.filter(a => pagoDe(a.id))
  const deben = alumnas.filter(a => !pagoDe(a.id))
  const totalRecaudado = pagos.reduce((s, p) => s + parseFloat(p.monto), 0)

  return (
    <div className="px-4 py-5 flex flex-col gap-4">

      {/* Navegador de mes */}
      <div className="bg-marino rounded-2xl flex items-center justify-between px-4 py-3 text-white">
        <button onClick={() => navMes(-1)} className="p-2 active:bg-white/10 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="font-display text-lg font-bold capitalize">{MESES[mes - 1]}</p>
          <p className="text-white/50 text-xs">{anio}</p>
        </div>
        <button onClick={() => navMes(1)} className="p-2 active:bg-white/10 rounded-full transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="font-display text-2xl font-bold text-azul">${totalRecaudado.toFixed(0)}</p>
          <p className="text-xs text-texto-muted mt-0.5">Recaudado</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="font-display text-2xl font-bold text-emerald-600">{pagaron.length}</p>
          <p className="text-xs text-texto-muted mt-0.5">Pagaron</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="font-display text-2xl font-bold text-red-500">{deben.length}</p>
          <p className="text-xs text-texto-muted mt-0.5">Deben</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="w-7 h-7 border-2 border-azul border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Alumnas que deben */}
          {deben.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" />
                <h3 className="font-display font-semibold text-texto">Sin pago ({deben.length})</h3>
              </div>
              <ul>
                {deben.map(a => (
                  <li key={a.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                    <button onClick={() => navigate(`/alumnas/${a.id}`)} className="font-medium text-texto text-sm text-left flex-1">
                      {a.nombre}
                    </button>
                    <button
                      onClick={() => { setShowModal(a); setMonto('') }}
                      className="text-xs font-semibold bg-azul/10 text-azul px-3 py-1.5 rounded-full active:scale-95 transition-transform ml-2"
                    >
                      Registrar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alumnas que pagaron */}
          {pagaron.length > 0 && (
            <div className="bg-white rounded-2xl shadow-card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <h3 className="font-display font-semibold text-texto">Pagaron ({pagaron.length})</h3>
              </div>
              <ul>
                {pagaron.map(a => {
                  const p = pagoDe(a.id)
                  return (
                    <li key={a.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                      <button onClick={() => navigate(`/alumnas/${a.id}`)} className="font-medium text-texto text-sm text-left flex-1">
                        {a.nombre}
                      </button>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-emerald-600 text-sm">${parseFloat(p.monto).toFixed(0)}</span>
                        <button onClick={() => eliminarPago(p.id)} className="text-gray-300 hover:text-red-400 transition-colors p-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </>
      )}

      {/* Modal pago */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm px-4 pb-8">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="font-display text-xl font-bold text-texto mb-1">Registrar pago</h3>
            <p className="text-texto-muted text-sm mb-4">{showModal.nombre} · {MESES[mes - 1]} {anio}</p>
            <input
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="Monto $"
              className="w-full border border-azul/20 rounded-2xl px-4 py-3 text-texto text-lg font-semibold focus:outline-none focus:border-azul mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowModal(null)} className="flex-1 py-3 border border-gray-200 rounded-2xl text-texto-muted font-semibold">
                Cancelar
              </button>
              <button onClick={() => registrarPago(showModal)} className="flex-1 py-3 bg-azul text-white rounded-2xl font-semibold shadow-glow active:scale-95 transition-transform">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
