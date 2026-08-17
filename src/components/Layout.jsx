import { Outlet, useLocation, useNavigate, NavLink } from 'react-router-dom'
import BottomNav from './BottomNav'

const gestionLinks = [
  {
    to: '/alumnas',
    label: 'Alumnas',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    to: '/pase-lista',
    label: 'Pase de lista',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/pagos',
    label: 'Pagos',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    to: '/stats',
    label: 'Estadísticas',
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
]

function SidebarLink({ to, icon, label, end = false }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
          isActive ? 'bg-azul text-white shadow-glow' : 'text-white/55 hover:bg-white/8 hover:text-white'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

function SectionLabel({ label }) {
  return (
    <div className="pt-4 pb-1 px-3">
      <p className="text-white/25 text-[10px] font-bold uppercase tracking-widest">{label}</p>
    </div>
  )
}

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  const isDetail = location.pathname.startsWith('/alumnas/') && location.pathname !== '/alumnas/nueva'
  const isNueva  = location.pathname === '/alumnas/nueva'
  const isClases = location.pathname === '/clases'
  const isMisClases = location.pathname === '/mis-clases'
  const isHorarios  = location.pathname === '/horarios'
  const isNewSection = isMisClases || isHorarios

  const showBack = (isDetail || isNueva || isClases) && !isNewSection

  const title = () => {
    if (location.pathname === '/alumnas')       return 'Alumnas'
    if (location.pathname === '/alumnas/nueva') return 'Nueva alumna'
    if (location.pathname === '/pase-lista')    return 'Pase de lista'
    if (location.pathname === '/pagos')         return 'Pagos'
    if (location.pathname === '/stats')         return 'Estadísticas'
    if (location.pathname === '/clases')        return 'Tipos de clase'
    if (location.pathname === '/mis-clases')    return 'Mis Clases'
    if (location.pathname === '/horarios')      return 'Horarios'
    if (isDetail) return 'Ficha de alumna'
    return 'Cuerpo en Marea'
  }

  return (
    <div className="min-h-screen bg-crema flex">

      {/* Sidebar — solo desktop */}
      <aside className="hidden md:flex flex-col w-56 fixed inset-y-0 left-0 bg-marino z-40 border-r border-white/8">
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-white/8">
          <img src="/logo.jpeg" alt="CM" className="w-9 h-9 rounded-full border border-white/20 object-cover flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-display text-sm font-bold text-white leading-tight">Cuerpo en Marea</p>
            <p className="text-white/40 text-xs mt-0.5">Gestión de clases</p>
          </div>
        </div>

        <nav className="flex-1 p-3 flex flex-col overflow-y-auto">
          {/* Inicio */}
          <SidebarLink
            to="/"
            end
            label="Inicio"
            icon={
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            }
          />

          <SectionLabel label="Gestión" />
          {gestionLinks.map(({ to, label, icon }) => (
            <SidebarLink key={to} to={to} label={label} icon={icon} />
          ))}

          <SectionLabel label="Clases" />
          <SidebarLink
            to="/mis-clases"
            label="Mis Clases"
            icon={
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            }
          />
          <SidebarLink
            to="/horarios"
            label="Horarios"
            icon={
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            }
          />
        </nav>

        {/* Ajustes */}
        <div className="p-3 border-t border-white/8">
          <SidebarLink
            to="/clases"
            label="Tipos de clase"
            icon={
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>
      </aside>

      {/* Área principal */}
      <div className="flex-1 flex flex-col md:ml-56 min-w-0">

        {/* Header */}
        <header className="bg-marino text-white sticky top-0 z-30 shadow-lg safe-top">
          <div className="flex items-center gap-3 px-4 h-14">

            {/* Botón izquierdo */}
            {isNewSection ? (
              // Secciones nuevas: volver al Hub
              <button
                onClick={() => navigate('/')}
                className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors flex-shrink-0"
                title="Inicio"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </button>
            ) : showBack ? (
              // Sub-páginas de gestión: volver atrás
              <button
                onClick={() => navigate(-1)}
                className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            ) : (
              // Home de gestión: logo tappable → Hub
              <button
                onClick={() => navigate('/')}
                className="flex-shrink-0 md:hidden"
              >
                <img src="/logo.jpeg" alt="CM" className="w-8 h-8 rounded-full border border-white/20 object-cover" />
              </button>
            )}

            <h1 className="font-display text-lg font-semibold flex-1 truncate">{title()}</h1>

            {/* Acciones header gestión alumnas */}
            {location.pathname === '/alumnas' && (
              <>
                <button
                  onClick={() => navigate('/alumnas/nueva')}
                  className="bg-azul text-white text-sm font-semibold px-4 py-1.5 rounded-full active:scale-95 transition-transform shadow-glow flex-shrink-0"
                >
                  + Nueva
                </button>
                <button
                  onClick={() => navigate('/clases')}
                  className="p-2 rounded-full active:bg-white/10 transition-colors flex-shrink-0 md:hidden"
                  title="Tipos de clase"
                >
                  <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Contenido */}
        <main className={`flex-1 w-full max-w-2xl md:max-w-3xl mx-auto md:pb-10 ${isNewSection ? 'pb-8' : 'pb-nav'}`}>
          <Outlet />
        </main>

        {/* Bottom nav — solo móvil y solo en sección gestión */}
        {!isNewSection && <BottomNav />}
      </div>
    </div>
  )
}
