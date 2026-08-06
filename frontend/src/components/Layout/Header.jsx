import { Bell, User, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from './Layout'
import { useNavigate } from 'react-router-dom'

export default function Header() {
  const { user } = useAuth()
  const { setMobileOpen } = useSidebar()
  const navigate = useNavigate()

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu size={24} />
        </button>
        <h2 className="text-lg font-semibold text-gray-800 hidden sm:block">Panel de Control</h2>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={() => navigate('/alertas')}
          className="relative p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg"
        >
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        <button
          onClick={() => navigate('/perfil')}
          className="flex items-center gap-2 md:gap-3 hover:bg-gray-100 rounded-lg p-1 md:p-2 transition-colors"
        >
          <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
            <User size={18} className="text-primary-600" />
          </div>
          <div className="hidden md:block text-left">
            <p className="text-sm font-medium text-gray-800 leading-tight">{user?.nombre_completo}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.rol}</p>
          </div>
        </button>
      </div>
    </header>
  )
}
