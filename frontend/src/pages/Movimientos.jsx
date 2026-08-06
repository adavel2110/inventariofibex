import { useState, useEffect } from 'react'
import { Plus, Eye, Filter, X } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Pagination from '../components/Pagination'

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [sedes, setSedes] = useState([])
  const [articulos, setArticulos] = useState([])
  const [beneficiarios, setBeneficiarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedMovimiento, setSelectedMovimiento] = useState(null)
  const [filters, setFilters] = useState({ tipo: '', sede_id: '', fecha_desde: '', fecha_hasta: '' })
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)
  const [formData, setFormData] = useState({ tipo: 'salida', sede_origen_id: '', sede_destino_id: '', beneficiario_id: '', documento_referencia: '', observaciones: '', fecha_movimiento: format(new Date(), 'yyyy-MM-dd'), detalles: [{ articulo_id: '', cantidad: 1 }] })

  useEffect(() => { loadMovimientos(); loadSedes(); loadArticulos(); loadBeneficiarios() }, [])

  const loadMovimientos = async () => { try { const res = await api.get('/movimientos', { params: filters }); setMovimientos(res.data) } catch { toast.error('Error al cargar movimientos') } finally { setLoading(false) } }
  const loadSedes = async () => { try { const res = await api.get('/sedes'); setSedes(res.data) } catch {} }
  const loadArticulos = async () => { try { const res = await api.get('/articulos'); setArticulos(res.data) } catch {} }
  const loadBeneficiarios = async () => { try { const res = await api.get('/beneficiarios'); setBeneficiarios(res.data) } catch {} }

  const handleFilter = (e) => { e.preventDefault(); setCurrentPage(1); loadMovimientos() }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validDetalles = formData.detalles.filter(d => d.articulo_id && d.cantidad > 0)
    if (validDetalles.length === 0) { toast.error('Agregue al menos un artículo'); return }
    try { await api.post('/movimientos', { ...formData, detalles: validDetalles }); toast.success('Movimiento registrado'); setShowModal(false); resetForm(); loadMovimientos() }
    catch (error) { toast.error(error.response?.data?.error || 'Error al registrar') }
  }

  const handleViewDetail = async (mov) => { try { const res = await api.get(`/movimientos/${mov.id}`); setSelectedMovimiento(res.data); setShowDetailModal(true) } catch { toast.error('Error') } }
  const addDetalle = () => setFormData({ ...formData, detalles: [...formData.detalles, { articulo_id: '', cantidad: 1 }] })
  const removeDetalle = (i) => setFormData({ ...formData, detalles: formData.detalles.filter((_, idx) => idx !== i) })
  const updateDetalle = (i, field, val) => { const d = [...formData.detalles]; d[i] = { ...d[i], [field]: val }; setFormData({ ...formData, detalles: d }) }
  const resetForm = () => setFormData({ tipo: 'salida', sede_origen_id: '', sede_destino_id: '', beneficiario_id: '', documento_referencia: '', observaciones: '', fecha_movimiento: format(new Date(), 'yyyy-MM-dd'), detalles: [{ articulo_id: '', cantidad: 1 }] })

  const badge = (tipo) => ({ entrada: 'bg-green-100 text-green-700', salida: 'bg-red-100 text-red-700', asignacion: 'bg-blue-100 text-blue-700', devolucion: 'bg-yellow-100 text-yellow-700', traslado: 'bg-purple-100 text-purple-700', ajuste: 'bg-gray-100 text-gray-700', baja: 'bg-red-200 text-red-800' }[tipo] || 'bg-gray-100')

  const totalPages = Math.ceil(movimientos.length / perPage)
  const paginatedMovimientos = movimientos.slice((currentPage - 1) * perPage, currentPage * perPage)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Movimientos</h1>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
          <Plus size={20} /> Nuevo Movimiento
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <form onSubmit={handleFilter} className="flex flex-wrap gap-3 items-end">
          <select value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })} className="input-field text-sm w-auto"><option value="">Todos tipos</option><option value="entrada">Entrada</option><option value="salida">Salida</option><option value="asignacion">Asignación</option><option value="devolucion">Devolución</option><option value="traslado">Traslado</option></select>
          <select value={filters.sede_id} onChange={(e) => setFilters({ ...filters, sede_id: e.target.value })} className="input-field text-sm w-auto"><option value="">Todas sedes</option>{sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select>
          <input type="date" value={filters.fecha_desde} onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })} className="input-field text-sm w-auto" />
          <input type="date" value={filters.fecha_hasta} onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })} className="input-field text-sm w-auto" />
          <button type="submit" className="btn-primary text-sm flex items-center gap-1"><Filter size={16} /> Filtrar</button>
        </form>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="table-header"><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Tipo</th><th className="px-4 py-3">Beneficiario</th><th className="px-4 py-3">Sede Orig.</th><th className="px-4 py-3">Usuario</th><th className="px-4 py-3 text-center">Ver</th></tr></thead>
            <tbody className="divide-y divide-gray-200">
              {paginatedMovimientos.map((mov) => (
                <tr key={mov.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{format(new Date(mov.fecha_movimiento), 'dd/MM/yyyy')}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${badge(mov.tipo)}`}>{mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}</span></td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{mov.beneficiario_nombre || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{mov.sede_origen_nombre || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 text-sm">{mov.usuario_nombre}</td>
                  <td className="px-4 py-3 text-center"><button onClick={() => handleViewDetail(mov)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Eye size={16} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {paginatedMovimientos.map((mov) => (
          <div key={mov.id} className="card p-3">
            <div className="flex justify-between items-start mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge(mov.tipo)}`}>{mov.tipo.charAt(0).toUpperCase() + mov.tipo.slice(1)}</span>
              <button onClick={() => handleViewDetail(mov)} className="p-1 text-blue-600"><Eye size={16} /></button>
            </div>
            <p className="text-xs text-gray-500">{format(new Date(mov.fecha_movimiento), 'dd/MM/yyyy')} - {mov.usuario_nombre}</p>
            {mov.beneficiario_nombre && <p className="text-sm mt-1">{mov.beneficiario_nombre}</p>}
            <p className="text-xs text-gray-400">{mov.sede_origen_nombre || ''}</p>
          </div>
        ))}
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={movimientos.length} perPage={perPage} onChangePage={setCurrentPage} onChangePerPage={(v) => { setPerPage(v); setCurrentPage(1) }} />

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">Nuevo Movimiento</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Tipo *</label><select value={formData.tipo} onChange={(e) => setFormData({ ...formData, tipo: e.target.value })} className="input-field" required><option value="entrada">Entrada</option><option value="salida">Salida</option><option value="asignacion">Asignación</option><option value="devolucion">Devolución</option><option value="traslado">Traslado</option><option value="ajuste">Ajuste</option><option value="baja">Baja</option></select></div>
                <div><label className="label">Fecha *</label><input type="date" value={formData.fecha_movimiento} onChange={(e) => setFormData({ ...formData, fecha_movimiento: e.target.value })} className="input-field" required /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="label">Sede Origen *</label><select value={formData.sede_origen_id} onChange={(e) => setFormData({ ...formData, sede_origen_id: e.target.value })} className="input-field" required><option value="">Seleccionar...</option>{sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
                {formData.tipo === 'traslado' && <div><label className="label">Sede Destino *</label><select value={formData.sede_destino_id} onChange={(e) => setFormData({ ...formData, sede_destino_id: e.target.value })} className="input-field" required><option value="">Seleccionar...</option>{sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>}
              </div>
              {(formData.tipo === 'asignacion' || formData.tipo === 'salida') && <div><label className="label">Beneficiario *</label><select value={formData.beneficiario_id} onChange={(e) => setFormData({ ...formData, beneficiario_id: e.target.value })} className="input-field" required><option value="">Seleccionar...</option>{beneficiarios.map((b) => <option key={b.id} value={b.id}>{b.nombre_completo} ({b.cedula})</option>)}</select></div>}
              <div><label className="label">Doc. Referencia</label><input type="text" value={formData.documento_referencia} onChange={(e) => setFormData({ ...formData, documento_referencia: e.target.value })} className="input-field" placeholder="Nº de orden, factura..." /></div>
              <div>
                <div className="flex justify-between items-center mb-2"><label className="label mb-0">Artículos *</label><button type="button" onClick={addDetalle} className="text-primary-600 text-sm hover:underline">+ Agregar</button></div>
                <div className="space-y-2">
                  {formData.detalles.map((det, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={det.articulo_id} onChange={(e) => updateDetalle(i, 'articulo_id', e.target.value)} className="input-field flex-1 text-sm" required><option value="">Artículo...</option>{articulos.map((a) => <option key={a.id} value={a.id}>{a.nombre}</option>)}</select>
                      <input type="number" value={det.cantidad} onChange={(e) => updateDetalle(i, 'cantidad', parseInt(e.target.value))} className="input-field w-20 text-sm" min="1" required />
                      {formData.detalles.length > 1 && <button type="button" onClick={() => removeDetalle(i)} className="p-1 text-red-600"><X size={16} /></button>}
                    </div>
                  ))}
                </div>
              </div>
              <div><label className="label">Observaciones</label><textarea value={formData.observaciones} onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })} className="input-field" rows={2} /></div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button>
                <button type="submit" className="btn-primary">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedMovimiento && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 p-4 border-b">
              <h3 className="text-lg font-semibold">Detalle del Movimiento</h3>
              <button onClick={() => setShowDetailModal(false)} className="text-gray-500"><X size={24} /></button>
            </div>
            <div className="p-4 space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-gray-500">Fecha:</span><p className="font-medium">{format(new Date(selectedMovimiento.fecha_movimiento), 'dd/MM/yyyy')}</p></div>
                <div><span className="text-gray-500">Tipo:</span><p className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${badge(selectedMovimiento.tipo)}`}>{selectedMovimiento.tipo}</p></div>
                <div><span className="text-gray-500">Beneficiario:</span><p className="font-medium">{selectedMovimiento.beneficiario_nombre || '-'}</p></div>
                <div><span className="text-gray-500">Sede Origen:</span><p className="font-medium">{selectedMovimiento.sede_origen_nombre || '-'}</p></div>
                <div><span className="text-gray-500">Sede Destino:</span><p className="font-medium">{selectedMovimiento.sede_destino_nombre || '-'}</p></div>
                <div><span className="text-gray-500">Usuario:</span><p className="font-medium">{selectedMovimiento.usuario_nombre}</p></div>
              </div>
              {selectedMovimiento.observaciones && <div><span className="text-gray-500">Obs:</span><p>{selectedMovimiento.observaciones}</p></div>}
              <div>
                <span className="text-gray-500">Artículos:</span>
                <table className="w-full mt-2">
                  <thead><tr className="text-xs text-gray-500 border-b"><th className="text-left py-2">Artículo</th><th className="text-right py-2">Cant</th></tr></thead>
                  <tbody>{selectedMovimiento.detalles?.map((d, i) => <tr key={i} className="border-b"><td className="py-2">{d.articulo_nombre} ({d.sku})</td><td className="py-2 text-right font-medium">{d.cantidad}</td></tr>)}</tbody>
                </table>
              </div>
            </div>
            <div className="flex justify-end p-4 border-t"><button onClick={() => setShowDetailModal(false)} className="btn-secondary">Cerrar</button></div>
          </div>
        </div>
      )}
    </div>
  )
}
