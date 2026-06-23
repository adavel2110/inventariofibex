"use client"

import { useState, useEffect, useCallback } from "react"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Package, Search, QrCode, Eye } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface StockItem {
  id: string
  codigoInterno: string
  serial: string | null
  estado: string
  condicion: string
  ubicacionFisica: string | null
  qrCode: string | null
  activo: boolean
  producto: { id: string; nombre: string }
  modelo: {
    id: string
    nombre: string
    marca: { id: string; nombre: string }
    categoria: { id: string; nombre: string }
  }
  sede: { id: string; nombre: string }
  departamento: { id: string; nombre: string }
  asignaciones: Array<{
    id: string
    estado: string
    empleado: {
      id: string
      nombre: string
      apellido: string
      email: string
    }
  }>
  perifericos: Array<any>
}

interface Sede {
  id: string
  nombre: string
}

interface Departamento {
  id: string
  nombre: string
}

const estados = ["DISPONIBLE", "ASIGNADO", "EN_REPARACION", "DANADO", "BAJA", "RESERVADO"]
const condiciones = ["NUEVO", "USADO_BUENO", "USADO_REGULAR", "DANADO", "OBSOLETO"]

export default function InventarioPage() {
  const [items, setItems] = useState<StockItem[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [estadoFilter, setEstadoFilter] = useState("")
  const [sedeFilter, setSedeFilter] = useState("")
  const [selectedQR, setSelectedQR] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (estadoFilter) params.append("estado", estadoFilter)
      if (sedeFilter) params.append("sedeId", sedeFilter)
      
      const [itemsRes, sedesRes, deptRes] = await Promise.all([
        fetch(`/api/inventario?${params}`),
        fetch("/api/sedes"),
        fetch("/api/departamentos"),
      ])
      const [itemsResult, sedesResult, deptResult] = await Promise.all([
        itemsRes.json(),
        sedesRes.json(),
        deptRes.json(),
      ])
      if (itemsResult.data) setItems(itemsResult.data)
      if (sedesResult.data) setSedes(sedesResult.data)
      if (deptResult.data) setDepartamentos(deptResult.data)
    } catch (error) {
      toast.error("Error al cargar inventario")
    } finally {
      setIsLoading(false)
    }
  }, [estadoFilter, sedeFilter])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este equipo?")) return

    try {
      const response = await fetch(`/api/inventario/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Equipo eliminado")
        fetchData()
      } else {
        toast.error("Error al eliminar")
      }
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const getEstadoBadge = (estado: string) => {
    const variants: Record<string, any> = {
      DISPONIBLE: "default",
      ASIGNADO: "secondary",
      EN_REPARACION: "outline",
      DANADO: "destructive",
      BAJA: "destructive",
      RESERVADO: "secondary",
    }
    return <Badge variant={variants[estado] || "default"}>{estado.replace("_", " ")}</Badge>
  }

  const filteredItems = items.filter((item) =>
    `${item.codigoInterno} ${item.serial} ${item.producto.nombre} ${item.modelo.nombre}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Inventario</h1>
            <p className="text-muted-foreground">Gestión de equipos y activos</p>
          </div>
          <Button asChild>
            <Link href="/inventario/nuevo">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Equipo
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Lista de Equipos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, serial o nombre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={estadoFilter || "all"} onValueChange={(v) => setEstadoFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {estados.map((e) => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sedeFilter || "all"} onValueChange={(v) => setSedeFilter(v === "all" ? "" : v)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sede" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {sedes.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
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
                    <TableHead>Código</TableHead>
                    <TableHead>Producto</TableHead>
                    <TableHead>Modelo/Marca</TableHead>
                    <TableHead>Serial</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Asignado a</TableHead>
                    <TableHead>Periféricos</TableHead>
                    <TableHead>QR</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.codigoInterno}</TableCell>
                      <TableCell>{item.producto.nombre}</TableCell>
                      <TableCell>
                        {item.modelo.nombre}
                        <br />
                        <span className="text-muted-foreground text-sm">{item.modelo.marca.nombre}</span>
                      </TableCell>
                      <TableCell>{item.serial || "-"}</TableCell>
                      <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                      <TableCell>
                        {item.asignaciones?.[0]?.empleado ? (
                          <span>
                            {item.asignaciones[0].empleado.nombre} {item.asignaciones[0].empleado.apellido}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{item.perifericos?.length || 0}</TableCell>
                      <TableCell>
                        {item.qrCode && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="icon" onClick={() => setSelectedQR(item.qrCode)}>
                                <QrCode className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Código QR - {item.codigoInterno}</DialogTitle>
                              </DialogHeader>
                              <div className="flex justify-center p-4">
                                {selectedQR && (
                                  <Image src={selectedQR} alt="QR Code" width={200} height={200} />
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/inventario/${item.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/inventario/${item.id}/editar`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
