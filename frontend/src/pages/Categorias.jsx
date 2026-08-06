import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import Pagination from '../components/Pagination'

export default function Categorias() {
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategoria, setEditingCategoria] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', stock_minimo: 5 })

  useEffect(() => { loadCategorias() }, [])

  const loadCategorias = async () => {
    try { const res = await api.get('/categorias'); setCategorias(res.data) }
    catch { toast.error('Error al cargar categorías') }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingCategoria) { await api.put(`/categorias/${editingCategoria.id}`, formData); toast.success('Categoría actualizada') }
      else { await api.post('/categorias', formData); toast.success('Categoría creada') }
      setShowModal(false); setEditingCategoria(null); resetForm(); loadCategorias()
    } catch (error) { toast.error(error.response?.data?.error || 'Error al guardar') }
  }

  const handleEdit = (cat) => { setEditingCategoria(cat); setFormData({ nombre: cat.nombre, descripcion: cat.descripcion || '', stock_minimo: cat.stock_minimo }); setShowModal(true) }
  const handleDelete = async (id) => { if (!confirm('¿Desactivar?')) return; try { await api.delete(`/categorias/${id}`); toast.success('Desactivada'); loadCategorias() } catch { toast.error('Error') } }
  const resetForm = () => setFormData({ nombre: '', descripcion: '', stock_minimo: 5 })

  const filtered = categorias.filter(c => c.nombre?.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Categorías</h1>
        <button onClick={() => { resetForm(); setEditingCategoria(null); setShowModal(true) }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={20} /> Nueva Categoría
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Buscar categoría..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} className="input-field pl-10" />
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header"><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Descripción</th><th className="px-4 py-3 text-center">Stock Mín.</th><th className="px-4 py-3 text-center">Acciones</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map((cat) => (
                <tr key={cat.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{cat.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{cat.descripcion || '-'}</td>
                  <td className="px-4 py-3 text-center">{cat.stock_minimo}</td>
                  <td className="px-4 py-3"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(cat)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button><button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {paginated.map((cat) => (
            <div key={cat.id} className="border rounded-lg p-3 flex justify-between items-center">
              <div><p className="font-medium">{cat.nombre}</p><p className="text-xs text-gray-500">Stock mín: {cat.stock_minimo}</p></div>
              <div className="flex gap-1"><button onClick={() => handleEdit(cat)} className="p-2 text-blue-600"><Edit2 size={16} /></button><button onClick={() => handleDelete(cat.id)} className="p-2 text-red-600"><Trash2 size={16} /></button></div>
            </div>
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} perPage={perPage} onChangePage={setCurrentPage} onChangePerPage={(v) => { setPerPage(v); setCurrentPage(1) }} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">{editingCategoria ? 'Editar' : 'Nueva'} Categoría</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">Nombre *</label><input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="input-field" required /></div>
              <div><label className="label">Descripción</label><textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="input-field" rows={2} /></div>
              <div><label className="label">Stock Mínimo</label><input type="number" value={formData.stock_minimo} onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) })} className="input-field" min="0" /></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editingCategoria ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
