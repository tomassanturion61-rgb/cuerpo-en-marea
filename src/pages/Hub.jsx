import { useNavigate } from 'react-router-dom'

export default function Hub() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-marino flex flex-col items-center justify-center px-6 py-12">
      <div className="text-center mb-12">
        <img
          src="/logo.jpeg"
          alt="Cuerpo en Marea"
          className="w-24 h-24 rounded-full mx-auto mb-5 shadow-xl border-2 border-white/10 object-cover"
        />
        <h1 className="font-display text-3xl text-white font-bold">Cuerpo en Marea</h1>
        <p className="text-white/40 text-sm mt-1 tracking-widest uppercase font-medium">Panel de gestión</p>
      </div>

      <div className="w-full max-w-sm flex flex-col gap-4 md:max-w-3xl md:grid md:grid-cols-3 md:gap-5">

        <button
          onClick={() => navigate('/alumnas')}
          className="group bg-marino-2 border border-white/10 rounded-3xl p-7 text-left hover:border-azul/40 hover:bg-azul/5 active:scale-[.98] transition-all"
        >
          <div className="w-12 h-12 bg-azul/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-azul/30 transition-colors">
            <svg className="w-6 h-6 text-azul-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="font-display text-white text-xl font-bold mb-1">Gestión de Alumnas</h2>
          <p className="text-white/45 text-sm leading-relaxed">Pagos, asistencia y fichas de alumnas</p>
          <div className="mt-5 text-azul-light text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Abrir <span>→</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/mis-clases')}
          className="group bg-marino-2 border border-white/10 rounded-3xl p-7 text-left hover:border-violet-400/40 hover:bg-violet-500/5 active:scale-[.98] transition-all"
        >
          <div className="w-12 h-12 bg-violet-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-violet-500/30 transition-colors">
            <svg className="w-6 h-6 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h2 className="font-display text-white text-xl font-bold mb-1">Mis Clases</h2>
          <p className="text-white/45 text-sm leading-relaxed">Sesiones planificadas con notas y seguimiento</p>
          <div className="mt-5 text-violet-300 text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Abrir <span>→</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/horarios')}
          className="group bg-marino-2 border border-white/10 rounded-3xl p-7 text-left hover:border-emerald-400/40 hover:bg-emerald-500/5 active:scale-[.98] transition-all"
        >
          <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center mb-5 group-hover:bg-emerald-500/30 transition-colors">
            <svg className="w-6 h-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-white text-xl font-bold mb-1">Horarios</h2>
          <p className="text-white/45 text-sm leading-relaxed">Calendario mensual con clases y horarios fijos</p>
          <div className="mt-5 text-emerald-300 text-sm font-semibold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            Abrir <span>→</span>
          </div>
        </button>

      </div>
    </div>
  )
}
