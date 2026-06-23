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
import { Plus, Pencil, Trash2, MousePointer2 } from "lucide-react"

interface Modelo {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  marcaId: string
  categoriaId: string
  activo: boolean
  marca: {
    id: string
    nombre: string
  }
  categoria: {
    id: string
    nombre: string
  }
  _count?: {
    productos: number
  }
}

interface Marca {
  id: string
  nombre: string
}

interface Categoria {
  id: string
  nombre: string
}

export default function ModelosPage() {
  const [modelos, setModelos] = useState<Modelo[]>([])
  const [marcas, setMarcas] = useState<Marca[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Modelo | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    marcaId: "",
    categoriaId: "",
    activo: true,
  })

  const fetchData = async () => {
    try {
      const [modelosRes, marcasRes, catRes] = await Promise.all([
        fetch("/api/modelos"),
        fetch("/api/marcas"),
        fetch("/api/categorias"),
      ])
      const [modelosResult, marcasResult, catResult] = await Promise.all([
        modelosRes.json(),
        marcasRes.json(),
        catRes.json(),
      ])
      if (modelosResult.data) setModelos(modelosResult.data)
      if (marcasResult.data) setMarcas(marcasResult.data)
      if (catResult.data) setCategorias(catResult.data)
    } catch (error) {
      toast.error("Error al cargar datos")
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
      const url = editing ? `/api/modelos/${editing.id}` : "/api/modelos"
      const method = editing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editing ? "Modelo actualizado" : "Modelo creado")
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
      marcaId: "",
      categoriaId: "",
      activo: true,
    })
  }

  const handleEdit = (modelo: Modelo) => {
    setEditing(modelo)
    setFormData({
      nombre: modelo.nombre,
      codigo: modelo.codigo,
      descripcion: modelo.descripcion || "",
      marcaId: modelo.marcaId,
      categoriaId: modelo.categoriaId,
      activo: modelo.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este modelo?")) return

    try {
      const response = await fetch(`/api/modelos/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Modelo eliminado")
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
            <h1 className="text-3xl font-bold">Modelos</h1>
            <p className="text-muted-foreground">Gestión de modelos de equipos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); resetForm(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Modelo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg shadow-lg p-6">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Modelo" : "Nuevo Modelo"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigo">Código *</Label>
                  <Input
                    id="codigo"
                    value={formData.codigo}
                    onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="marca">Marca *</Label>
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
                  <Label htmlFor="categoria">Categoría *</Label>
                  <Select
                    value={formData.categoriaId}
                    onValueChange={(value) => setFormData({ ...formData, categoriaId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
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
              <MousePointer2 className="h-5 w-5" />
              Lista de Modelos
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
                    <TableHead>Marca</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelos.map((modelo) => (
                    <TableRow key={modelo.id}>
                      <TableCell className="font-medium">{modelo.codigo}</TableCell>
                      <TableCell>{modelo.nombre}</TableCell>
                      <TableCell>{modelo.marca.nombre}</TableCell>
                      <TableCell>{modelo.categoria.nombre}</TableCell>
                      <TableCell>{modelo._count?.productos || 0}</TableCell>
                      <TableCell>
                        <Badge variant={modelo.activo ? "default" : "secondary"}>
                          {modelo.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(modelo)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(modelo.id)}>
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
