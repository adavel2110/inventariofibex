import { useState, useEffect } from 'react'
import { FileText, Download, Filter } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Reportes() {
  const [sedes, setSedes] = useState([])
  const [categorias, setCategorias] = useState([])
  const [reportData, setReportData] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeReport, setActiveReport] = useState('inventario')
  const [filters, setFilters] = useState({ sede_id: '', categoria_id: '', tipo: '', fecha_desde: '', fecha_hasta: '' })

  useEffect(() => { loadSedes(); loadCategorias() }, [])
  const loadSedes = async () => { try { const res = await api.get('/sedes'); setSedes(res.data) } catch {} }
  const loadCategorias = async () => { try { const res = await api.get('/categorias'); setCategorias(res.data) } catch {} }

  const generateReport = async () => {
    setLoading(true)
    try {
      const endpoint = activeReport === 'inventario' ? '/reportes/inventario' : activeReport === 'movimientos' ? '/reportes/movimientos' : '/reportes/asignaciones'
      const res = await api.get(endpoint, { params: filters }); setReportData(res.data)
    } catch { toast.error('Error al generar reporte') } finally { setLoading(false) }
  }

  const exportToCSV = () => {
    if (reportData.length === 0) { toast.error('No hay datos'); return }
    const headers = Object.keys(reportData[0])
    const csv = [headers.join(','), ...reportData.map(row => headers.map(h => `"${row[h] || ''}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `reporte_${activeReport}_${new Date().toISOString().split('T')[0]}.csv`; link.click()
    toast.success('Exportado')
  }

  const reports = [{ id: 'inventario', label: 'Inventario' }, { id: 'movimientos', label: 'Movimientos' }, { id: 'asignaciones', label: 'Asignaciones' }]

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Reportes</h1>

      <div className="card">
        <div className="flex flex-wrap gap-2">
          {reports.map((r) => (
            <button key={r.id} onClick={() => { setActiveReport(r.id); setReportData([]) }} className={`px-3 md:px-4 py-2 rounded-lg text-sm transition-colors ${activeReport === r.id ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{r.label}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div><label className="label text-xs">Sede</label><select value={filters.sede_id} onChange={(e) => setFilters({ ...filters, sede_id: e.target.value })} className="input-field text-sm"><option value="">Todas</option>{sedes.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}</select></div>
          {activeReport === 'inventario' && <div><label className="label text-xs">Categoría</label><select value={filters.categoria_id} onChange={(e) => setFilters({ ...filters, categoria_id: e.target.value })} className="input-field text-sm"><option value="">Todas</option>{categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div>}
          {activeReport === 'movimientos' && <>
            <div><label className="label text-xs">Tipo</label><select value={filters.tipo} onChange={(e) => setFilters({ ...filters, tipo: e.target.value })} className="input-field text-sm"><option value="">Todos</option><option value="entrada">Entrada</option><option value="salida">Salida</option><option value="asignacion">Asignación</option></select></div>
            <div><label className="label text-xs">Desde</label><input type="date" value={filters.fecha_desde} onChange={(e) => setFilters({ ...filters, fecha_desde: e.target.value })} className="input-field text-sm" /></div>
            <div><label className="label text-xs">Hasta</label><input type="date" value={filters.fecha_hasta} onChange={(e) => setFilters({ ...filters, fecha_hasta: e.target.value })} className="input-field text-sm" /></div>
          </>}
          <button onClick={generateReport} disabled={loading} className="btn-primary text-sm flex items-center justify-center gap-1"><Filter size={16} /> {loading ? 'Generando...' : 'Generar'}</button>
        </div>
      </div>

      {reportData.length > 0 && (
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">{reportData.length} registros</span>
            <button onClick={exportToCSV} className="btn-secondary text-sm flex items-center gap-1"><Download size={16} /> CSV</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="table-header">{Object.keys(reportData[0]).map((k) => <th key={k} className="px-3 py-2 text-left text-xs capitalize">{k.replace(/_/g, ' ')}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-200">{reportData.map((row, i) => <tr key={i} className="hover:bg-gray-50">{Object.values(row).map((v, j) => <td key={j} className="px-3 py-2">{v === null ? '-' : String(v)}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </div>
      )}

      {reportData.length === 0 && !loading && <div className="card text-center py-12"><FileText size={48} className="mx-auto text-gray-400 mb-4" /><p className="text-gray-500 text-sm">Seleccione filtros y genere un reporte</p></div>}
    </div>
  )
}
