import { useState, useEffect } from 'react'
import { Building2, Package, Users, AlertTriangle, Truck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../services/api'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function Dashboard() {
  const [resumen, setResumen] = useState(null)
  const [movimientos, setMovimientos] = useState([])
  const [topArticulos, setTopArticulos] = useState([])
  const [stockPorSede, setStockPorSede] = useState([])
  const [ultimasEntregas, setUltimasEntregas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const [resumenRes, movRes, topRes, sedeRes, entregasRes] = await Promise.all([
        api.get('/dashboard/resumen'),
        api.get('/dashboard/movimientos-por-mes'),
        api.get('/dashboard/top-articulos'),
        api.get('/dashboard/stock-por-sede'),
        api.get('/dashboard/ultimas-entregas')
      ])
      setResumen(resumenRes.data)
      setMovimientos(movRes.data)
      setTopArticulos(topRes.data)
      setStockPorSede(sedeRes.data)
      setUltimasEntregas(entregasRes.data)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const mesNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

  const chartData = movimientos.map(m => ({
    name: mesNames[m.mes - 1],
    entradas: m.tipo === 'entrada' ? parseInt(m.cantidad) : 0,
    salidas: m.tipo === 'salida' ? parseInt(m.cantidad) : 0,
    asignaciones: m.tipo === 'asignacion' ? parseInt(m.cantidad) : 0
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        <div className="card flex items-center gap-3 p-3 md:p-6">
          <div className="p-2 md:p-3 bg-blue-100 rounded-lg">
            <Package className="text-blue-600" size={20} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Artículos</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{resumen?.total_articulos || 0}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-3 md:p-6">
          <div className="p-2 md:p-3 bg-green-100 rounded-lg">
            <Building2 className="text-green-600" size={20} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Sedes</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{resumen?.total_sedes || 0}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-3 md:p-6">
          <div className="p-2 md:p-3 bg-purple-100 rounded-lg">
            <Users className="text-purple-600" size={20} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Beneficiarios</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{resumen?.total_beneficiarios || 0}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-3 md:p-6">
          <div className="p-2 md:p-3 bg-red-100 rounded-lg">
            <AlertTriangle className="text-red-600" size={20} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Stock Bajo</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{resumen?.stock_bajo || 0}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3 p-3 md:p-6 col-span-2 lg:col-span-1">
          <div className="p-2 md:p-3 bg-yellow-100 rounded-lg">
            <Truck className="text-yellow-600" size={20} />
          </div>
          <div>
            <p className="text-xs md:text-sm text-gray-500">Movimientos Hoy</p>
            <p className="text-lg md:text-2xl font-bold text-gray-800">{resumen?.movimientos_hoy || 0}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card">
          <h3 className="text-base md:text-lg font-semibold mb-4">Movimientos Mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="entradas" fill="#10b981" name="Entradas" />
              <Bar dataKey="salidas" fill="#ef4444" name="Salidas" />
              <Bar dataKey="asignaciones" fill="#3b82f6" name="Asignaciones" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 className="text-base md:text-lg font-semibold mb-4">Stock por Sede</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stockPorSede.slice(0, 6)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sede_nombre, percent }) => `${sede_nombre} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="total_unidades"
                nameKey="sede_nombre"
              >
                {stockPorSede.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card">
          <h3 className="text-base md:text-lg font-semibold mb-4">Top Artículos</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-3 md:px-4 py-3 text-left text-xs">Artículo</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs hidden sm:table-cell">SKU</th>
                  <th className="px-3 md:px-4 py-3 text-right text-xs">Movidos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topArticulos.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 md:px-4 py-3 text-sm">{item.nombre}</td>
                    <td className="px-3 md:px-4 py-3 text-xs text-gray-500 hidden sm:table-cell">{item.sku}</td>
                    <td className="px-3 md:px-4 py-3 text-sm text-right font-medium">{item.total_movido}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <h3 className="text-base md:text-lg font-semibold mb-4">Últimas Entregas</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="table-header">
                  <th className="px-3 md:px-4 py-3 text-left text-xs">Fecha</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs">Beneficiario</th>
                  <th className="px-3 md:px-4 py-3 text-left text-xs hidden md:table-cell">Sede</th>
                  <th className="px-3 md:px-4 py-3 text-right text-xs">Arts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {ultimasEntregas.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-3 md:px-4 py-3 text-xs">
                      {new Date(item.fecha_movimiento).toLocaleDateString()}
                    </td>
                    <td className="px-3 md:px-4 py-3 text-sm">{item.beneficiario_nombre}</td>
                    <td className="px-3 md:px-4 py-3 text-xs text-gray-500 hidden md:table-cell">{item.sede_nombre}</td>
                    <td className="px-3 md:px-4 py-3 text-sm text-right">{item.total_articulos}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
