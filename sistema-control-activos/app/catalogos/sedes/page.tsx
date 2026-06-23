"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/app/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Plus, Pencil, Trash2, Building2 } from "lucide-react"

interface Sede {
  id: string
  nombre: string
  codigo: string
  direccion: string | null
  ciudad: string | null
  telefono: string | null
  email: string | null
  activo: boolean
  _count?: {
    departamentos: number
    empleados: number
  }
}

export default function SedesPage() {
  const [sedes, setSedes] = useState<Sede[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSede, setEditingSede] = useState<Sede | null>(null)
  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    direccion: "",
    ciudad: "",
    telefono: "",
    email: "",
    activo: true,
  })

  const fetchSedes = async () => {
    try {
      const response = await fetch("/api/sedes")
      const result = await response.json()
      if (result.data) {
        setSedes(result.data)
      }
    } catch (error) {
      toast.error("Error al cargar sedes")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSedes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingSede ? `/api/sedes/${editingSede.id}` : "/api/sedes"
      const method = editingSede ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editingSede ? "Sede actualizada" : "Sede creada")
        setIsDialogOpen(false)
        setEditingSede(null)
        setFormData({
          nombre: "",
          codigo: "",
          direccion: "",
          ciudad: "",
          telefono: "",
          email: "",
          activo: true,
        })
        fetchSedes()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch (error) {
      toast.error("Error al guardar sede")
    }
  }

  const handleEdit = (sede: Sede) => {
    setEditingSede(sede)
    setFormData({
      nombre: sede.nombre,
      codigo: sede.codigo,
      direccion: sede.direccion || "",
      ciudad: sede.ciudad || "",
      telefono: sede.telefono || "",
      email: sede.email || "",
      activo: sede.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar esta sede?")) return

    try {
      const response = await fetch(`/api/sedes/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Sede eliminada")
        fetchSedes()
      } else {
        toast.error("Error al eliminar")
      }
    } catch (error) {
      toast.error("Error al eliminar sede")
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sedes</h1>
            <p className="text-muted-foreground">Gestión de sedes y ubicaciones</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingSede(null)
                setFormData({
                  nombre: "",
                  codigo: "",
                  direccion: "",
                  ciudad: "",
                  telefono: "",
                  email: "",
                  activo: true,
                })
              }}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Sede
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-lg shadow-lg p-6">
              <DialogHeader>
                <DialogTitle>{editingSede ? "Editar Sede" : "Nueva Sede"}</DialogTitle>
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
                  <Label htmlFor="direccion">Dirección</Label>
                  <Input
                    id="direccion"
                    value={formData.direccion}
                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ciudad">Ciudad</Label>
                  <Input
                    id="ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingSede ? "Actualizar" : "Crear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Lista de Sedes
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
                    <TableHead>Ciudad</TableHead>
                    <TableHead>Departamentos</TableHead>
                    <TableHead>Empleados</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sedes.map((sede) => (
                    <TableRow key={sede.id}>
                      <TableCell className="font-medium">{sede.codigo}</TableCell>
                      <TableCell>{sede.nombre}</TableCell>
                      <TableCell>{sede.ciudad || "-"}</TableCell>
                      <TableCell>{sede._count?.departamentos || 0}</TableCell>
                      <TableCell>{sede._count?.empleados || 0}</TableCell>
                      <TableCell>
                        <Badge variant={sede.activo ? "default" : "secondary"}>
                          {sede.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(sede)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(sede.id)}>
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
