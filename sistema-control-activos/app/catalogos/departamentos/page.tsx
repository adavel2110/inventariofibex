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
import { Plus, Pencil, Trash2, MapPin } from "lucide-react"

interface Departamento {
  id: string
  nombre: string
  codigo: string
  descripcion: string | null
  sedeId: string
  activo: boolean
  sede: {
    id: string
    nombre: string
  }
  _count?: {
    empleados: number
  }
}

interface Sede {
  id: string
  nombre: string
}

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Departamento | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    descripcion: "",
    sedeId: "",
    activo: true,
  })

  const fetchData = async () => {
    try {
      const [deptRes, sedesRes] = await Promise.all([
        fetch("/api/departamentos"),
        fetch("/api/sedes"),
      ])
      const [deptResult, sedesResult] = await Promise.all([deptRes.json(), sedesRes.json()])
      if (deptResult.data) setDepartamentos(deptResult.data)
      if (sedesResult.data) setSedes(sedesResult.data)
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
      const url = editing ? `/api/departamentos/${editing.id}` : "/api/departamentos"
      const method = editing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editing ? "Departamento actualizado" : "Departamento creado")
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
      sedeId: "",
      activo: true,
    })
  }

  const handleEdit = (dept: Departamento) => {
    setEditing(dept)
    setFormData({
      nombre: dept.nombre,
      codigo: dept.codigo,
      descripcion: dept.descripcion || "",
      sedeId: dept.sedeId,
      activo: dept.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este departamento?")) return

    try {
      const response = await fetch(`/api/departamentos/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Departamento eliminado")
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
            <h1 className="text-3xl font-bold">Departamentos</h1>
            <p className="text-muted-foreground">Gestión de departamentos por sede</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); resetForm(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Departamento" : "Nuevo Departamento"}</DialogTitle>
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
                  <Label htmlFor="sede">Sede *</Label>
                  <Select
                    value={formData.sedeId}
                    onValueChange={(value) => setFormData({ ...formData, sedeId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione una sede" />
                    </SelectTrigger>
                    <SelectContent>
                      {sedes.map((sede) => (
                        <SelectItem key={sede.id} value={sede.id}>
                          {sede.nombre}
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
              <MapPin className="h-5 w-5" />
              Lista de Departamentos
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
                    <TableHead>Sede</TableHead>
                    <TableHead>Empleados</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {departamentos.map((dept) => (
                    <TableRow key={dept.id}>
                      <TableCell className="font-medium">{dept.codigo}</TableCell>
                      <TableCell>{dept.nombre}</TableCell>
                      <TableCell>{dept.sede.nombre}</TableCell>
                      <TableCell>{dept._count?.empleados || 0}</TableCell>
                      <TableCell>
                        <Badge variant={dept.activo ? "default" : "secondary"}>
                          {dept.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(dept)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(dept.id)}>
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
