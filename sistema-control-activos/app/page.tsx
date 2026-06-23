"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "./dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  Users, 
  Truck, 
  AlertTriangle,
  ArrowRight,
  Activity,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react"
import Link from "next/link"

interface DashboardStats {
  totalEquipos: number
  equiposDisponibles: number
  equiposAsignados: number
  equiposEnReparacion: number
  despachosPendientes: number
  despachosAprobados: number
  despachosMes: number
  asignacionesActivas: number
  totalSedes: number
  totalEmpleados: number
  totalCategorias: number
  ultimosDespachos: any[]
  ultimasAsignaciones: any[]
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    if (status !== "authenticated") return
    
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/dashboard")
        const data = await res.json()
        if (data.data) {
          setStats(data.data)
        }
      } catch (error) {
        console.error("Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [status])

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const getStatusBadge = (estado: string) => {
    const estadoLower = estado.toLowerCase()
    if (estadoLower.includes("pendiente") || estadoLower.includes("en_revision")) {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />{estado}</Badge>
    }
    if (estadoLower.includes("aprobado") || estadoLower.includes("entregado") || estadoLower.includes("activa")) {
      return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />{estado}</Badge>
    }
    if (estadoLower.includes("rechazado") || estadoLower.includes("cancelado")) {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />{estado}</Badge>
    }
    return <Badge variant="outline">{estado}</Badge>
  }

  return (
    <DashboardLayout>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Sistema de Control de Activos - FIBEX
          </p>
        </div>
        <Button asChild>
          <Link href="/despachos">
            <Truck className="mr-2 h-4 w-4" />
            Nuevo Despacho
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Cargando estadísticas...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Equipos
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEquipos || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.equiposDisponibles || 0} disponibles
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Equipos Asignados
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.equiposAsignados || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.asignacionesActivas || 0} asignaciones activas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Despachos Pendientes
                </CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.despachosPendientes || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.despachosMes || 0} este mes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  En Reparación
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.equiposEnReparacion || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {stats?.totalSedes || 0} sedes activas
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Catalogos Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sedes</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalSedes || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Empleados</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalEmpleados || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categorías</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats?.totalCategorias || 0}</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Últimos Despachos</CardTitle>
                <CardDescription>
                  Movimientos de despacho recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats?.ultimosDespachos?.length ?? 0) > 0 ? (
                    stats!.ultimosDespachos.map((despacho: any) => (
                      <div key={despacho.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <Truck className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{despacho.codigo}</p>
                            <p className="text-xs text-muted-foreground">
                              {despacho.solicitante?.nombre} {despacho.solicitante?.apellido}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(despacho.estado)}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay despachos recientes
                    </p>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/despachos">
                      Ver todos
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Últimas Asignaciones</CardTitle>
                <CardDescription>
                  Asignaciones de equipos recientes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(stats?.ultimasAsignaciones?.length ?? 0) > 0 ? (
                    stats!.ultimasAsignaciones.map((asignacion: any) => (
                      <div key={asignacion.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <Users className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{asignacion.stockItem?.producto?.nombre}</p>
                            <p className="text-xs text-muted-foreground">
                              {asignacion.empleado?.nombre} {asignacion.empleado?.apellido}
                            </p>
                          </div>
                        </div>
                        {getStatusBadge(asignacion.estado)}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No hay asignaciones recientes
                    </p>
                  )}
                </div>
                <div className="mt-4 text-center">
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/asignaciones">
                      Ver todas
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Inventario</CardTitle>
                <CardDescription>Equipos y stock</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/inventario">Ver Inventario</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Catálogos</CardTitle>
                <CardDescription>Sedes, deptos, categorías</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/catalogos/sedes">Ver Catálogos</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Empleados</CardTitle>
                <CardDescription>Personal registrado</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/empleados">Ver Empleados</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Despachos</CardTitle>
                <CardDescription>Solicitudes y entregas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/despachos">Ver Despachos</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
    </DashboardLayout>
  )
}