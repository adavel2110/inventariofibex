"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Package, 
  MapPin, 
  Calendar, 
  User, 
  Monitor,
  Smartphone,
  Printer,
  Phone,
  QrCode,
  ArrowLeft,
  Wrench,
  Clock,
  DollarSign,
  Shield
} from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

interface StockItem {
  id: string
  codigoBarras: string
  numeroSerie: string
  imei: string
  macAddress: string
  estado: string
  condicion: string
  ubicacionFisica: string
  fechaIngreso: string
  fechaCompra: string
  numeroFactura: string
  costo: number
  proveedor: string
  garantiaHasta: string
  nombreEquipo: string
  os: string
  cpu: string
  memoriaGb: string
  disco: string
  ipAsignada: string
  password: string
  observaciones: string
  qrCode: string
  producto: {
    nombre: string
    categoria: { nombre: string; tipo: string }
    modelo: { nombre: string; marca: { nombre: string } }
  }
  sede: { nombre: string; ciudad: string; direccion: string }
  equipoPadre: { id: string; producto: { nombre: string } }
  perifericos: any[]
  mantenimientos: any[]
  asignaciones: any[]
}

export default function EquipoPage() {
  const params = useParams()
  const [item, setItem] = useState<StockItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    async function fetchEquipo() {
      try {
        const res = await fetch(`/api/inventario/${params.id}`)
        const data = await res.json()
        if (data.data) {
          setItem(data.data)
        } else {
          setError("Equipo no encontrado")
        }
      } catch (err) {
        setError("Error al cargar el equipo")
      } finally {
        setLoading(false)
      }
    }
    if (params.id) {
      fetchEquipo()
    }
  }, [params.id])

  const getCategoriaIcon = (tipo: string) => {
    const tipoLower = tipo?.toLowerCase() || ""
    if (tipoLower.includes("computo")) return <Monitor className="h-5 w-5" />
    if (tipoLower.includes("periferico")) return <Printer className="h-5 w-5" />
    if (tipoLower.includes("comunicacion")) return <Phone className="h-5 w-5" />
    return <Package className="h-5 w-5" />
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Cargando información del equipo...</p>
        </div>
      </div>
    )
  }

  if (error || !item) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Equipo no encontrado</h2>
            <p className="text-gray-600 mb-4">{error || "El equipo no existe en el sistema"}</p>
            <Button asChild>
              <Link href="/inventario">Volver al inventario</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const asignacionActiva = item.asignaciones?.find((a: any) => a.estado === "ACTIVA")

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Button variant="ghost" asChild className="mb-2 -ml-2">
            <Link href="/inventario">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Link>
          </Button>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 bg-blue-100 rounded-lg flex items-center justify-center">
                {getCategoriaIcon(item.producto?.categoria?.tipo)}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{item.producto?.nombre}</h1>
                <p className="text-gray-600">
                  {item.producto?.modelo?.marca?.nombre} {item.producto?.modelo?.nombre}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Badge 
                variant={item.estado === "DISPONIBLE" ? "default" : "secondary"}
                className="text-lg px-4 py-1"
              >
                {item.estado}
              </Badge>
              <Badge variant="outline">{item.condicion}</Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Información Principal */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Identificación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Identificación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.numeroSerie && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Número de Serie</span>
                  <span className="font-mono font-medium">{item.numeroSerie}</span>
                </div>
              )}
              {item.codigoBarras && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Código de Barras</span>
                  <span className="font-mono">{item.codigoBarras}</span>
                </div>
              )}
              {item.imei && (
                <div className="flex justify-between">
                  <span className="text-gray-500">IMEI</span>
                  <span className="font-mono">{item.imei}</span>
                </div>
              )}
              {item.macAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-500">MAC Address</span>
                  <span className="font-mono">{item.macAddress}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.sede && (
                <div>
                  <p className="text-gray-500 text-sm">Sede</p>
                  <p className="font-medium">{item.sede.nombre}</p>
                  <p className="text-sm text-gray-600">{item.sede.ciudad}</p>
                </div>
              )}
              {item.ubicacionFisica && (
                <div>
                  <p className="text-gray-500 text-sm">Ubicación Física</p>
                  <p className="font-medium">{item.ubicacionFisica}</p>
                </div>
              )}
              {item.ipAsignada && (
                <div className="flex justify-between">
                  <span className="text-gray-500">IP Asignada</span>
                  <span className="font-mono">{item.ipAsignada}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Especificaciones Técnicas */}
        {(item.nombreEquipo || item.os || item.cpu || item.memoriaGb || item.disco) && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                Especificaciones Técnicas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {item.nombreEquipo && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Nombre Equipo</span>
                    <span>{item.nombreEquipo}</span>
                  </div>
                )}
                {item.os && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Sistema Operativo</span>
                    <span>{item.os}</span>
                  </div>
                )}
                {item.cpu && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Procesador</span>
                    <span>{item.cpu}</span>
                  </div>
                )}
                {item.memoriaGb && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Memoria</span>
                    <span>{item.memoriaGb}</span>
                  </div>
                )}
                {item.disco && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Almacenamiento</span>
                    <span>{item.disco}</span>
                  </div>
                )}
                {item.password && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Password</span>
                    <span className="font-mono">{item.password}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Información de Compra y Garantía */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Información de Compra
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.costo && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Costo</span>
                  <span className="font-medium">${item.costo.toLocaleString()}</span>
                </div>
              )}
              {item.numeroFactura && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Factura</span>
                  <span>{item.numeroFactura}</span>
                </div>
              )}
              {item.proveedor && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Proveedor</span>
                  <span>{item.proveedor}</span>
                </div>
              )}
              {item.fechaCompra && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha Compra</span>
                  <span>{new Date(item.fechaCompra).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Garantía
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {item.fechaIngreso && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha Ingreso</span>
                  <span>{new Date(item.fechaIngreso).toLocaleDateString()}</span>
                </div>
              )}
              {item.garantiaHasta && (
                <div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Vence</span>
                    <span>{new Date(item.garantiaHasta).toLocaleDateString()}</span>
                  </div>
                  {new Date(item.garantiaHasta) < new Date() && (
                    <Badge variant="destructive" className="mt-2">Garantía vencida</Badge>
                  )}
                </div>
              )}
              {!item.garantiaHasta && (
                <p className="text-gray-500">Sin información de garantía</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Asignación Actual */}
        {asignacionActiva && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Asignación Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-lg">
                    {asignacionActiva.empleado?.nombre} {asignacionActiva.empleado?.apellido}
                  </p>
                  <p className="text-gray-600">{asignacionActiva.empleado?.cargo}</p>
                  <p className="text-sm text-gray-500">
                    {asignacionActiva.empleado?.departamento?.nombre}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Desde</p>
                  <p className="font-medium">{new Date(asignacionActiva.fechaAsignacion).toLocaleDateString()}</p>
                  <Badge variant="default" className="mt-2">Activa</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Periféricos */}
        {item.perifericos && item.perifericos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Periféricos Vinculados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {item.perifericos.map((per: any) => (
                  <div key={per.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{per.producto?.nombre}</p>
                      <p className="text-sm text-gray-500">
                        {per.numeroSerie || "Sin serie"}
                      </p>
                    </div>
                    <Badge variant="outline">{per.estado}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observaciones */}
        {item.observaciones && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{item.observaciones}</p>
            </CardContent>
          </Card>
        )}

        {/* QR Code */}
        {item.qrCode && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Código QR
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <img 
                src={item.qrCode} 
                alt="QR Code" 
                className="w-48 h-48 border rounded-lg"
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}