import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const MESES_CORTO = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export default function Stats() {
  const hoy = new Date()
  const mesActual = hoy.getMonth() + 1
  const anioActual = hoy.getFullYear()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchStats() }, [])

  async function fetchStats() {
    setLoading(true)

    const [
      { data: alumnas },
      { data: pagosHoy },
      { data: todosPagos },
      { data: inscripciones },
      { data: asistencias },
    ] = await Promise.all([
      supabase.from('alumnas').select('id, nombre').eq('activa', true),
      supabase.from('pagos').select('*').eq('periodo_mes', mesActual).eq('periodo_anio', anioActual),
      supabase.from('pagos').select('monto, periodo_mes, periodo_anio').gte('periodo_anio', anioActual - 1),
      supabase.from('inscripciones').select('alumna_id, tipos_clase(nombre)').eq('activa', true),
      supabase.from('asistencias').select('tipo_clase_id, presente, tipos_clase(nombre)')
        .eq('presente', true)
        .gte('fecha_clase', new Date(anioActual, mesActual - 2, 1).toISOString().split('T')[0]),
    ])

    const totalAlumnas = alumnas?.length || 0
    const pagaronEste = pagosHoy?.length || 0
    const recaudadoEste = pagosHoy?.reduce((s, p) => s + parseFloat(p.monto), 0) || 0
    const debenEste = totalAlumnas - pagaronEste

    // Recaudación últimos 6 meses
    const grafico = []
    for (let i = 5; i >= 0; i--) {
      let m = mesActual - i, a = anioActual
      if (m < 1) { m += 12; a-- }
      const total = todosPagos
        ?.filter(p => p.periodo_mes === m && p.periodo_anio === a)
        .reduce((s, p) => s + parseFloat(p.monto), 0) || 0
      grafico.push({ mes: MESES_CORTO[m - 1], total, actual: i === 0 })
    }

    // Alumnas por clase
    const claseMap = {}
    inscripciones?.forEach(ins => {
      const nombre = ins.tipos_clase?.nombre
      if (nombre) claseMap[nombre] = (claseMap[nombre] || 0) + 1
    })
    const porClase = Object.entries(claseMap).sort((a, b) => b[1] - a[1])

    // Asistencia promedio últimas semanas
    const asistMap = {}
    asistencias?.forEach(a => {
      const nombre = a.tipos_clase?.nombre
      if (nombre) asistMap[nombre] = (asistMap[nombre] || 0) + 1
    })

    setData({ totalAlumnas, pagaronEste, recaudadoEste, debenEste, grafico, porClase })
    setLoading(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-48">
      <div className="w-8 h-8 border-2 border-azul border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const { totalAlumnas, pagaronEste, recaudadoEste, debenEste, grafico, porClase } = data

  return (
    <div className="px-4 py-5 flex flex-col gap-4">

      {/* Cards principales */}
      <div className="bg-marino rounded-3xl p-5 text-white">
        <p className="text-white/45 text-xs uppercase tracking-widest font-medium mb-1">
          {MESES_CORTO[mesActual - 1]} {new Date().getFullYear()}
        </p>
        <p className="font-display text-4xl font-bold mb-4">
          ${recaudadoEste.toFixed(0)}
          <span className="text-white/40 text-lg font-normal ml-2">recaudado</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total alumnas', value: totalAlumnas, color: 'text-azul-light' },
            { label: 'Pagaron', value: pagaronEste, color: 'text-emerald-400' },
            { label: 'Deben', value: debenEste, color: 'text-red-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white/8 rounded-2xl p-3 text-center">
              <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-white/45 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Gráfico recaudación */}
      <div className="bg-white rounded-2xl shadow-card p-4">
        <h3 className="font-display font-semibold text-texto mb-4">Recaudación (6 meses)</h3>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={grafico} barSize={28}>
            <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#5a6070' }} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,.12)', fontSize: 13 }}
              formatter={v => [`$${v.toFixed(0)}`, 'Total']}
            />
            <Bar dataKey="total" radius={[6, 6, 0, 0]}>
              {grafico.map((entry, i) => (
                <Cell key={i} fill={entry.actual ? '#3d5afe' : '#e8ecff'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Alumnas por clase */}
      {porClase.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-4">
          <h3 className="font-display font-semibold text-texto mb-3">Alumnas por clase</h3>
          <ul className="flex flex-col gap-2">
            {porClase.map(([nombre, cantidad]) => (
              <li key={nombre} className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-texto">{nombre}</span>
                    <span className="font-bold text-azul">{cantidad}</span>
                  </div>
                  <div className="h-2 bg-azul-pale rounded-full overflow-hidden">
                    <div
                      className="h-full bg-azul rounded-full transition-all"
                      style={{ width: `${(cantidad / (porClase[0][1] || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
