import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import Pagination from '../components/Pagination'

export default function Articulos() {
  const [articulos, setArticulos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingArticulo, setEditingArticulo] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const [formData, setFormData] = useState({ nombre: '', descripcion: '', marca: '', modelo: '', categoria_id: '', unidad_medida: 'Unidad', precio_unitario: '' })

  useEffect(() => { loadArticulos(); loadCategorias() }, [])

  const loadArticulos = async () => {
    try { const res = await api.get('/articulos', { params: { search: searchTerm } }); setArticulos(res.data) }
    catch { toast.error('Error al cargar artículos') }
    finally { setLoading(false) }
  }

  const loadCategorias = async () => { try { const res = await api.get('/categorias'); setCategorias(res.data) } catch {} }

  const handleSearch = (e) => { e.preventDefault(); loadArticulos() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingArticulo) { await api.put(`/articulos/${editingArticulo.id}`, formData); toast.success('Artículo actualizado') }
      else { await api.post('/articulos', formData); toast.success('Artículo creado') }
      setShowModal(false); setEditingArticulo(null); resetForm(); loadArticulos()
    } catch (error) { toast.error(error.response?.data?.error || 'Error al guardar') }
  }

  const handleEdit = (a) => { setEditingArticulo(a); setFormData({ nombre: a.nombre, descripcion: a.descripcion || '', marca: a.marca || '', modelo: a.modelo || '', categoria_id: a.categoria_id || '', unidad_medida: a.unidad_medida || 'Unidad', precio_unitario: a.precio_unitario || '' }); setShowModal(true) }

  const handleDelete = async (id) => { if (!confirm('¿Desactivar?')) return; try { await api.delete(`/articulos/${id}`); toast.success('Desactivado'); loadArticulos() } catch { toast.error('Error') } }

  const resetForm = () => setFormData({ nombre: '', descripcion: '', marca: '', modelo: '', categoria_id: '', unidad_medida: 'Unidad', precio_unitario: '' })

  const filtered = articulos.filter(a => a.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || a.sku?.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Artículos</h1>
        <button onClick={() => { resetForm(); setEditingArticulo(null); setShowModal(true) }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={20} /> Nuevo Artículo
        </button>
      </div>

      <div className="card">
        <form onSubmit={handleSearch} className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar por nombre, SKU o marca..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} className="input-field pl-10" />
          </div>
          <button type="submit" className="btn-primary hidden sm:block">Buscar</button>
        </form>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header"><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Marca</th><th className="px-4 py-3">Categoría</th><th className="px-4 py-3 text-center">Acciones</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{a.sku}</td>
                  <td className="px-4 py-3 font-medium">{a.nombre}</td>
                  <td className="px-4 py-3 text-gray-500">{a.marca || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{a.categoria_nombre || '-'}</td>
                  <td className="px-4 py-3"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(a)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button><button onClick={() => handleDelete(a.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {paginated.map((a) => (
            <div key={a.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div><p className="font-medium">{a.nombre}</p><p className="text-xs text-gray-500 font-mono">{a.sku}</p></div>
                <div className="flex gap-1"><button onClick={() => handleEdit(a)} className="p-2 text-blue-600"><Edit2 size={16} /></button><button onClick={() => handleDelete(a.id)} className="p-2 text-red-600"><Trash2 size={16} /></button></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">{a.marca || ''} {a.modelo || ''} - {a.categoria_nombre || ''}</p>
            </div>
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} perPage={perPage} onChangePage={setCurrentPage} onChangePerPage={(v) => { setPerPage(v); setCurrentPage(1) }} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">{editingArticulo ? 'Editar' : 'Nuevo'} Artículo</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">Nombre *</label><input type="text" value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} className="input-field" required /></div>
              <div><label className="label">Descripción</label><textarea value={formData.descripcion} onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })} className="input-field" rows={2} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Marca</label><input type="text" value={formData.marca} onChange={(e) => setFormData({ ...formData, marca: e.target.value })} className="input-field" /></div>
                <div><label className="label">Modelo</label><input type="text" value={formData.modelo} onChange={(e) => setFormData({ ...formData, modelo: e.target.value })} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Categoría</label><select value={formData.categoria_id} onChange={(e) => setFormData({ ...formData, categoria_id: e.target.value })} className="input-field"><option value="">Seleccionar...</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>
                <div><label className="label">Unidad</label><select value={formData.unidad_medida} onChange={(e) => setFormData({ ...formData, unidad_medida: e.target.value })} className="input-field"><option>Unidad</option><option>Kit</option><option>Par</option><option>Rollo</option><option>Caja</option></select></div>
              </div>
              <div><label className="label">Precio Unitario</label><input type="number" value={formData.precio_unitario} onChange={(e) => setFormData({ ...formData, precio_unitario: e.target.value })} className="input-field" step="0.01" min="0" /></div>
              {editingArticulo && <div className="bg-gray-50 p-3 rounded-lg text-sm"><p className="font-mono">SKU: {editingArticulo.sku}</p><p className="font-mono">Barras: {editingArticulo.codigo_barras}</p><p className="font-mono">QR: {editingArticulo.codigo_qr}</p></div>}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editingArticulo ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
