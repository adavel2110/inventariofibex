"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Plus, Truck, Eye, CheckCircle, XCircle, Package } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Despacho {
  id: string
  numeroDespacho: string
  tipo: string
  estado: string
  prioridad: string
  motivo: string
  createdAt: string
  fechaAprobacion: string | null
  fechaEntrega: string | null
  solicitante: { id: string; nombre: string; apellido: string }
  aprobador: { id: string; nombre: string; apellido: string } | null
  entregador: { id: string; nombre: string; apellido: string } | null
  empleadoDestino: {
    id: string
    nombre: string
    apellido: string
    cargo: string
    departamento: { nombre: string }
  }
  items: Array<{
    id: string
    cantidad: number
    stockItem: {
      id: string
      codigoInterno: string
      producto: { nombre: string }
      modelo: { nombre: string; marca: { nombre: string } }
    }
  }>
  _count?: { items: number }
}

const estados = ["PENDIENTE", "EN_REVISION", "APROBADO", "RECHAZADO", "EN_PREPARACION", "EN_CAMINO", "ENTREGADO", "CANCELADO"]
const tipos = ["NUEVA_ASIGNACION", "REEMPLAZO", "PRESTAMO", "TRASLADO", "MANTENIMIENTO", "CONSUMIBLES"]

export default function DespachosPage() {
  const [despachos, setDespachos] = useState<Despacho[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [estadoFilter, setEstadoFilter] = useState("")
  const [tipoFilter, setTipoFilter] = useState("")
  const [selectedDespacho, setSelectedDespacho] = useState<Despacho | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (estadoFilter) params.append("estado", estadoFilter)
      if (tipoFilter) params.append("tipo", tipoFilter)

      const response = await fetch(`/api/despachos?${params}`)
      const result = await response.json()
      if (result.data) setDespachos(result.data)
    } catch (error) {
      toast.error("Error al cargar despachos")
    } finally {
      setIsLoading(false)
    }
  }, [estadoFilter, tipoFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleUpdateEstado = async (id: string, estado: string) => {
    try {
      const response = await fetch(`/api/despachos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado }),
      })

      if (response.ok) {
        toast.success(`Despacho ${estado.toLowerCase()}`)
        fetchData()
      } else {
        toast.error("Error al actualizar")
      }
    } catch (error) {
      toast.error("Error al actualizar")
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, any> = {
      PENDIENTE: "outline",
      EN_REVISION: "secondary",
      APROBADO: "secondary",
      RECHAZADO: "destructive",
      EN_PREPARACION: "outline",
      EN_CAMINO: "secondary",
      ENTREGADO: "default",
      CANCELADO: "destructive",
    }
    return <Badge variant={variants[estado] || "default"}>{estado.replace("_", " ")}</Badge>
  }

  const getPrioridadBadge = (prioridad: string) => {
    const variants: Record<string, any> = {
      BAJA: "outline",
      MEDIA: "secondary",
      ALTA: "default",
      URGENTE: "destructive",
    }
    return <Badge variant={variants[prioridad] || "default"}>{prioridad}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Despachos</h1>
            <p className="text-muted-foreground">Gestión de solicitudes y entregas de equipos</p>
          </div>
          <Button asChild>
            <Link href="/despachos/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Despacho
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Lista de Despachos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <Select value={estadoFilter || "all"} onValueChange={(v) => setEstadoFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {estados.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={tipoFilter || "all"} onValueChange={(v) => setTipoFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {tipos.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <p>Cargando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Prioridad</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Destinatario</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {despachos.map((desp) => (
                    <TableRow key={desp.id}>
                      <TableCell className="font-medium">{desp.numeroDespacho}</TableCell>
                      <TableCell>{desp.tipo}</TableCell>
                      <TableCell>{getPrioridadBadge(desp.prioridad)}</TableCell>
                      <TableCell>
                        {desp.solicitante.nombre} {desp.solicitante.apellido}
                      </TableCell>
                      <TableCell>
                        {desp.empleadoDestino.nombre} {desp.empleadoDestino.apellido}
                        <br />
                        <span className="text-muted-foreground text-sm">{desp.empleadoDestino.cargo}</span>
                      </TableCell>
                      <TableCell>{desp._count?.items || desp.items.length}</TableCell>
                      <TableCell>{getEstadoBadge(desp.estado)}</TableCell>
                      <TableCell>
                        {format(new Date(desp.createdAt), "dd/MM/yyyy", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedDespacho(desp)}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl bg-white rounded-lg shadow-lg p-6">
                              <DialogHeader>
                                <DialogTitle>Detalle del Despacho {desp.numeroDespacho}</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">Estado:</p>
                                    <p>{getEstadoBadge(desp.estado)}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Tipo:</p>
                                    <p>{desp.tipo}</p>
                                  </div>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Motivo:</p>
                                  <p className="text-sm">{desp.motivo}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium">Items:</p>
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Producto</TableHead>
                                        <TableHead>Marca/Modelo</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {desp.items.map((item) => (
                                        <TableRow key={item.id}>
                                          <TableCell>{item.stockItem.codigoInterno}</TableCell>
                                          <TableCell>{item.stockItem.producto.nombre}</TableCell>
                                          <TableCell>
                                            {item.stockItem.modelo.marca.nombre} {item.stockItem.modelo.nombre}
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                {desp.estado === "PENDIENTE" && (
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      variant="outline"
                                      onClick={() => handleUpdateEstado(desp.id, "RECHAZADO")}
                                    >
                                      <XCircle className="mr-2 h-4 w-4" />
                                      Rechazar
                                    </Button>
                                    <Button
                                      onClick={() => handleUpdateEstado(desp.id, "APROBADO")}
                                    >
                                      <CheckCircle className="mr-2 h-4 w-4" />
                                      Aprobar
                                    </Button>
                                  </div>
                                )}
                                {desp.estado === "APROBADO" && (
                                  <div className="flex justify-end">
                                    <Button
                                      onClick={() => handleUpdateEstado(desp.id, "ENTREGADO")}
                                    >
                                      <Package className="mr-2 h-4 w-4" />
                                      Marcar Entregado
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
