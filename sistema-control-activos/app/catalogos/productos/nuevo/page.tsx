"use client"

import { useState } from "react"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface Categoria {
  id: string
  nombre: string
  tipo: string
}
interface Marca {
  id: string
  nombre: string
}
interface Modelo {
  id: string
  nombre: string
}

export default function NuevoProductoPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    categoriaId: "",
    marcaId: "",
    modeloId: "",
    activo: true,
  })
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchReferenceData = async () => {
    try {
      const [categoriasRes, marcasRes, modelosRes] = await Promise.all([
        fetch("/api/categorias"),
        fetch("/api/marcas"),
        fetch("/api/modelos"),
      ])
      const categoriasData = await categoriasRes.json()
      const marcasData = await marcasRes.json()
      const modelosData = await modelosRes.json()
      if (categoriasData.data) setCategorias(categoriasData.data)
      if (marcasData.data) setMarcas(marcasData.data)
      if (modelosData.data) setModelos(modelosData.data)
    } catch (error) {
      toast.error("Error al cargar datos de referencia")
    } finally {
      setIsLoading(false)
    }
  }

  // For create, we don't need to fetch existing product data
  useEffect(() => {
    fetchReferenceData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("Producto creado")
        // Reset form or redirect? We'll reset for now
        setFormData({
          nombre: "",
          codigo: "",
          descripcion: "",
          categoriaId: "",
          marcaId: "",
          modeloId: "",
          activo: true,
        })
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Nuevo Producto</h1>
            <p className="text-muted-foreground">Crear un nuevo producto en el catálogo</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="codigo">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoriaId">Categoría *</Label>
              <Select
                value={formData.categoriaId}
                onValueChange={(value) => {
                  setFormData({ ...formData, categoriaId: value })
                  // Reset marca and modelo when category changes
                  setFormData({ ...formData, marcaId: "", modeloId: "" })
                }}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.nombre} ({cat.tipo})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="marcaId">Marca *</Label>
              <Select
                value={formData.marcaId}
                onValueChange={(value) => setFormData({ ...formData, marcaId: value })}
                disabled={isLoading || !formData.categoriaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una marca" />
                </SelectTrigger>
                <SelectContent>
                  {marcas.map((marca) => (
                    <SelectItem key={marca.id} value={marca.id}>
                      {marca.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="modeloId">Modelo *</Label>
              <Select
                value={formData.modeloId}
                onValueChange={(value) => setFormData({ ...formData, modeloId: value })}
                disabled={isLoading || !formData.marcaId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un modelo" />
                </SelectTrigger>
                <SelectContent>
                  {modelos.map((modelo) => (
                    <SelectItem key={modelo.id} value={modelo.id}>
                      {modelo.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="activo">Activo</Label>
              <Input
                id="activo"
                type="checkbox"
                checked={formData.activo}
                onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  // Go back to list
                  // In a real app, we'd use router.push, but for simplicity we'll just reset
                  setFormData({
                    nombre: "",
                    codigo: "",
                    descripcion: "",
                    categoriaId: "",
                    marcaId: "",
                    modeloId: "",
                    activo: true,
                  })
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Crear Producto
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}