"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { ArrowLeft, Save, Package, AlertCircle } from "lucide-react"
import Link from "next/link"

interface Producto {
  id: string
  nombre: string
  codigo: string
  modelo: { id: string; nombre: string; marca: { id: string; nombre: string } } | null
  categoria: { id: string; nombre: string }
}

interface Sede {
  id: string
  nombre: string
}

interface ErrorField {
  field: string
  message: string
}

const estados = [
  { value: "DISPONIBLE", label: "Disponible" },
  { value: "ASIGNADO", label: "Asignado" },
  { value: "EN_REPARACION", label: "En Reparación" },
  { value: "EN_DESPACHO", label: "En Despacho" },
  { value: "DADO_BAJA", label: "Dado de Baja" },
  { value: "EN_TRANSITO", label: "En Tránsito" },
  { value: "RESERVADO", label: "Reservado" },
]

const condiciones = [
  { value: "NUEVO", label: "Nuevo" },
  { value: "USADO_BUENO", label: "Usado - Bueno" },
  { value: "USADO_REGULAR", label: "Usado - Regular" },
  { value: "MALO", label: "Malo" },
  { value: "EN_REPARACION", label: "En Reparación" },
  { value: "OBSOLETO", label: "Obsoleto" },
]

function validateMAC(mac: string): boolean {
  const macRegex = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/
  return macRegex.test(mac)
}

function validateIP(ip: string): boolean {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/
  if (!ipRegex.test(ip)) return false
  const parts = ip.split(".")
  return parts.every(part => parseInt(part) >= 0 && parseInt(part) <= 255)
}

function validateIMEI(imei: string): boolean {
  return /^\d{15}$/.test(imei)
}

export default function NuevoEquipoPage() {
  const router = useRouter()
  const [productos, setProductos] = useState<Producto[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<ErrorField[]>([])

  const [formData, setFormData] = useState({
    productoId: "",
    numeroSerie: "",
    imei: "",
    macAddress: "",
    sedeId: "",
    ubicacionFisica: "",
    estado: "DISPONIBLE",
    condicion: "NUEVO",
    fechaCompra: "",
    numeroFactura: "",
    costo: "",
    proveedor: "",
    garantiaHasta: "",
    nombreEquipo: "",
    os: "",
    cpu: "",
    memoriaGb: "",
    disco: "",
    ipAsignada: "",
    password: "",
    observaciones: "",
  })
  const [categorias, setCategorias] = useState<Array<{id: string; nombre: string; tipo: string}>>([])
  const [marcas, setMarcas] = useState<Array<{id: string; nombre: string}>>([])
  const [modelos, setModelos] = useState<Array<{id: string; nombre: string; marcaId: string}>>([])
  const [filteredProductos, setFilteredProductos] = useState<Producto[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar categorías, sedes y productos iniciales
        const [catRes, sedeRes, prodRes] = await Promise.all([
          fetch("/api/categorias"),
          fetch("/api/sedes"),
          fetch("/api/productos"),
        ])
        const [catResult, sedeResult, prodResult] = await Promise.all([
          catRes.json(),
          sedeRes.json(),
          prodRes.json(),
        ])
        if (catResult.data) setCategorias(catResult.data)
        if (sedeResult.data) setSedes(sedeResult.data)
        if (prodResult.data) {
          setProductos(prodResult.data)
          // Inicialmente mostrar todos los productos
          setFilteredProductos(prodResult.data)
          // Extraer marcas y modelos únicos de todos los productos
          const uniqueMarcas = Array.from(
            new Map(
              prodResult.data
                .map(p => p.modelo?.marca)
                .filter((marca): marca is { id: string; nombre: string } => marca !== null)
                .map(marca => [marca.id, marca])
            ).values()
          )
          setMarcas(uniqueMarcas)
          
          const uniqueModelos = Array.from(
            new Map(
              prodResult.data
                .map(p => p.modelo)
                .filter((modelo): modelo is { id: string; nombre: string; marcaId: string } => modelo !== null)
                .map(modelo => [modelo.id, { ...modelo, marcaId: modelo.marcaId }])
            ).values()
          )
          setModelos(uniqueModelos)
        }
      } catch (error) {
        toast.error("Error al cargar datos")
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const getError = (field: string): string | undefined => {
    return errors.find(e => e.field === field)?.message
  }

  const hasError = (field: string): boolean => {
    return errors.some(e => e.field === field)
  }

  const validateForm = (): boolean => {
    const newErrors: ErrorField[] = []

    if (!formData.productoId) {
      newErrors.push({ field: "productoId", message: "Debe seleccionar un producto" })
    }

    if (formData.macAddress && !validateMAC(formData.macAddress)) {
      newErrors.push({ field: "macAddress", message: "Formato inválido (ej: XX:XX:XX:XX:XX:XX)" })
    }

    if (formData.ipAsignada && !validateIP(formData.ipAsignada)) {
      newErrors.push({ field: "ipAsignada", message: "IP inválida (ej: 192.168.1.1)" })
    }

    if (formData.imei && !validateIMEI(formData.imei)) {
      newErrors.push({ field: "imei", message: "IMEI debe tener 15 dígitos" })
    }

    if (formData.costo && isNaN(parseFloat(formData.costo))) {
      newErrors.push({ field: "costo", message: "Costo debe ser un número válido" })
    }

    if (formData.garantiaHasta && formData.fechaCompra && new Date(formData.garantiaHasta) < new Date(formData.fechaCompra)) {
      newErrors.push({ field: "garantiaHasta", message: "La garantía no puede ser anterior a la compra" })
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast.error("Complete los campos requeridos correctamente")
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        ...formData,
        costo: formData.costo ? parseFloat(formData.costo) : null,
      }

      const response = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Equipo creado exitosamente")
        router.push("/inventario")
      } else {
        toast.error(result.error || "Error al crear equipo")
      }
    } catch (error) {
      toast.error("Error al crear equipo")
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value })
    setErrors(errors.filter(e => e.field !== field))
    
    // Cuando cambiamos la categoría, actualizamos las marcas disponibles
    if (field === "categoriaId") {
      // Reset marca, modelo y producto
      setFormData({ ...formData, marcaId: "", modeloId: "", productoId: "" })
      // Filtrar marcas por categoría seleccionada
      if (value) {
        const filteredMarcas = marcas.filter(marca => 
          // Necesitamos obtener las marcas a través de los modelos de la categoría
          // Pero como no tenemos esa relación directa, vamos a obtener todos los productos
          // de esta categoría y extraer sus marcas
          productos.some(p => 
            p.categoriaId === value && 
            p.modelo?.marca?.id === marca.id
          )
        )
        setMarcas(filteredMarcas)
        setModelos([]) // Reset modelos
        setFilteredProductos([]) // Reset productos filtrados
      } else {
        // Si no hay categoría, mostrar todas las marcas
        setMarcas(marcas)
      }
    }
    
    // Cuando cambiamos la marca, actualizamos los modelos disponibles
    if (field === "marcaId") {
      // Reset modelo y producto
      setFormData({ ...formData, modeloId: "", productoId: "" })
      // Filtrar modelos por marca seleccionada
      if (value) {
        const filteredModelos = modelos.filter(modelo => modelo.marcaId === value)
        setModelos(filteredModelos)
        setFilteredProductos([]) // Reset productos filtrados
      } else {
        // Si no hay marca, mostrar todos los modelos
        setModelos(modelos)
      }
    }
    
    // Cuando cambiamos el modelo, actualizamos los productos disponibles
    if (field === "modeloId") {
      // Reset producto
      setFormData({ ...formData, productoId: "" })
      // Filtrar productos por modelo seleccionado
      if (value) {
        const filteredProductos = productos.filter(p => p.modeloId === value)
        setFilteredProductos(filteredProductos)
      } else {
        // Si no hay modelo, mostrar productos filtrados por marca (o todos si no hay marca)
        if (formData.marcaId) {
          const filteredProductos = productos.filter(p => 
            p.modelo?.marca?.id === formData.marcaId
          )
          setFilteredProductos(filteredProductos)
        } else {
          setFilteredProductos(productos) // Mostrar todos
        }
      }
    }
  }

  const fieldClass = (field: string) => 
    hasError(field) ? "border-red-500 ring-1 ring-red-500" : ""

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p>Cargando...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/inventario">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Nuevo Equipo</h1>
            <p className="text-muted-foreground">Agregar un nuevo equipo al inventario</p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <div>
              <p className="font-medium text-red-700">Errores en el formulario</p>
              <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
                {errors.map((err, idx) => (
                  <li key={idx}>{err.message}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Información del Equipo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productoId">
                    Producto <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.productoId}
                    onValueChange={(v) => handleChange("productoId", v)}
                  >
                    <SelectTrigger className={fieldClass("productoId")}>
                      <SelectValue placeholder="Seleccione un producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredProductos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nombre} ({p.modelo?.marca?.nombre} - {p.modelo?.nombre || "Sin modelo"})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {hasError("productoId") && (
                    <p className="text-sm text-red-500">{getError("productoId")}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Select
                      value={formData.estado}
                      onValueChange={(v) => handleChange("estado", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {estados.map((e) => (
                          <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="condicion">Condición</Label>
                    <Select
                      value={formData.condicion}
                      onValueChange={(v) => handleChange("condicion", v)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {condiciones.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nombreEquipo">Nombre del Equipo</Label>
                  <Input
                    id="nombreEquipo"
                    value={formData.nombreEquipo}
                    onChange={(e) => handleChange("nombreEquipo", e.target.value)}
                    placeholder="Nombre personalizado"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="numeroSerie">Número de Serie</Label>
                    <Input
                      id="numeroSerie"
                      value={formData.numeroSerie}
                      onChange={(e) => handleChange("numeroSerie", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imei">IMEI</Label>
                    <Input
                      id="imei"
                      value={formData.imei}
                      onChange={(e) => handleChange("imei", e.target.value)}
                      className={fieldClass("imei")}
                      placeholder="15 dígitos"
                    />
                    {hasError("imei") && (
                      <p className="text-sm text-red-500">{getError("imei")}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="macAddress">Dirección MAC</Label>
                  <Input
                    id="macAddress"
                    value={formData.macAddress}
                    onChange={(e) => handleChange("macAddress", e.target.value)}
                    className={fieldClass("macAddress")}
                    placeholder="XX:XX:XX:XX:XX:XX"
                  />
                  {hasError("macAddress") && (
                    <p className="text-sm text-red-500">{getError("macAddress")}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ubicación y Asignación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sedeId">Sede</Label>
                  <Select
                    value={formData.sedeId}
                    onValueChange={(v) => handleChange("sedeId", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {sedes.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ubicacionFisica">Ubicación Física</Label>
                  <Input
                    id="ubicacionFisica"
                    value={formData.ubicacionFisica}
                    onChange={(e) => handleChange("ubicacionFisica", e.target.value)}
                    placeholder="Edificio, piso, oficina"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ipAsignada">IP Asignada</Label>
                  <Input
                    id="ipAsignada"
                    value={formData.ipAsignada}
                    onChange={(e) => handleChange("ipAsignada", e.target.value)}
                    className={fieldClass("ipAsignada")}
                    placeholder="192.168.1.x"
                  />
                  {hasError("ipAsignada") && (
                    <p className="text-sm text-red-500">{getError("ipAsignada")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Especificaciones Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="os">Sistema Operativo</Label>
                  <Input
                    id="os"
                    value={formData.os}
                    onChange={(e) => handleChange("os", e.target.value)}
                    placeholder="Windows 11, Ubuntu, etc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpu">Procesador</Label>
                  <Input
                    id="cpu"
                    value={formData.cpu}
                    onChange={(e) => handleChange("cpu", e.target.value)}
                    placeholder="Intel Core i7, AMD Ryzen 5"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memoriaGb">Memoria RAM</Label>
                  <Input
                    id="memoriaGb"
                    value={formData.memoriaGb}
                    onChange={(e) => handleChange("memoriaGb", e.target.value)}
                    placeholder="16 GB"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="disco">Almacenamiento</Label>
                  <Input
                    id="disco"
                    value={formData.disco}
                    onChange={(e) => handleChange("disco", e.target.value)}
                    placeholder="512 GB SSD"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de Compra</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fechaCompra">Fecha de Compra</Label>
                  <Input
                    id="fechaCompra"
                    type="date"
                    value={formData.fechaCompra}
                    onChange={(e) => handleChange("fechaCompra", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numeroFactura">Número de Factura</Label>
                  <Input
                    id="numeroFactura"
                    value={formData.numeroFactura}
                    onChange={(e) => handleChange("numeroFactura", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="costo">Costo</Label>
                  <Input
                    id="costo"
                    type="number"
                    step="0.01"
                    value={formData.costo}
                    onChange={(e) => handleChange("costo", e.target.value)}
                    className={fieldClass("costo")}
                    placeholder="0.00"
                  />
                  {hasError("costo") && (
                    <p className="text-sm text-red-500">{getError("costo")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proveedor">Proveedor</Label>
                  <Input
                    id="proveedor"
                    value={formData.proveedor}
                    onChange={(e) => handleChange("proveedor", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="garantiaHasta">Garantía Hasta</Label>
                  <Input
                    id="garantiaHasta"
                    type="date"
                    value={formData.garantiaHasta}
                    onChange={(e) => handleChange("garantiaHasta", e.target.value)}
                    className={fieldClass("garantiaHasta")}
                  />
                  {hasError("garantiaHasta") && (
                    <p className="text-sm text-red-500">{getError("garantiaHasta")}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones">Observaciones</Label>
                  <Textarea
                    id="observaciones"
                    value={formData.observaciones}
                    onChange={(e) => handleChange("observaciones", e.target.value)}
                    placeholder="Notas adicionales sobre el equipo"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" asChild>
              <Link href="/inventario">Cancelar</Link>
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Guardando..." : "Crear Equipo"}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}