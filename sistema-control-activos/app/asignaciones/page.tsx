"use client"

import { useEffect, useState } from "react"
import { DashboardLayout } from "../dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Users, 
  Plus,
  Search,
  Filter
} from "lucide-react"
import Link from "next/link"

interface Asignacion {
  id: string
  codigo: string
  estado: string
  fechaAsignacion: string
  condicionEntrega: string
  observaciones: string
  stockItem: {
    id: string
    numeroSerie: string
    producto: {
      nombre: string
      categoria: { nombre: string }
      modelo: { nombre: string; marca: { nombre: string } }
    }
  }
  empleado: {
    id: string
    nombre: string
    apellido: string
    cargo: string
    departamento: { nombre: string }
  }
  entregadoPor: { nombre: string; apellido: string }
}

export default function AsignacionesPage() {
  const [asignaciones, setAsignaciones] = useState<Asignacion[]>([])
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState("")

  useEffect(() => {
    async function fetchAsignaciones() {
      try {
        const res = await fetch("/api/asignaciones")
        const data = await res.json()
        if (data.data) {
          setAsignaciones(data.data)
        }
      } catch (error) {
        console.error("Error fetching asignaciones:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAsignaciones()
  }, [])

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "ACTIVA":
        return <Badge variant="default">Activa</Badge>
      case "DEVUELTA":
        return <Badge variant="secondary">Devuelta</Badge>
      case "PERDIDA":
        return <Badge variant="destructive">Perdida</Badge>
      case "DANADA":
        return <Badge variant="destructive">Dañada</Badge>
      case "VENCIDA":
        return <Badge variant="outline">Vencida</Badge>
      default:
        return <Badge>{estado}</Badge>
    }
  }

  const filtradas = asignaciones.filter(a => 
    a.codigo.toLowerCase().includes(filtro.toLowerCase()) ||
    a.empleado.nombre.toLowerCase().includes(filtro.toLowerCase()) ||
    a.empleado.apellido.toLowerCase().includes(filtro.toLowerCase()) ||
    a.stockItem.producto.nombre.toLowerCase().includes(filtro.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Asignaciones</h1>
            <p className="text-muted-foreground">
              Gestión de asignaciones de equipos a empleados
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar asignaciones..."
              className="pl-10 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtrar
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Cargando asignaciones...</p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Asignaciones</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{asignaciones.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Activas</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {asignaciones.filter(a => a.estado === "ACTIVA").length}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Devueltas</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {asignaciones.filter(a => a.estado === "DEVUELTA").length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabla */}
            <Card>
              <CardHeader>
                <CardTitle>Lista de Asignaciones</CardTitle>
                <CardDescription>
                  {filtradas.length} asignaciones encontradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">Código</th>
                        <th className="text-left py-3 px-4">Equipo</th>
                        <th className="text-left py-3 px-4">Empleado</th>
                        <th className="text-left py-3 px-4">Fecha</th>
                        <th className="text-left py-3 px-4">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtradas.length > 0 ? (
                        filtradas.map((asignacion) => (
                          <tr key={asignacion.id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <span className="font-medium">{asignacion.codigo}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">{asignacion.stockItem.producto.nombre}</p>
                                <p className="text-sm text-muted-foreground">
                                  {asignacion.stockItem.producto.modelo?.marca?.nombre} {asignacion.stockItem.producto.modelo?.nombre}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Serie: {asignacion.stockItem.numeroSerie || "N/A"}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div>
                                <p className="font-medium">
                                  {asignacion.empleado.nombre} {asignacion.empleado.apellido}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {asignacion.empleado.cargo}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {asignacion.empleado.departamento.nombre}
                                </p>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              {new Date(asignacion.fechaAsignacion).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              {getEstadoBadge(asignacion.estado)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            No se encontraron asignaciones
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}