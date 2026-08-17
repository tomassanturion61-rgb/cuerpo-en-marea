import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function NuevaAlumna() {
  const [nombre, setNombre] = useState('')
  const [contacto, setContacto] = useState('')
  const [clasesSeleccionadas, setClasesSeleccionadas] = useState([])
  const [frecuencia, setFrecuencia] = useState(null)
  const [monto, setMonto] = useState('')
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0])
  const [tiposClase, setTiposClase] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    supabase.from('tipos_clase').select('*').eq('activo', true).order('nombre')
      .then(({ data }) => setTiposClase(data || []))
  }, [])

  function toggleClase(id) {
    setClasesSeleccionadas(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!nombre.trim()) return
    setLoading(true)
    setError('')

    // Crear alumna
    const { data: alumna, error: errAlumna } = await supabase
      .from('alumnas')
      .insert({ nombre: nombre.trim(), contacto: contacto.trim(), frecuencia_semanal: frecuencia })
      .select()
      .single()

    if (errAlumna) { setError(errAlumna.message); setLoading(false); return }

    // Crear inscripciones
    if (clasesSeleccionadas.length > 0) {
      await supabase.from('inscripciones').insert(
        clasesSeleccionadas.map(tcId => ({ alumna_id: alumna.id, tipo_clase_id: tcId }))
      )
    }

    // Registrar pago inicial si hay monto
    if (monto && parseFloat(monto) > 0) {
      const hoy = new Date(fecha)
      await supabase.from('pagos').insert({
        alumna_id: alumna.id,
        monto: parseFloat(monto),
        fecha,
        periodo_mes: hoy.getMonth() + 1,
        periodo_anio: hoy.getFullYear(),
      })
    }

    setLoading(false)
    navigate(`/alumnas/${alumna.id}`, { replace: true })
  }

  return (
    <div className="px-4 py-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">

        {/* Nombre */}
        <div>
          <label className="label">Nombre completo *</label>
          <input
            type="text"
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="Ej: Florencia García"
            required
            className="input"
          />
        </div>

        {/* Contacto */}
        <div>
          <label className="label">Teléfono / WhatsApp</label>
          <input
            type="text"
            value={contacto}
            onChange={e => setContacto(e.target.value)}
            placeholder="11 1234-5678"
            className="input"
          />
        </div>

        {/* Frecuencia semanal */}
        <div>
          <label className="label">Veces por semana (opcional)</label>
          <div className="flex gap-2 mt-2">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                type="button"
                onClick={() => setFrecuencia(frecuencia === n ? null : n)}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all active:scale-95 ${
                  frecuencia === n
                    ? 'bg-azul text-white shadow-glow'
                    : 'bg-white border border-azul/20 text-texto-muted'
                }`}
              >
                {n}x
              </button>
            ))}
          </div>
        </div>

        {/* Clases */}
        <div>
          <label className="label">Clases a las que se anota</label>
          {tiposClase.length === 0 ? (
            <p className="text-sm text-texto-muted mt-1">
              No hay tipos de clase configurados.{' '}
              <button type="button" onClick={() => navigate('/clases')} className="text-azul underline">
                Agregar clases →
              </button>
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mt-2">
              {tiposClase.map(tc => (
                <button
                  key={tc.id}
                  type="button"
                  onClick={() => toggleClase(tc.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all active:scale-95 ${
                    clasesSeleccionadas.includes(tc.id)
                      ? 'bg-azul text-white shadow-glow'
                      : 'bg-white border border-azul/20 text-texto-muted'
                  }`}
                >
                  {tc.nombre}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Pago inicial */}
        <div className="bg-white rounded-2xl p-4 shadow-card">
          <p className="font-display font-semibold text-texto mb-3">Pago inicial (opcional)</p>
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="label">Monto $</label>
              <input
                type="number"
                value={monto}
                onChange={e => setMonto(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                className="input"
              />
            </div>
            <div className="flex-1">
              <label className="label">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={e => setFecha(e.target.value)}
                className="input"
              />
            </div>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading || !nombre.trim()}
          className="bg-azul text-white font-semibold py-4 rounded-2xl active:scale-95 transition-transform shadow-glow disabled:opacity-50 text-base"
        >
          {loading ? 'Guardando...' : 'Guardar alumna →'}
        </button>
      </form>

      <style>{`
        .label { display:block; font-size:.75rem; text-transform:uppercase; letter-spacing:.1em; font-weight:600; color:#5a6070; margin-bottom:.375rem; }
        .input { width:100%; background:white; border:1px solid rgba(61,90,254,.15); border-radius:1rem; padding:.75rem 1rem; font-size:.95rem; color:#1a1a2e; outline:none; transition:border-color .15s; box-shadow:0 2px 8px rgba(11,27,53,.05); }
        .input:focus { border-color:#3d5afe; }
      `}</style>
    </div>
  )
}
