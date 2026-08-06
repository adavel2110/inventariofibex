import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import Pagination from '../components/Pagination'

export default function Sedes() {
  const [sedes, setSedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSede, setEditingSede] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const [formData, setFormData] = useState({ nombre: '', direccion: '', ciudad: '', pais: 'Venezuela', telefono: '', responsable: '' })

  useEffect(() => { loadSedes() }, [])

  const loadSedes = async () => {
    try { const res = await api.get('/sedes'); setSedes(res.data) }
    catch { toast.error('Error al cargar sedes') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingSede) { await api.put(`/sedes/${editingSede.id}`, formData); toast.success('Sede actualizada') }
      else { await api.post('/sedes', formData); toast.success('Sede creada') }
      setShowModal(false); setEditingSede(null); resetForm(); loadSedes()
    } catch (error) { toast.error(error.response?.data?.error || 'Error al guardar') }
  }

  const handleEdit = (sede) => {
    setEditingSede(sede)
    setFormData({ nombre: sede.nombre, direccion: sede.direccion || '', ciudad: sede.ciudad || '', pais: sede.pais || 'Venezuela', telefono: sede.telefono || '', responsable: sede.responsable || '' })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar esta sede?')) return
    try { await api.delete(`/sedes/${id}`); toast.success('Sede desactivada'); loadSedes() }
    catch { toast.error('Error al desactivar') }
  }

  const resetForm = () => setFormData({ nombre: '', direccion: '', ciudad: '', pais: 'Venezuela', telefono: '', responsable: '' })

  const filteredSedes = sedes.filter(s => s.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || s.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalPages = Math.ceil(filteredSedes.length / perPage)
  const paginatedSedes = filteredSedes.slice((currentPage - 1) * perPage, currentPage * perPage)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Sedes</h1>
        <button onClick={() => { resetForm(); setEditingSede(null); setShowModal(true) }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={20} /> Nueva Sede
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Buscar sede..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} className="input-field pl-10" />
        </div>

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header"><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Ciudad</th><th className="px-4 py-3">País</th><th className="px-4 py-3">Teléfono</th><th className="px-4 py-3">Responsable</th><th className="px-4 py-3 text-center">Acciones</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedSedes.map((sede) => (
                <tr key={sede.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{sede.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{sede.ciudad || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{sede.pais}</td>
                  <td className="px-4 py-3 text-gray-500">{sede.telefono || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{sede.responsable || '-'}</td>
                  <td className="px-4 py-3"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(sede)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button><button onClick={() => handleDelete(sede.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden space-y-3">
          {paginatedSedes.map((sede) => (
            <div key={sede.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div><p className="font-medium">{sede.nombre}</p><p className="text-sm text-gray-500">{sede.ciudad}, {sede.pais}</p></div>
                <div className="flex gap-1"><button onClick={() => handleEdit(sede)} className="p-2 text-blue-600"><Edit2 size={16} /></button><button onClick={() => handleDelete(sede.id)} className="p-2 text-red-600"><Trash2 size={16} /></button></div>
              </div>
              {sede.telefono && <p className="text-xs text-gray-500 mt-1">Tel: {sede.telefono}</p>}
            </div>
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredSedes.length} perPage={perPage} onChangePage={setCurrentPage} onChangePerPage={(v) => { setPerPage(v); setCurrentPage(1) }} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">{editingSede ? 'Editar Sede' : 'Nueva Sede'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">Nombre *</label><input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="input-field" required /></div>
              <div><label className="label">Dirección</label><input type="text" value={formData.direccion} onChange={(e) => setFormData({ ...formData, direccion: e.target.value })} className="input-field" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Ciudad</label><input type="text" value={formData.ciudad} onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })} className="input-field" /></div>
                <div><label className="label">País</label><input type="text" value={formData.pais} onChange={(e) => setFormData({ ...formData, pais: e.target.value })} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Teléfono</label><input type="text" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="input-field" /></div>
                <div><label className="label">Responsable</label><input type="text" value={formData.responsable} onChange={(e) => setFormData({ ...formData, responsable: e.target.value })} className="input-field" /></div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editingSede ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
