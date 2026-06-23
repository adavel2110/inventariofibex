"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"
import { ArrowLeft, Pencil, Package, MapPin, Calendar, DollarSign, User, QrCode } from "lucide-react"
import Link from "next/link"
import Image from "next/image"


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface StockItem {
  id: string
  codigoBarras: string | null
  qrCode: string | null
  numeroSerie: string | null
  imei: string | null
  macAddress: string | null
  ubicacionFisica: string | null
  estado: string
  condicion: string
  fechaIngreso: string | null
  fechaCompra: string | null
  numeroFactura: string | null
  costo: number | null
  proveedor: string | null
  garantiaHasta: string | null
  nombreEquipo: string | null
  os: string | null
  cpu: string | null
  memoriaGb: string | null
  disco: string | null
  ipAsignada: string | null
  password: string | null
  observaciones: string | null
  activo: boolean
  producto: {
    id: string
    nombre: string
    codigo: string
    descripcion: string | null
    modelo: { id: string; nombre: string; marca: { id: string; nombre: string } } | null
    categoria: { id: string; nombre: string }
  }
  sede: { id: string; nombre: string } | null
  equipoPadre: {
    id: string
    producto: {
      nombre: string
      modelo: { nombre: string; marca: { nombre: string } }
    }
  } | null
  perifericos: Array<{
    id: string
    numeroSerie: string | null
    producto: {
      nombre: string
      modelo: { nombre: string; marca: { nombre: string } }
    }
  }>
  asignaciones: Array<{
    id: string
    estado: string
    fechaAsignacion: string
    empleado: {
      id: string
      nombre: string
      apellido: string
      email: string
      cargo: string
    }
  }>
}

const getEstadoBadge = (estado: string) => {
  const variants: Record<string, string> = {
    DISPONIBLE: "default",
    ASIGNADO: "secondary",
    EN_REPARACION: "outline",
    EN_DESPACHO: "outline",
    DADO_BAJA: "destructive",
    EN_TRANSITO: "outline",
    RESERVADO: "secondary",
  }
  return <Badge variant={(variants[estado] as any) || "default"}>{estado.replace("_", " ")}</Badge>
}

const getCondicionBadge = (condicion: string) => {
  const variants: Record<string, string> = {
    NUEVO: "default",
    USADO_BUENO: "secondary",
    USADO_REGULAR: "outline",
    MALO: "destructive",
    EN_REPARACION: "outline",
    OBSOLETO: "secondary",
  }
  return <Badge variant={(variants[condicion] as any) || "default"}>{condicion.replace("_", " ")}</Badge>
}

export default function EquipoDetailPage() {
  const params = useParams()
  const [item, setItem] = useState<StockItem | null>(null)
  const [productos, setProductos] = useState<Producto[]>([]);
  const [isAddPeripheralOpen, setIsAddPeripheralOpen] = useState(false);
  const [peripheralFormData, setPeripheralFormData] = useState({
    productoId: "",
    numeroSerie: "",
  });
  const [peripheralErrors, setPeripheralErrors] = useState<{field: string; message: string}[]>([]);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const response = await fetch(`/api/inventario/${params.id}`)
        const result = await response.json()
        if (result.data) {
          setItem(result.data)
        } else {
          toast.error("Equipo no encontrado")
        }
      } catch (error) {
        toast.error("Error al cargar equipo")
      } finally {
        setIsLoading(false)
      }
    }
    fetchItem()
  }, [params.id])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p>Cargando...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!item) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <p>Equipo no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/inventario">Volver al inventario</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/inventario">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{item.producto.nombre}</h1>
              <p className="text-muted-foreground">
                {item.producto.modelo?.marca?.nombre} - {item.producto.modelo?.nombre}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {getEstadoBadge(item.estado)}
            {getCondicionBadge(item.condicion)}
            <Button asChild>
              <Link href={`/inventario/${item.id}/editar`}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
          </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="especificaciones">Especificaciones</TabsTrigger>
            <TabsTrigger value="asignaciones">Asignaciones</TabsTrigger>
            <TabsTrigger value="perifericos">Periféricos</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Información del Equipo
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Código:</span>
                    <span className="font-medium">{item.codigoBarras || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Número de Serie:</span>
                    <span className="font-medium">{item.numeroSerie || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IMEI:</span>
                    <span className="font-medium">{item.imei || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">MAC:</span>
                    <span className="font-medium">{item.macAddress || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nombre:</span>
                    <span className="font-medium">{item.nombreEquipo || "-"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sede:</span>
                    <span className="font-medium">{item.sede?.nombre || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ubicación Física:</span>
                    <span className="font-medium">{item.ubicacionFisica || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IP Asignada:</span>
                    <span className="font-medium">{item.ipAsignada || "-"}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Fechas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de Ingreso:</span>
                    <span className="font-medium">
                      {item.fechaIngreso ? new Date(item.fechaIngreso).toLocaleDateString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fecha de Compra:</span>
                    <span className="font-medium">
                      {item.fechaCompra ? new Date(item.fechaCompra).toLocaleDateString() : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fin de Garantía:</span>
                    <span className="font-medium">
                      {item.garantiaHasta ? new Date(item.garantiaHasta).toLocaleDateString() : "-"}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Información de Compra
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Factura:</span>
                    <span className="font-medium">{item.numeroFactura || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Costo:</span>
                    <span className="font-medium">
                      {item.costo ? `$${item.costo.toFixed(2)}` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Proveedor:</span>
                    <span className="font-medium">{item.proveedor || "-"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {item.observaciones && (
              <Card>
                <CardHeader>
                  <CardTitle>Observaciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>{item.observaciones}</p>
                </CardContent>
              </Card>
            )}

            {item.qrCode && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="h-5 w-5" />
                    Código QR
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <Image src={item.qrCode} alt="QR Code" width={200} height={200} />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="especificaciones">
            <Card>
              <CardHeader>
                <CardTitle>Especificaciones Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sistema Operativo:</span>
                  <span className="font-medium">{item.os || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Procesador:</span>
                  <span className="font-medium">{item.cpu || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Memoria RAM:</span>
                  <span className="font-medium">{item.memoriaGb || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Almacenamiento:</span>
                  <span className="font-medium">{item.disco || "-"}</span>
                </div>
                {item.password && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contraseña:</span>
                    <span className="font-medium">••••••••</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="asignaciones">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Historial de Asignaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                {item.asignaciones.length > 0 ? (
                  <div className="space-y-4">
                    {item.asignaciones.map((asignacion) => (
                      <div key={asignacion.id} className="flex justify-between items-center p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {asignacion.empleado.nombre} {asignacion.empleado.apellido}
                          </p>
                          <p className="text-sm text-muted-foreground">{asignacion.empleado.cargo}</p>
                          <p className="text-sm text-muted-foreground">{asignacion.empleado.email}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant={asignacion.estado === "ACTIVA" ? "default" : "secondary"}>
                            {asignacion.estado}
                          </Badge>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(asignacion.fechaAsignacion).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No hay asignaciones registradas</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="perifericos">
            <Card>
              <CardHeader>
                <CardTitle>Periféricos Asociados</CardTitle>
              <Button variant="ghost" size="icon" asChild onClick={() => setIsAddPeripheralOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Asociar Periférico
              </Button>
              </CardHeader>
              <CardContent>
                {item.perifericos.length > 0 ? (
                  <div className="space-y-2">
                    {item.perifericos.map((periferico) => (
                      <div key={periferico.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{periferico.producto.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {periferico.producto.modelo.marca.nombre} - {periferico.producto.modelo.nombre}
                          </p>
                        </div>
                        <span className="text-muted-foreground">{periferico.numeroSerie || "Sin serie"}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">No hay periféricos asociados</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

          <Dialog open={isAddPeripheralOpen} onOpenChange={setIsAddPeripheralOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" onClick={() => setIsAddPeripheralOpen(false)}>Cancelar</Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg shadow-lg p-6">
              <DialogHeader>
                <DialogTitle>Asociar Periférico</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPeripheralSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="peripheralProductoId">Producto <span className="text-red-500">*</span></Label>
                  <Select
                    value={peripheralFormData.productoId}
                    onValueChange={(v) => handlePeripheralChange("productoId", v)}
                  >
                    <SelectTrigger className={peripheralFieldClass("productoId")}>
                      <SelectValue placeholder="Seleccione un producto periférico" />
                    </SelectTrigger>
                    <SelectContent>
                      {productos
                        .filter(p => p.categoria?.tipo === "PERIFERICO")
                        .map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.nombre} ({p.modelo?.marca?.nombre} - {p.modelo?.nombre || "Sin modelo"})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  {getPeripheralError("productoId") && (
                    <p className="text-sm text-red-500">{getPeripheralError("productoId")}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="peripheralNumeroSerie">Número de Serie</Label>
                  <Input
                    id="peripheralNumeroSerie"
                    value={peripheralFormData.numeroSerie}
                    onChange={(e) => handlePeripheralChange("numeroSerie", e.target.value)}
                    className={peripheralFieldClass("numeroSerie")}
                    placeholder="Ingrese el número de serie"
                  />
                  {getPeripheralError("numeroSerie") && (
                    <p className="text-sm text-red-500">{getPeripheralError("numeroSerie")}</p>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button type="submit">Asociar</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
      </div>
    </DashboardLayout>
  )
}