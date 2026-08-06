import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Key, Search } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import Pagination from '../components/Pagination'

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [editingUsuario, setEditingUsuario] = useState(null)
  const [selectedUsuario, setSelectedUsuario] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nombre_completo: '',
    rol: 'operador'
  })
  const [passwordData, setPasswordData] = useState({
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    loadUsuarios()
  }, [])

  const loadUsuarios = async () => {
    try {
      const res = await api.get('/usuarios')
      setUsuarios(res.data)
    } catch (error) {
      toast.error('Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  const filteredUsuarios = usuarios.filter(u =>
    u.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredUsuarios.length / perPage)
  const paginatedUsuarios = filteredUsuarios.slice((currentPage - 1) * perPage, currentPage * perPage)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingUsuario) {
        const { password, ...updateData } = formData
        await api.put(`/usuarios/${editingUsuario.id}`, updateData)
        toast.success('Usuario actualizado correctamente')
      } else {
        await api.post('/usuarios', formData)
        toast.success('Usuario creado correctamente')
      }
      setShowModal(false)
      setEditingUsuario(null)
      resetForm()
      loadUsuarios()
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al guardar usuario')
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (passwordData.password !== passwordData.confirmPassword) {
      toast.error('Las contraseñas no coinciden')
      return
    }
    try {
      await api.put(`/usuarios/${selectedUsuario.id}/password`, {
        password: passwordData.password
      })
      toast.success('Contraseña actualizada correctamente')
      setShowPasswordModal(false)
      setSelectedUsuario(null)
      setPasswordData({ password: '', confirmPassword: '' })
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al actualizar contraseña')
    }
  }

  const handleEdit = (usuario) => {
    setEditingUsuario(usuario)
    setFormData({
      username: usuario.username,
      email: usuario.email,
      password: '',
      nombre_completo: usuario.nombre_completo,
      rol: usuario.rol
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Está seguro de desactivar este usuario?')) return
    try {
      await api.delete(`/usuarios/${id}`)
      toast.success('Usuario desactivado correctamente')
      loadUsuarios()
    } catch (error) {
      toast.error('Error al desactivar usuario')
    }
  }

  const openPasswordModal = (usuario) => {
    setSelectedUsuario(usuario)
    setPasswordData({ password: '', confirmPassword: '' })
    setShowPasswordModal(true)
  }

  const resetForm = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      nombre_completo: '',
      rol: 'operador'
    })
  }

  const openCreateModal = () => {
    setEditingUsuario(null)
    resetForm()
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Usuarios</h1>
        <button onClick={openCreateModal} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={20} />
          Nuevo Usuario
        </button>
      </div>

      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nombre, usuario o email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedUsuarios.map((usuario) => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{usuario.username}</td>
                  <td className="px-4 py-3 font-medium">{usuario.nombre_completo}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{usuario.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.rol === 'admin'
                        ? 'bg-purple-100 text-purple-700'
                        : usuario.rol === 'operador'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                    }`}>
                      {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      usuario.activo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => openPasswordModal(usuario)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Cambiar contraseña">
                        <Key size={16} />
                      </button>
                      <button onClick={() => handleEdit(usuario)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDelete(usuario.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginatedUsuarios.map((usuario) => (
          <div key={usuario.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{usuario.nombre_completo}</p>
                <p className="text-sm text-gray-500">@{usuario.username}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                usuario.rol === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : usuario.rol === 'operador'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700'
              }`}>
                {usuario.rol.charAt(0).toUpperCase() + usuario.rol.slice(1)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{usuario.email}</p>
            <div className="flex justify-between items-center">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                usuario.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {usuario.activo ? 'Activo' : 'Inactivo'}
              </span>
              <div className="flex gap-1">
                <button onClick={() => openPasswordModal(usuario)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg">
                  <Key size={16} />
                </button>
                <button onClick={() => handleEdit(usuario)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => handleDelete(usuario.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredUsuarios.length} perPage={perPage} onChangePage={setCurrentPage} onChangePerPage={(v) => { setPerPage(v); setCurrentPage(1) }} />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">
                {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="label">Username *</label>
                <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="input-field" required disabled={!!editingUsuario} />
              </div>

              <div>
                <label className="label">Email *</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" required />
              </div>

              {!editingUsuario && (
                <div>
                  <label className="label">Contraseña *</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input-field" required minLength={6} />
                </div>
              )}

              <div>
                <label className="label">Nombre Completo *</label>
                <input type="text" value={formData.nombre_completo} onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })} className="input-field" required />
              </div>

              <div>
                <label className="label">Rol *</label>
                <select value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} className="input-field" required>
                  <option value="admin">Administrador</option>
                  <option value="operador">Operador</option>
                  <option value="consulta">Consulta</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editingUsuario ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {showPasswordModal && selectedUsuario && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">
                Contraseña - {selectedUsuario.username}
              </h3>
              <button onClick={() => setShowPasswordModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-4 space-y-4">
              <div>
                <label className="label">Nueva Contraseña *</label>
                <input type="password" value={passwordData.password} onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })} className="input-field" required minLength={6} />
              </div>

              <div>
                <label className="label">Confirmar Contraseña *</label>
                <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} className="input-field" required minLength={6} />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Actualizar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
