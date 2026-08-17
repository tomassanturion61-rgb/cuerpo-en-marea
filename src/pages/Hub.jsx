import { useNavigate } from 'react-router-dom'

const sections = [
  {
    to: '/alumnas',
    title: 'Gestión de Alumnas',
    subtitle: 'Pagos, asistencia y fichas de alumnas',
    iconBg: 'bg-azul/20 group-hover:bg-azul/30',
    iconColor: 'text-azul-light',
    border: 'hover:border-azul/40 hover:bg-azul/5',
    arrow: 'text-azul-light',
    icon: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/mis-clases',
    title: 'Mis Clases',
    subtitle: 'Sesiones planificadas con notas y seguimiento',
    iconBg: 'bg-violet-500/20 group-hover:bg-violet-500/30',
    iconColor: 'text-violet-300',
    border: 'hover:border-violet-400/40 hover:bg-violet-500/5',
    arrow: 'text-violet-300',
    icon: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    to: '/horarios',
    title: 'Horarios',
    subtitle: 'Calendario mensual con clases y horarios fijos',
    iconBg: 'bg-emerald-500/20 group-hover:bg-emerald-500/30',
    iconColor: 'text-emerald-300',
    border: 'hover:border-emerald-400/40 hover:bg-emerald-500/5',
    arrow: 'text-emerald-300',
    icon: (
      <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
]

export default function Hub() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-marino flex flex-col items-center justify-center px-5 py-8">

      {/* Brand — más compacto en mobile */}
      <div className="text-center mb-8 md:mb-12">
        <img
          src="/logo.jpeg"
          alt="Cuerpo en Marea"
          className="w-16 h-16 md:w-24 md:h-24 rounded-full mx-auto mb-3 md:mb-5 shadow-xl border-2 border-white/10 object-cover"
        />
        <h1 className="font-display text-2xl md:text-3xl text-white font-bold">Cuerpo en Marea</h1>
        <p className="text-white/40 text-xs md:text-sm mt-1 tracking-widest uppercase font-medium">Panel de gestión</p>
      </div>

      {/* Cards — horizontal en mobile, vertical en desktop */}
      <div className="w-full max-w-sm flex flex-col gap-3 md:max-w-3xl md:grid md:grid-cols-3 md:gap-5">
        {sections.map(s => (
          <button
            key={s.to}
            onClick={() => navigate(s.to)}
            className={`group bg-marino-2 border border-white/10 rounded-2xl md:rounded-3xl active:scale-[.98] transition-all ${s.border}
              /* mobile: horizontal */ flex items-center gap-4 px-4 py-4
              /* desktop: vertical  */ md:flex-col md:items-start md:px-7 md:py-7 md:gap-0`}
          >
            {/* Ícono */}
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center flex-shrink-0 md:mb-5 transition-colors ${s.iconBg}`}>
              <span className={s.iconColor}>{s.icon}</span>
            </div>

            {/* Texto */}
            <div className="flex-1 text-left min-w-0">
              <h2 className="font-display text-white text-base md:text-xl font-bold md:mb-1 leading-tight">{s.title}</h2>
              <p className="text-white/45 text-xs md:text-sm md:leading-relaxed mt-0.5 md:mt-0">{s.subtitle}</p>
            </div>

            {/* Flecha mobile */}
            <svg className={`w-4 h-4 flex-shrink-0 md:hidden ${s.arrow}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>

            {/* "Abrir →" desktop hover */}
            <div className={`hidden md:flex mt-5 text-sm font-semibold items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${s.arrow}`}>
              Abrir <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
