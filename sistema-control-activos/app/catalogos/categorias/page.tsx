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
import { Plus, Pencil, Trash2, Tags } from "lucide-react"

interface Categoria {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  tipo: string
  activo: boolean
  _count?: {
    productos: number
  }
}

const tipos = ["EQUIPO_COMPUTO", "PERIFERICO", "CONSUMIBLE", "ACCESORIO", "COMUNICACION", "SEGURIDAD", "OTRO"]

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Categoria | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    tipo: "EQUIPO",
    activo: true,
  })

  const fetchData = async () => {
    try {
      const response = await fetch("/api/categorias")
      const result = await response.json()
      if (result.data) setCategorias(result.data)
    } catch (error) {
      toast.error("Error al cargar categorías")
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
      const url = editing ? `/api/categorias/${editing.id}` : "/api/categorias"
      const method = editing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editing ? "Categoría actualizada" : "Categoría creada")
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
      tipo: "EQUIPO",
      activo: true,
    })
  }

  const handleEdit = (cat: Categoria) => {
    setEditing(cat)
    setFormData({
      nombre: cat.nombre,
      codigo: cat.codigo,
      descripcion: cat.descripcion || "",
      tipo: cat.tipo,
      activo: cat.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta categoría?")) return

    try {
      const response = await fetch(`/api/categorias/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Categoría eliminada")
        fetchData()
      } else {
        toast.error("Error al eliminar")
      }
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const getTipoBadge = (tipo: string) => {
    const variants: Record<string, any> = {
      EQUIPO_COMPUTO: "default",
      PERIFERICO: "secondary",
      CONSUMIBLE: "outline",
      ACCESORIO: "secondary",
      COMUNICACION: "outline",
      SEGURIDAD: "destructive",
      OTRO: "outline",
    }
    return <Badge variant={variants[tipo] || "default"}>{tipo.replace("_", " ")}</Badge>
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Categorías</h1>
            <p className="text-muted-foreground">Gestión de categorías de productos</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); resetForm(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg shadow-lg p-6">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
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
                  <Label htmlFor="tipo">Tipo *</Label>
                  <Select
                    value={formData.tipo}
                    onValueChange={(value) => setFormData({ ...formData, tipo: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((tipo) => (
                        <SelectItem key={tipo} value={tipo}>
                          {tipo}
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
              <Tags className="h-5 w-5" />
              Lista de Categorías
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
                    <TableHead>Tipo</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categorias.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium">{cat.codigo}</TableCell>
                      <TableCell>{cat.nombre}</TableCell>
                      <TableCell>{getTipoBadge(cat.tipo)}</TableCell>
                      <TableCell>{cat._count?.productos || 0}</TableCell>
                      <TableCell>
                        <Badge variant={cat.activo ? "default" : "secondary"}>
                          {cat.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(cat)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(cat.id)}>
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
