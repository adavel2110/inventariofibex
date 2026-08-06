import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Sedes from './pages/Sedes'
import Categorias from './pages/Categorias'
import Articulos from './pages/Articulos'
import Stock from './pages/Stock'
import Beneficiarios from './pages/Beneficiarios'
import Movimientos from './pages/Movimientos'
import Reportes from './pages/Reportes'
import Usuarios from './pages/Usuarios'
import Alertas from './pages/Alertas'
import Pedidos from './pages/Pedidos'
import Perfil from './pages/Perfil'

function PrivateRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return user?.rol === 'admin' ? children : <Navigate to="/" />
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="sedes" element={<Sedes />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="articulos" element={<Articulos />} />
        <Route path="stock" element={<Stock />} />
        <Route path="beneficiarios" element={<Beneficiarios />} />
        <Route path="movimientos" element={<Movimientos />} />
        <Route path="pedidos" element={<Pedidos />} />
        <Route path="reportes" element={<Reportes />} />
        <Route path="alertas" element={<Alertas />} />
        <Route path="perfil" element={<Perfil />} />
        <Route path="usuarios" element={
          <AdminRoute>
            <Usuarios />
          </AdminRoute>
        } />
      </Route>
    </Routes>
  )
}

export default App
