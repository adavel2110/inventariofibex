import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Search, Eye, CheckCircle, Package } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Pagination from '../components/Pagination'

export default function Pedidos() {
  const [pedidos, setPedidos] = useState([])
  const [sedes, setSedes] = useState([])
  const [articulos, setArticulos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPedido, setSelectedPedido] = useState(null)
  const [editingPedido, setEditingPedido] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({ estado: '', sede_id: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)

  const [formData, setFormData] = useState({
    numero_pedido: '',
    recibe: '',
    fecha_pedido: format(new Date(), 'yyyy-MM-dd'),
    fecha_ingreso: format(new Date(), 'yyyy-MM-dd'),
    proveedor: '',
    observaciones: '',
    sede_id: '',
    detalles: [{ articulo_id: '', cantidad_solicitada: 1, cantidad_recibida: 0, precio_unitario: '', observaciones: '' }]
  })

  useEffect(() => { loadPedidos(); loadSedes(); loadArticulos() }, [])

  const loadPedidos = async () => {
    try { const res = await api.get('/pedidos', { params: { ...filters, search: searchTerm } }); setPedidos(res.data) }
    catch { toast.error('Error al cargar pedidos') }
    finally { setLoading(false) }
  }

  const loadSedes = async () => { try { const res = await api.get('/sedes'); setSedes(res.data) } catch {} }
  const loadArticulos = async () => { try { const res = await api.get('/articulos'); setArticulos(res.data) } catch {} }

  const handleFilter = (e) => { e.preventDefault(); setCurrentPage(1); loadPedidos() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validDetalles = formData.detalles.filter(d => d.articulo_id && d.cantidad_solicitada > 0)
    try {
      if (editingPedido) {
        await api.put(`/pedidos/${editingPedido.id}`, { ...formData, detalles: undefined })
        toast.success('Pedido actualizado')
      } else {
        await api.post('/pedidos', { ...formData, detalles: validDetalles })
        toast.success('Pedido creado')
      }
      setShowModal(false); setEditingPedido(null); resetForm(); loadPedidos()
    } catch (error) { toast.error(error.response?.data?.error || 'Error al guardar') }
  }

  const handleViewDetail = async (pedido) => {
    try { const res = await api.get(`/pedidos/${pedido.id}`); setSelectedPedido(res.data); setShowDetailModal(true) }
    catch { toast.error('Error') }
  }

  const handleEdit = async (pedido) => {
    try {
      const res = await api.get(`/pedidos/${pedido.id}`)
      const p = res.data
      setEditingPedido(p)
      setFormData({
        numero_pedido: p.numero_pedido,
        recibe: p.recibe,
        fecha_pedido: format(new Date(p.fecha_pedido), 'yyyy-MM-dd'),
        fecha_ingreso: format(new Date(p.fecha_ingreso), 'yyyy-MM-dd'),
        proveedor: p.proveedor || '',
        observaciones: p.observaciones || '',
        sede_id: p.sede_id || '',
        detalles: p.detalles?.length > 0 ? p.detalles.map(d => ({
          articulo_id: d.articulo_id || '',
          cantidad_solicitada: d.cantidad_solicitada,
          cantidad_recibida: d.cantidad_recibida,
          precio_unitario: d.precio_unitario || '',
          observaciones: d.observaciones || ''
        })) : [{ articulo_id: '', cantidad_solicitada: 1, cantidad_recibida: 0, precio_unitario: '', observaciones: '' }]
      })
      setShowModal(true)
    } catch { toast.error('Error') }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este pedido?')) return
    try { await api.delete(`/pedidos/${id}`); toast.success('Pedido eliminado'); loadPedidos() }
    catch { toast.error('Error') }
  }

  const handleProcessPedido = async (id) => {
    if (!confirm('¿Procesar pedido? Se agregará el stock recibido al inventario.')) return
    try {
      await api.post(`/pedidos/${id}/procesar`)
      toast.success('Pedido procesado - Stock actualizado')
      loadPedidos(); setShowDetailModal(false)
    } catch (error) { toast.error(error.response?.data?.error || 'Error al procesar') }
  }

  const handleUpdateDetalle = async (detalleId, cantidadRecibida) => {
    try {
      await api.put(`/pedidos/${selectedPedido.id}/detalles/${detalleId}`, { cantidad_recibida: parseInt(cantidadRecibida) })
      const res = await api.get(`/pedidos/${selectedPedido.id}`)
      setSelectedPedido(res.data)
      toast.success('Detalle actualizado')
    } catch { toast.error('Error') }
  }

  const addDetalle = () => setFormData({ ...formData, detalles: [...formData.detalles, { articulo_id: '', cantidad_solicitada: 1, cantidad_recibida: 0, precio_unitario: '', observaciones: '' }] })
  const removeDetalle = (i) => setFormData({ ...formData, detalles: formData.detalles.filter((_, idx) => idx !== i) })
  const updateDetalle = (i, field, val) => { const d = [...formData.detalles]; d[i] = { ...d[i], [field]: val }; setFormData({ ...formData, detalles: d }) }

  const resetForm = () => setFormData({
    numero_pedido: '', recibe: '', fecha_pedido: format(new Date(), 'yyyy-MM-dd'), fecha_ingreso: format(new Date(), 'yyyy-MM-dd'),
    proveedor: '', observaciones: '', sede_id: '',
    detalles: [{ articulo_id: '', cantidad_solicitada: 1, cantidad_recibida: 0, precio_unitario: '', observaciones: '' }]
  })

  const estadoBadge = (estado) => ({
    pendiente: 'bg-yellow-100 text-yellow-700',
    parcial: 'bg-blue-100 text-blue-700',
    completado: 'bg-green-100 text-green-700',
    cancelado: 'bg-red-100 text-red-700'
  }[estado] || 'bg-gray-100')

  const totalPages = Math.ceil(pedidos.length / perPage)
  const paginatedPedidos = pedidos.slice((currentPage - 1) * perPage, currentPage * perPage)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Pedidos</h1>
        <button onClick={() => { resetForm(); setEditingPedido(null); setShowModal(true) }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={20} /> Nuevo Pedido
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Buscar por N°, recibe o proveedor..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field pl-10 text-sm" />
          </div>
          <select value={filters.estado} onChange={(e) => setFilters({ ...filters, estado: e.target.value })} className="input-field text-sm w-auto"><option value="">Todos estados</option><option value="pendiente">Pendiente</option><option value="parcial">Parcial</option><option value="completado">Completado</option><option value="cancelado">Cancelado</option></select>
          <button type="submit" className="btn-primary text-sm">Buscar</button>
        </form>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                <th className="px-4 py-3">N° Pedido</th>
                <th className="px-4 py-3">Fecha Pedido</th>
                <th className="px-4 py-3">Fecha Ingreso</th>
                <th className="px-4 py-3">Recibe</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Sede</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedPedidos.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-sm font-medium">{p.numero_pedido}</td>
                  <td className="px-4 py-3 text-sm">{format(new Date(p.fecha_pedido), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3 text-sm">{format(new Date(p.fecha_ingreso), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.recibe}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.proveedor || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{p.sede_nombre || '-'}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge(p.estado)}`}>{p.estado.charAt(0).toUpperCase() + p.estado.slice(1)}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1">
                      <button onClick={() => handleViewDetail(p)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Ver detalle"><Eye size={16} /></button>
                      {p.estado !== 'completado' && <button onClick={() => handleEdit(p)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg" title="Editar"><Edit2 size={16} /></button>}
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Eliminar"><Trash2 size={16} /></button>
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
        {paginatedPedidos.map((p) => (
          <div key={p.id} className="card p-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-mono font-medium text-sm">{p.numero_pedido}</p>
                <p className="text-xs text-gray-500">{p.recibe}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge(p.estado)}`}>{p.estado}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Pedido: {format(new Date(p.fecha_pedido), 'dd/MM/yy')}</span>
              <span>Ingreso: {format(new Date(p.fecha_ingreso), 'dd/MM/yy')}</span>
            </div>
            <div className="flex justify-end gap-1">
              <button onClick={() => handleViewDetail(p)} className="p-2 text-blue-600"><Eye size={16} /></button>
              {p.estado !== 'completado' && <button onClick={() => handleEdit(p)} className="p-2 text-yellow-600"><Edit2 size={16} /></button>}
              <button onClick={() => handleDelete(p.id)} className="p-2 text-red-600"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={pedidos.length} perPage={perPage} onChangePage={setCurrentPage} onChangePerPage={(v) => { setPerPage(v); setCurrentPage(1) }} />

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-4 border-b sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">{editingPedido ? 'Editar Pedido' : 'Nuevo Pedido'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">N° Pedido *</label><input type="text" value={formData.numero_pedido} onChange={(e) => setFormData({ ...formData, numero_pedido: e.target.value })} className="input-field" required placeholder="Ej: PED-2026-001" /></div>
                <div><label className="label">Proveedor</label><input type="text" value={formData.proveedor} onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })} className="input-field" /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div><label className="label">Recibe *</label><input type="text" value={formData.recibe} onChange={(e) => setFormData({ ...formData, recibe: e.target.value })} className="input-field" required /></div>
                <div><label className="label">Fecha Pedido *</label><input type="date" value={formData.fecha_pedido} onChange={(e) => setFormData({ ...formData, fecha_pedido: e.target.value })} className="input-field" required /></div>
                <div><label className="label">Fecha Ingreso *</label><input type="date" value={formData.fecha_ingreso} onChange={(e) => setFormData({ ...formData, fecha_ingreso: e.target.value })} className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Sede</label><select value={formData.sede_id} onChange={(e) => setFormData({ ...formData, sede_id: e.target.value })} className="input-field"><option value="">Seleccionar...</option>{sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
                <div><label className="label">Observaciones</label><input type="text" value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} className="input-field" /></div>
              </div>

              {/* Detalles */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="label mb-0">Artículos del Pedido *</label>
                  <button type="button" onClick={addDetalle} className="text-primary-600 text-sm hover:underline">+ Agregar artículo</button>
                </div>
                <div className="space-y-2">
                  {formData.detalles.map((det, i) => (
                    <div key={i} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end border rounded-lg p-2">
                      <div className="sm:col-span-4">
                        <label className="label text-xs">Artículo</label>
                        <select value={det.articulo_id} onChange={(e) => updateDetalle(i, 'articulo_id', e.target.value)} className="input-field text-sm" required>
                          <option value="">Seleccionar...</option>
                          {articulos.map((a) => <option key={a.id} value={a.id}>{a.nombre} ({a.sku})</option>)}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label text-xs">Cant. Solicitada</label>
                        <input type="number" value={det.cantidad_solicitada} onChange={(e) => updateDetalle(i, 'cantidad_solicitada', parseInt(e.target.value))} className="input-field text-sm" min="1" required />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label text-xs">Cant. Recibida</label>
                        <input type="number" value={det.cantidad_recibida} onChange={(e) => updateDetalle(i, 'cantidad_recibida', parseInt(e.target.value))} className="input-field text-sm" min="0" />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label text-xs">Precio Unit.</label>
                        <input type="number" value={det.precio_unitario} onChange={(e) => updateDetalle(i, 'precio_unitario', e.target.value)} className="input-field text-sm" step="0.01" min="0" />
                      </div>
                      <div className="sm:col-span-2 flex justify-end">
                        {formData.detalles.length > 1 && <button type="button" onClick={() => removeDetalle(i)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X size={16} /></button>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">{editingPedido ? 'Actualizar' : 'Crear Pedido'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedPedido && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-4 border-b sticky top-0 bg-white">
              <div>
                <h3 className="text-lg font-semibold">Pedido {selectedPedido.numero_pedido}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${estadoBadge(selectedPedido.estado)}`}>{selectedPedido.estado}</span>
              </div>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500"><X size={24} /></button>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-gray-500">Recibe:</span><p className="font-medium">{selectedPedido.recibe}</p></div>
                <div><span className="text-gray-500">Proveedor:</span><p className="font-medium">{selectedPedido.proveedor || '-'}</p></div>
                <div><span className="text-gray-500">Fecha Pedido:</span><p className="font-medium">{format(new Date(selectedPedido.fecha_pedido), 'dd/MM/yyyy')}</p></div>
                <div><span className="text-gray-500">Fecha Ingreso:</span><p className="font-medium">{format(new Date(selectedPedido.fecha_ingreso), 'dd/MM/yyyy')}</p></div>
              </div>
              {selectedPedido.observaciones && <p className="text-sm text-gray-500"><strong>Obs:</strong> {selectedPedido.observaciones}</p>}

              {/* Detalles table */}
              <div>
                <h4 className="font-semibold mb-2">Artículos</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-gray-500 border-b">
                        <th className="text-left py-2">Artículo</th>
                        <th className="text-center py-2">Solicitado</th>
                        <th className="text-center py-2">Recibido</th>
                        <th className="text-center py-2">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedPedido.detalles?.map((d) => (
                        <tr key={d.id} className="border-b">
                          <td className="py-2">
                            <p className="font-medium">{d.articulo_nombre}</p>
                            <p className="text-xs text-gray-400">{d.sku}</p>
                          </td>
                          <td className="py-2 text-center">{d.cantidad_solicitada}</td>
                          <td className="py-2 text-center font-semibold">{d.cantidad_recibida}</td>
                          <td className="py-2 text-center">
                            {selectedPedido.estado !== 'completado' && (
                              <div className="flex items-center justify-center gap-1">
                                <input type="number" defaultValue={d.cantidad_recibida} min="0" max={d.cantidad_solicitada}
                                  onBlur={(e) => handleUpdateDetalle(d.id, e.target.value)}
                                  className="w-20 text-center border rounded px-1 py-1 text-sm" />
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Process button */}
              {selectedPedido.estado !== 'completado' && (
                <div className="flex justify-end pt-4 border-t">
                  <button onClick={() => handleProcessPedido(selectedPedido.id)} className="btn-success flex items-center gap-2">
                    <Package size={18} /> Procesar Pedido (Agregar al Stock)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
