import { useState, useEffect } from 'react'
import { Plus, AlertTriangle, Search, X } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import Pagination from '../components/Pagination'

export default function Stock() {
  const [stock, setStock] = useState([])
  const [sedes, setSedes] = useState([])
  const [articulos, setArticulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedSede, setSelectedSede] = useState('')
  const [formData, setFormData] = useState({ articulo_id: '', sede_id: '', cantidad: 0, stock_minimo: 5, stock_maximo: 100, ubicacion: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)

  useEffect(() => { loadStock(); loadSedes(); loadArticulos() }, [])

  const loadStock = async () => { try { const res = await api.get('/stock'); setStock(res.data) } catch { toast.error('Error al cargar stock') } finally { setLoading(false) } }
  const loadSedes = async () => { try { const res = await api.get('/sedes'); setSedes(res.data) } catch {} }
  const loadArticulos = async () => { try { const res = await api.get('/articulos'); setArticulos(res.data) } catch {} }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try { await api.post('/stock', formData); toast.success('Stock actualizado'); setShowModal(false); resetForm(); loadStock() }
    catch (error) { toast.error(error.response?.data?.error || 'Error al guardar') }
  }

  const resetForm = () => setFormData({ articulo_id: '', sede_id: selectedSede || '', cantidad: 0, stock_minimo: 5, stock_maximo: 100, ubicacion: '' })
  const filteredStock = selectedSede ? stock.filter(s => s.sede_id === selectedSede) : stock
  const totalPages = Math.ceil(filteredStock.length / perPage)
  const paginatedStock = filteredStock.slice((currentPage - 1) * perPage, currentPage * perPage)
  const lowStockItems = stock.filter(s => s.cantidad <= s.stock_minimo)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Control de Stock</h1>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={20} /> Actualizar Stock
        </button>
      </div>

      {lowStockItems.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 md:p-4">
          <div className="flex items-center gap-2 text-red-700 mb-2"><AlertTriangle size={18} /><span className="font-semibold text-sm">Stock Bajo ({lowStockItems.length})</span></div>
          <div className="text-xs text-red-600">{lowStockItems.slice(0, 3).map((item, i) => `${item.articulo_nombre}: ${item.cantidad}/${item.stock_minimo}`).join(' | ')}{lowStockItems.length > 3 ? ` +${lowStockItems.length - 3} más` : ''}</div>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Search size={18} className="text-gray-400" />
          <select value={selectedSede} onChange={(e) => { setSelectedSede(e.target.value); setCurrentPage(1) }} className="input-field max-w-xs text-sm">
            <option value="">Todas las sedes</option>
            {sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
          </select>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header"><th className="px-4 py-3">Artículo</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Sede</th><th className="px-4 py-3 text-center">Cant</th><th className="px-4 py-3 text-center">Mín</th><th className="px-4 py-3">Ubicación</th><th className="px-4 py-3 text-center">Estado</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedStock.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-sm">{item.articulo_nombre}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.sku}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{item.sede_nombre}</td>
                  <td className="px-4 py-3 text-center font-semibold">{item.cantidad}</td>
                  <td className="px-4 py-3 text-center text-gray-500">{item.stock_minimo}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{item.ubicacion || '-'}</td>
                  <td className="px-4 py-3 text-center"><span className={`px-2 py-1 rounded-full text-xs font-medium ${item.cantidad <= item.stock_minimo ? 'bg-red-100 text-red-700' : item.cantidad <= item.stock_minimo * 1.5 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{item.cantidad <= item.stock_minimo ? 'Bajo' : item.cantidad <= item.stock_minimo * 1.5 ? 'Medio' : 'OK'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden space-y-3">
          {paginatedStock.map((item) => (
            <div key={item.id} className="border rounded-lg p-3">
              <div className="flex justify-between items-start">
                <div><p className="font-medium text-sm">{item.articulo_nombre}</p><p className="text-xs text-gray-500">{item.sede_nombre}</p></div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${item.cantidad <= item.stock_minimo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{item.cantidad <= item.stock_minimo ? 'Bajo' : 'OK'}</span>
              </div>
              <div className="flex justify-between mt-2 text-xs text-gray-500">
                <span>Cantidad: <strong>{item.cantidad}</strong></span>
                <span>Mínimo: {item.stock_minimo}</span>
                <span>{item.ubicacion || ''}</span>
              </div>
            </div>
          ))}
        </div>
        <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={filteredStock.length} perPage={perPage} onChangePage={setCurrentPage} onChangePerPage={(v) => { setPerPage(v); setCurrentPage(1) }} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">Actualizar Stock</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">Artículo *</label><select value={formData.articulo_id} onChange={(e) => setFormData({ ...formData, articulo_id: e.target.value })} className="input-field" required><option value="">Seleccionar...</option>{articulos.map((a) => <option key={a.id} value={a.id}>{a.nombre} ({a.sku})</option>)}</select></div>
              <div><label className="label">Sede *</label><select value={formData.sede_id} onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })} className="input-field" required><option value="">Seleccionar...</option>{sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="label">Cantidad *</label><input type="number" value={formData.cantidad} onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) })} className="input-field" min="0" required /></div>
                <div><label className="label">Mínimo</label><input type="number" value={formData.stock_minimo} onChange={(e) => setFormData({ ...formData, stock_minimo: parseInt(e.target.value) })} className="input-field" min="0" /></div>
                <div><label className="label">Máximo</label><input type="number" value={formData.stock_maximo} onChange={(e) => setFormData({ ...formData, stock_maximo: parseInt(e.target.value) })} className="input-field" min="0" /></div>
              </div>
              <div><label className="label">Ubicación</label><input type="text" value={formData.ubicacion} onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })} className="input-field" placeholder="Ej: Estante A-3" /></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
