import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

function MesAnio(mes, anio) {
  return new Date(anio, mes - 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })
}

export default function AlumnaDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [alumna, setAlumna] = useState(null)
  const [pagos, setPagos] = useState([])
  const [asistencias, setAsistencias] = useState([])
  const [inscripciones, setInscripciones] = useState([])
  const [showPagoModal, setShowPagoModal] = useState(false)
  const [monto, setMonto] = useState('')
  const [loading, setLoading] = useState(true)

  const hoy = new Date()
  const mesActual = hoy.getMonth() + 1
  const anioActual = hoy.getFullYear()

  useEffect(() => { fetchData() }, [id])

  async function fetchData() {
    setLoading(true)
    const [{ data: a }, { data: p }, { data: as_ }, { data: ins }] = await Promise.all([
      supabase.from('alumnas').select('*').eq('id', id).single(),
      supabase.from('pagos').select('*').eq('alumna_id', id).order('fecha', { ascending: false }),
      supabase.from('asistencias').select('*, tipos_clase(nombre)').eq('alumna_id', id).order('fecha_clase', { ascending: false }).limit(30),
      supabase.from('inscripciones').select('*, tipos_clase(nombre, color)').eq('alumna_id', id).eq('activa', true),
    ])
    setAlumna(a)
    setPagos(p || [])
    setAsistencias(as_ || [])
    setInscripciones(ins || [])
    setLoading(false)
  }

  const pagoMes = pagos.some(p => p.periodo_mes === mesActual && p.periodo_anio === anioActual)
  const totalPagado = pagos.reduce((acc, p) => acc + parseFloat(p.monto), 0)

  async function registrarPago() {
    if (!monto || parseFloat(monto) <= 0) return
    const { data: { user } } = await supabase.auth.getUser()
    await supabase.from('pagos').insert({
      user_id: user.id,
      alumna_id: id,
      monto: parseFloat(monto),
      fecha: hoy.toISOString().split('T')[0],
      periodo_mes: mesActual,
      periodo_anio: anioActual,
    })
    setMonto('')
    setShowPagoModal(false)
    fetchData()
  }

  async function darDeBaja() {
    if (!confirm(`¿Dar de baja a ${alumna.nombre}?`)) return
    await supabase.from('alumnas').update({ activa: false }).eq('id', id)
    navigate('/alumnas', { replace: true })
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-azul border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!alumna) return <div className="p-4 text-texto-muted">Alumna no encontrada</div>

  const presentes = asistencias.filter(a => a.presente).length
  const pctAsistencia = asistencias.length > 0 ? Math.round((presentes / asistencias.length) * 100) : null

  return (
    <div className="px-4 py-5 flex flex-col gap-4">

      {/* Card principal */}
      <div className="bg-marino rounded-3xl p-6 text-white">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-azul/30 flex items-center justify-center">
            <span className="font-display text-3xl font-bold text-azul-light">{alumna.nombre.charAt(0)}</span>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold">{alumna.nombre}</h2>
            {alumna.contacto && <p className="text-white/55 text-sm mt-0.5">{alumna.contacto}</p>}
          </div>
        </div>

        {/* Clases */}
        <div className="flex flex-wrap gap-2 mb-4">
          {inscripciones.map(ins => (
            <span key={ins.id} className="bg-azul/30 border border-azul/40 text-azul-light text-xs font-semibold px-3 py-1 rounded-full">
              {ins.tipos_clase?.nombre}
            </span>
          ))}
        </div>

        {/* Estado pago */}
        <div className={`flex items-center justify-between rounded-2xl px-4 py-3 ${pagoMes ? 'bg-emerald-500/20 border border-emerald-400/30' : 'bg-red-500/20 border border-red-400/30'}`}>
          <div>
            <p className="text-xs text-white/60 uppercase tracking-widest">Este mes</p>
            <p className={`font-semibold mt-0.5 ${pagoMes ? 'text-emerald-300' : 'text-red-300'}`}>
              {pagoMes ? '✓ Pagado' : '✗ Sin pago'}
            </p>
          </div>
          {!pagoMes && (
            <button
              onClick={() => setShowPagoModal(true)}
              className="bg-azul text-white text-sm font-semibold px-4 py-2 rounded-full active:scale-95 transition-transform"
            >
              Registrar
            </button>
          )}
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="font-display text-2xl font-bold text-azul">{pagos.length}</p>
          <p className="text-xs text-texto-muted mt-0.5">Pagos</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="font-display text-2xl font-bold text-azul">${totalPagado.toFixed(0)}</p>
          <p className="text-xs text-texto-muted mt-0.5">Total</p>
        </div>
        <div className="bg-white rounded-2xl p-3 shadow-card text-center">
          <p className="font-display text-2xl font-bold text-azul">
            {pctAsistencia !== null ? `${pctAsistencia}%` : '—'}
          </p>
          <p className="text-xs text-texto-muted mt-0.5">Asistencia</p>
        </div>
      </div>

      {/* Historial de pagos */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <h3 className="font-display font-semibold text-texto">Historial de pagos</h3>
          <button onClick={() => setShowPagoModal(true)} className="text-azul text-sm font-semibold">
            + Agregar
          </button>
        </div>
        {pagos.length === 0 ? (
          <p className="text-texto-muted text-sm text-center py-6">Sin pagos registrados</p>
        ) : (
          <ul>
            {pagos.map(p => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-texto capitalize">{MesAnio(p.periodo_mes, p.periodo_anio)}</p>
                  <p className="text-xs text-texto-muted">{new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</p>
                </div>
                <span className="font-semibold text-emerald-600">${parseFloat(p.monto).toFixed(0)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Historial de asistencia */}
      <div className="bg-white rounded-2xl shadow-card overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="font-display font-semibold text-texto">Asistencia reciente</h3>
        </div>
        {asistencias.length === 0 ? (
          <p className="text-texto-muted text-sm text-center py-6">Sin registros de asistencia</p>
        ) : (
          <ul>
            {asistencias.map(a => (
              <li key={a.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-texto">{a.tipos_clase?.nombre}</p>
                  <p className="text-xs text-texto-muted">{new Date(a.fecha_clase + 'T12:00:00').toLocaleDateString('es-AR', { weekday:'short', day:'numeric', month:'short' })}</p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${a.presente ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {a.presente ? 'Presente' : 'Ausente'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dar de baja */}
      <button
        onClick={darDeBaja}
        className="text-red-400 text-sm font-medium text-center py-3"
      >
        Dar de baja a esta alumna
      </button>

      {/* Modal pago */}
      {showPagoModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm px-4 pb-8">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-lg">
            <h3 className="font-display text-xl font-bold text-texto mb-1">Registrar pago</h3>
            <p className="text-texto-muted text-sm mb-4">{alumna.nombre} · {MesAnio(mesActual, anioActual)}</p>
            <input
              type="number"
              value={monto}
              onChange={e => setMonto(e.target.value)}
              placeholder="Monto $"
              className="w-full border border-azul/20 rounded-2xl px-4 py-3 text-texto text-lg font-semibold focus:outline-none focus:border-azul mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button onClick={() => setShowPagoModal(false)} className="flex-1 py-3 border border-gray-200 rounded-2xl text-texto-muted font-semibold">
                Cancelar
              </button>
              <button onClick={registrarPago} className="flex-1 py-3 bg-azul text-white rounded-2xl font-semibold shadow-glow active:scale-95 transition-transform">
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
