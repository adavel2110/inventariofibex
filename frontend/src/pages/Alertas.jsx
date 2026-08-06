import { useState, useEffect } from 'react'
import { Bell, Check, AlertTriangle } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import Pagination from '../components/Pagination'

export default function Alertas() {
  const [alertas, setAlertas] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(5)

  useEffect(() => { loadAlertas() }, [])

  const loadAlertas = async () => {
    try { const res = await api.get('/dashboard/alertas'); setAlertas(res.data) }
    catch { toast.error('Error al cargar alertas') }
    finally { setLoading(false) }
  }

  const totalPages = Math.ceil(alertas.length / perPage)
  const paginatedAlertas = alertas.slice((currentPage - 1) * perPage, currentPage * perPage)

  const markAsRead = async (id) => { try { await api.put(`/dashboard/alertas/${id}/leer`); loadAlertas() } catch { toast.error('Error') } }
  const markAllAsRead = async () => { try { await Promise.all(alertas.map(a => api.put(`/dashboard/alertas/${a.id}/leer`))); toast.success('Todas marcadas'); loadAlertas() } catch { toast.error('Error') } }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-xl md:text-2xl font-bold text-gray-800">Alertas</h1>
        {alertas.length > 0 && <button onClick={markAllAsRead} className="btn-secondary flex items-center gap-2 w-full sm:w-auto justify-center"><Check size={16} /> Marcar todas leídas</button>}
      </div>

      {alertas.length === 0 ? (
        <div className="card text-center py-12"><Bell size={48} className="mx-auto text-gray-400 mb-4" /><p className="text-gray-500">No hay alertas pendientes</p></div>
      ) : (
        <div className="card">
          <div className="space-y-3">
            {paginatedAlertas.map((alerta) => (
              <div key={alerta.id} className={`flex items-start gap-3 ${alerta.leida ? 'opacity-60' : ''}`}>
                <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0"><AlertTriangle className="text-red-500" size={20} /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Stock Bajo</span>
                    <span className="text-xs text-gray-500">{format(new Date(alerta.created_at), 'dd/MM/yyyy HH:mm')}</span>
                  </div>
                  <p className="text-sm text-gray-800 break-words">{alerta.mensaje}</p>
                </div>
                {!alerta.leida && <button onClick={() => markAsRead(alerta.id)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg flex-shrink-0"><Check size={18} /></button>}
              </div>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} totalItems={alertas.length} perPage={perPage} onChangePage={setCurrentPage} onChangePerPage={(v) => { setPerPage(v); setCurrentPage(1) }} />
        </div>
      )}
    </div>
  )
}
