import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import BottomNav from './BottomNav'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()

  const isDetail = location.pathname.startsWith('/alumnas/') && location.pathname !== '/alumnas/nueva'
  const isNueva = location.pathname === '/alumnas/nueva'
  const isClases = location.pathname === '/clases'

  const showBack = isDetail || isNueva || isClases

  const title = () => {
    if (location.pathname === '/alumnas') return 'Alumnas'
    if (location.pathname === '/alumnas/nueva') return 'Nueva alumna'
    if (location.pathname === '/pase-lista') return 'Pase de lista'
    if (location.pathname === '/pagos') return 'Pagos'
    if (location.pathname === '/stats') return 'Estadísticas'
    if (location.pathname === '/clases') return 'Tipos de clase'
    if (isDetail) return 'Ficha de alumna'
    return 'Cuerpo en Marea'
  }

  return (
    <div className="min-h-screen flex flex-col bg-crema">
      {/* Header */}
      <header className="bg-marino text-white sticky top-0 z-40 shadow-lg">
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 h-14">
          {showBack ? (
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full active:bg-white/10 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <span className="text-azul-light text-xl">✦</span>
          )}
          <h1 className="font-display text-lg font-semibold flex-1">{title()}</h1>
          {location.pathname === '/alumnas' && (
            <button
              onClick={() => navigate('/alumnas/nueva')}
              className="bg-azul text-white text-sm font-semibold px-4 py-1.5 rounded-full active:scale-95 transition-transform shadow-glow"
            >
              + Nueva
            </button>
          )}
          {location.pathname === '/alumnas' && (
            <button
              onClick={() => navigate('/clases')}
              className="p-2 rounded-full active:bg-white/10 transition-colors"
              title="Tipos de clase"
            >
              <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 pb-nav max-w-lg mx-auto w-full">
        <Outlet />
      </main>

      <BottomNav />
    </div>
  )
}
