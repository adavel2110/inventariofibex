"use client"

import { useState, useEffect } from "react"
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
import { Plus, Pencil, Trash2, Box } from "lucide-react"

interface Producto {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  categoriaId: string
  marcaId: string
  modeloId: string
  activo: boolean
  categoria?: {
    nombre: string
    tipo: string
  }
  marca?: {
    nombre: string
  }
  modelo?: {
    nombre: string
  }
  _count?: {
    stockItems: number
  }
}

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Producto | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    categoriaId: "",
    marcaId: "",
    modeloId: "",
    activo: true,
  })
  const [categorias, setCategorias] = useState<Array<{id: string; nombre: string; tipo: string}>>([])
  const [marcas, setMarcas] = useState<Array<{id: string; nombre: string}>>([])
  const [modelos, setModelos] = useState<Array<{id: string; nombre: string}>>([])

  const fetchData = async () => {
    try {
      const [productosRes, categoriasRes, marcasRes, modelosRes] = await Promise.all([
        fetch("/api/productos"),
        fetch("/api/categorias"),
        fetch("/api/marcas"),
        fetch("/api/modelos"),
      ])
      const productosData = await productosRes.json()
      const categoriasData = await categoriasRes.json()
      const marcasData = await marcasRes.json()
      const modelosData = await modelosRes.json()
      if (productosData.data) setProductos(productosData.data)
      if (categoriasData.data) setCategorias(categoriasData.data)
      if (marcasData.data) setMarcas(marcasData.data)
      if (modelosData.data) setModelos(modelosData.data)
    } catch (error) {
      toast.error("Error al cargar productos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editing ? `/api/productos/${editing.id}` : "/api/productos"
      const method = editing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editing ? "Producto actualizado" : "Producto creado")
        setIsDialogOpen(false)
        setEditing(null)
        resetForm()
        fetchData()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch (error) {
      toast.error("Error al guardar")
    }
  }

  const resetForm = () => {
    setFormData({
      nombre: "",
      codigo: "",
      descripcion: "",
      categoriaId: "",
      marcaId: "",
      modeloId: "",
      activo: true,
    })
  }

  const handleEdit = (prod: Producto) => {
    setEditing(prod)
    setFormData({
      nombre: prod.nombre,
      codigo: prod.codigo,
      descripcion: prod.descripcion || "",
      categoriaId: prod.categoriaId,
      marcaId: prod.marcaId,
      modeloId: prod.modeloId,
      activo: prod.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este producto?")) return
    try {
      const response = await fetch(`/api/productos/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Producto eliminado")
        fetchData()
      } else {
        toast.error("Error al eliminar")
      }
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Productos</h1>
            <p className="text-muted-foreground">Gestión de productos del inventario</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); resetForm(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg shadow-lg p-6">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Producto" : "Nuevo Producto"}</DialogTitle>
              </DialogHeader>
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
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editing ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              Lista de Productos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p>Cargando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Modelo</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {productos.map((prod) => (
                    <TableRow key={prod.id}>
                      <TableCell className="font-medium">{prod.codigo}</TableCell>
                      <TableCell>{prod.nombre}</TableCell>
                      <TableCell>
                        {prod.categoria ? (
                          <>
                            {prod.categoria.nombre} <br />
                            <span className="text-xs text-muted-foreground">{prod.categoria.tipo}</span>
                          </>
                        ) : "-"}
                      </TableCell>
                      <TableCell>{prod.marca ? prod.marca.nombre : "-"}</TableCell>
                      <TableCell>{prod.modelo ? prod.modelo.nombre : "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{prod._count?.stockItems || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={prod.activo ? "default" : "secondary"}>
                          {prod.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(prod)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(prod.id)}>
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