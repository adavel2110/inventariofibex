import { useState, useEffect } from 'react'
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Perfil() {
  const { user, setUser } = useAuth()
  const [activeTab, setActiveTab] = useState('datos')
  const [loading, setLoading] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)

  const [perfilData, setPerfilData] = useState({
    nombre_completo: '',
    email: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (user) {
      setPerfilData({
        nombre_completo: user.nombre_completo || '',
        email: user.email || ''
      })
    }
  }, [user])

  const handlePerfilSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.put('/auth/profile', perfilData)
      setUser({ ...user, ...res.data })
      toast.success('Perfil actualizado correctamente')
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar perfil')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setLoading(true)
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      toast.success('Contraseña actualizada correctamente')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al cambiar contraseña')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('datos')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'datos'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <User size={18} />
          Datos Personales
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`flex items-center gap-2 px-6 py-3 font-medium border-b-2 transition-colors ${
            activeTab === 'password'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Lock size={18} />
          Cambiar Contraseña
        </button>
      </div>

      {/* Datos Personales */}
      {activeTab === 'datos' && (
        <div className="card">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <User size={32} className="text-primary-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">{user?.nombre_completo}</h2>
              <p className="text-sm text-gray-500 capitalize">Rol: {user?.rol}</p>
              <p className="text-sm text-gray-500">Usuario: {user?.username}</p>
            </div>
          </div>

          <form onSubmit={handlePerfilSubmit} className="space-y-4">
            <div>
              <label className="label">Nombre Completo</label>
              <input
                type="text"
                value={perfilData.nombre_completo}
                onChange={(e) => setPerfilData({ ...perfilData, nombre_completo: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={perfilData.email}
                onChange={(e) => setPerfilData({ ...perfilData, email: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                <Save size={18} />
                {loading ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cambiar Contraseña */}
      {activeTab === 'password' && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-6">Cambiar Contraseña</h3>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="label">Contraseña Actual</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="input-field pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="label">Nueva Contraseña</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  className="input-field pr-10"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Mínimo 6 caracteres</p>
            </div>

            <div>
              <label className="label">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="input-field"
                required
                minLength={6}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
                <Lock size={18} />
                {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
