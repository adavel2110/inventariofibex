import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Search } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import Pagination from '../components/Pagination'

export default function Beneficiarios() {
  const [beneficiarios, setBeneficiarios] = useState([])
  const [sedes, setSedes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBeneficiario, setEditingBeneficiario] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const [formData, setFormData] = useState({ cedula: '', nombre_completo: '', email: '', telefono: '', dependencia: '', cargo: '', sede_id: '' })

  useEffect(() => { loadBeneficiarios(); loadSedes() }, [])

  const loadBeneficiarios = async () => {
    try { const res = await api.get('/beneficiarios', { params: { search: searchTerm } }); setBeneficiarios(res.data) }
    catch { toast.error('Error al cargar beneficiarios') }
    finally { setLoading(false) }
  }

  const loadSedes = async () => { try { const res = await api.get('/sedes'); setSedes(res.data) } catch {} }

  const handleSearch = (e) => { e.preventDefault(); loadBeneficiarios() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBeneficiario) { await api.put(`/beneficiarios/${editingBeneficiario.id}`, formData); toast.success('Beneficiario actualizado') }
      else { await api.post('/beneficiarios', formData); toast.success('Beneficiario creado') }
      setShowModal(false); setEditingBeneficiario(null); resetForm(); loadBeneficiarios()
    } catch (error) { toast.error(error.response?.data?.error || 'Error al guardar') }
  }

  const handleEdit = (b) => { setEditingBeneficiario(b); setFormData({ cedula: b.cedula, nombre_completo: b.nombre_completo, email: b.email || '', telefono: b.telefono || '', dependencia: b.dependencia || '', cargo: b.cargo || '', sede_id: b.sede_id || '' }); setShowModal(true) }
  const handleDelete = async (id) => { if (!confirm('¿Desactivar?')) return; try { await api.delete(`/beneficiarios/${id}`); toast.success('Desactivado'); loadBeneficiarios() } catch { toast.error('Error') } }
  const resetForm = () => setFormData({ cedula: '', nombre_completo: '', email: '', telefono: '', dependencia: '', cargo: '', sede_id: '' })

  const filtered = beneficiarios.filter(b => b.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) || b.cedula?.toLowerCase().includes(searchTerm.toLowerCase()))
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Beneficiarios</h1>
        <button onClick={() => { resetForm(); setEditingBeneficiario(null); setShowModal(true) }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={20} /> Nuevo Beneficiario
        </button>
      </div>

      <div className="card">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input type="text" placeholder="Buscar por nombre o cédula..." value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }} className="input-field pl-10" />
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header"><th className="px-4 py-3">Cédula</th><th className="px-4 py-3">Nombre</th><th className="px-4 py-3">Dependencia</th><th className="px-4 py-3">Sede</th><th className="px-4 py-3 text-center">Acciones</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm">{b.cedula}</td>
                  <td className="px-4 py-3 font-medium">{b.nombre_completo}</td>
                  <td className="px-4 py-3 text-gray-500">{b.dependencia || '-'}</td>
                  <td className="px-4 py-3 text-gray-500">{b.sede_nombre || '-'}</td>
                  <td className="px-4 py-3"><div className="flex justify-center gap-2"><button onClick={() => handleEdit(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button><button onClick={() => handleDelete(b.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {paginated.map((b) => (
            <div key={b.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div><p className="font-medium">{b.nombre_completo}</p><p className="text-xs text-gray-500">CI: {b.cedula}</p></div>
                <div className="flex gap-1"><button onClick={() => handleEdit(b)} className="p-2 text-blue-600"><Edit2 size={16} /></button><button onClick={() => handleDelete(b.id)} className="p-2 text-red-600"><Trash2 size={16} /></button></div>
              </div>
              {b.dependencia && <p className="text-xs text-gray-500 mt-1">{b.dependencia} - {b.sede_nombre || ''}</p>}
            </div>
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filtered.length} perPage={perPage} onChangePage={setCurrentPage} onChangePerPage={(v) => { setPerPage(v); setCurrentPage(1) }} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">{editingBeneficiario ? 'Editar' : 'Nuevo'} Beneficiario</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Cédula *</label><input type="text" value={formData.cedula} onChange={(e) => setFormData({ ...formData, cedula: e.target.value })} className="input-field" required /></div>
                <div><label className="label">Nombre Completo *</label><input type="text" value={formData.nombre_completo} onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })} className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="input-field" /></div>
                <div><label className="label">Teléfono</label><input type="text" value={formData.telefono} onChange={(e) => setFormData({ ...formData, telefono: e.target.value })} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Dependencia</label><input type="text" value={formData.dependencia} onChange={(e) => setFormData({ ...formData, dependencia: e.target.value })} className="input-field" /></div>
                <div><label className="label">Cargo</label><input type="text" value={formData.cargo} onChange={(e) => setFormData({ ...formData, cargo: e.target.value })} className="input-field" /></div>
              </div>
              <div><label className="label">Sede</label><select value={formData.sede_id} onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })} className="input-field"><option value="">Seleccionar...</option>{sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editingBeneficiario ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
