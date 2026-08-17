import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Layout from './components/Layout'
import Login from './pages/Login'
import Hub from './pages/Hub'
import Alumnas from './pages/Alumnas'
import NuevaAlumna from './pages/NuevaAlumna'
import AlumnaDetalle from './pages/AlumnaDetalle'
import PaseLista from './pages/PaseLista'
import Pagos from './pages/Pagos'
import Stats from './pages/Stats'
import Clases from './pages/Clases'
import MisClases from './pages/MisClases'
import Horarios from './pages/Horarios'

function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-marino flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-azul border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!session) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Hub standalone — sin Layout */}
        <Route path="/" element={<ProtectedRoute><Hub /></ProtectedRoute>} />

        {/* Todas las secciones dentro del Layout */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/alumnas"       element={<Alumnas />} />
          <Route path="/alumnas/nueva" element={<NuevaAlumna />} />
          <Route path="/alumnas/:id"   element={<AlumnaDetalle />} />
          <Route path="/pase-lista"    element={<PaseLista />} />
          <Route path="/pagos"         element={<Pagos />} />
          <Route path="/stats"         element={<Stats />} />
          <Route path="/clases"        element={<Clases />} />
          <Route path="/mis-clases"    element={<MisClases />} />
          <Route path="/horarios"      element={<Horarios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
