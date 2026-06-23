"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

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
interface Producto {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  categoriaId: string
  marcaId: string
  modeloId: string | null
  activo: boolean
}

export default function EditarProductoPage() {
  const params = useParams()
  const router = useRouter()
  const [producto, setProducto] = useState<Producto | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, marRes, modRes] = await Promise.all([
          fetch(`/api/productos/${params.id}`),
          fetch("/api/categorias"),
          fetch("/api/marcas"),
          fetch("/api/modelos"),
        ])
        
        const [prodResult, catResult, marResult, modResult] = await Promise.all([
          prodRes.json(),
          catRes.json(),
          marRes.json(),
          modRes.json(),
        ])
        
        if (prodResult.data) {
          setProducto(prodResult.data)
          setFormData({
            nombre: prodResult.data.nombre,
            codigo: prodResult.data.codigo,
            descripcion: prodResult.data.descripcion || "",
            categoriaId: prodResult.data.categoriaId,
            marcaId: prodResult.data.marcaId,
            modeloId: prodResult.data.modeloId || "",
            activo: prodResult.data.activo,
          })
        }
        
        if (catResult.data) setCategorias(catResult.data)
        if (marResult.data) setMarcas(marResult.data)
        if (modResult.data) setModelos(modResult.data)
      } catch (error) {
        toast.error("Error al cargar datos")
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    setIsSaving(true)
    try {
      const response = await fetch(`/api/productos/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      const result = await response.json()
      
      if (response.ok) {
        toast.success("Producto actualizado")
        router.push("/catalogos/productos")
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch (error) {
      toast.error("Error al guardar")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <p>Cargando...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!producto) {
    return (
      <DashboardLayout>
        <div className="text-center py-10">
          <p>Producto no encontrado</p>
          <Button asChild className="mt-4">
            <Link href="/catalogos/productos">Volver a la lista</Link>
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editar Producto</h1>
            <p className="text-muted-foreground">
              Modificar: {producto.nombre}
            </p>
          </div>
          <Button asChild>
            <Link href="/catalogos/productos">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a la lista
            </Link>
          </Button>
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
                  setFormData({ ...formData, categoriaId: value, marcaId: "", modeloId: "" })
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
                onValueChange={(value) => setFormData({ ...formData, marcaId: value, modeloId: "" })}
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
              <Button type="button" variant="outline" onClick={() => setIsSaving(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Guardando..." : "Actualizar Producto"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  )
}