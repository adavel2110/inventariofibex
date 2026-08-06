import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Building2, Package, Tags, Users,
  Truck, FileText, Bell, Settings, LogOut, UserCircle, ChevronLeft, ChevronRight, ShoppingCart
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from './Layout'

const menuItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/sedes', icon: Building2, label: 'Sedes' },
  { path: '/categorias', icon: Tags, label: 'Categorías' },
  { path: '/articulos', icon: Package, label: 'Artículos' },
  { path: '/stock', icon: Package, label: 'Stock' },
  { path: '/beneficiarios', icon: Users, label: 'Beneficiarios' },
  { path: '/movimientos', icon: Truck, label: 'Movimientos' },
  { path: '/pedidos', icon: ShoppingCart, label: 'Pedidos' },
  { path: '/reportes', icon: FileText, label: 'Reportes' },
  { path: '/alertas', icon: Bell, label: 'Alertas' },
  { path: '/usuarios', icon: Settings, label: 'Usuarios' },
  { path: '/perfil', icon: UserCircle, label: 'Mi Perfil' },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useSidebar()

  const handleNavClick = () => {
    setMobileOpen(false)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex fixed left-0 top-0 h-full bg-fibex-dark text-white flex-col transition-all duration-300 z-40 ${collapsed ? 'w-20' : 'w-64'}`}>
        <div className={`p-4 border-b border-fibex-light flex items-center justify-between ${collapsed ? 'px-2 justify-center' : ''}`}>
          {!collapsed ? (
            <>
              <div>
                <h1 className="text-xl font-bold">FIBEX</h1>
                <p className="text-xs text-gray-400">Sistema de Inventario</p>
              </div>
              <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white transition-colors" title="Retraer menú">
                <ChevronLeft size={20} />
              </button>
            </>
          ) : (
            <button onClick={() => setCollapsed(!collapsed)} className="text-gray-400 hover:text-white transition-colors" title="Expandir menú">
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg transition-colors ${
                      collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
                    } ${
                      isActive
                        ? 'bg-fibex-accent text-white'
                        : 'text-gray-300 hover:bg-fibex-light hover:text-white'
                    }`
                  }
                  title={collapsed ? item.label : ''}
                >
                  <item.icon size={20} />
                  {!collapsed && <span className="text-sm">{item.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-2 border-t border-fibex-light">
          <button
            onClick={logout}
            className={`flex items-center gap-3 w-full rounded-lg text-gray-300 hover:bg-fibex-accent hover:text-white transition-colors ${
              collapsed ? 'justify-center px-2 py-3' : 'px-4 py-3'
            }`}
          >
            <LogOut size={20} />
            {!collapsed && <span className="text-sm">Cerrar Sesión</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 h-full w-64 bg-fibex-dark text-white flex flex-col z-50 transition-transform duration-300 ${
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-fibex-light">
          <h1 className="text-xl font-bold">FIBEX</h1>
          <p className="text-xs text-gray-400">Sistema de Inventario</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  end={item.path === '/'}
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-fibex-accent text-white'
                        : 'text-gray-300 hover:bg-fibex-light hover:text-white'
                    }`
                  }
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-fibex-light">
          <button
            onClick={() => { logout(); setMobileOpen(false) }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-gray-300 hover:bg-fibex-accent hover:text-white transition-colors"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  )
}
