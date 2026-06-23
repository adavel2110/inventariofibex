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
import { Plus, Pencil, Trash2, Users, Search } from "lucide-react"
import Link from "next/link"

interface Empleado {
  id: string
  codigo: string
  cedula: string
  nombre: string
  apellido: string
  email: string
  cargo: string
  telefono: string | null
  activo: boolean
  sede: { id: string; nombre: string }
  departamento: { id: string; nombre: string }
  usuario?: { id: string; email: string }
  _count?: { asignaciones: number }
}

interface Sede {
  id: string
  nombre: string
}

interface Departamento {
  id: string
  nombre: string
  sedeId: string
}

export default function EmpleadosPage() {
  const [empleados, setEmpleados] = useState<Empleado[]>([])
  const [sedes, setSedes] = useState<Sede[]>([])
  const [departamentos, setDepartamentos] = useState<Departamento[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Empleado | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [formData, setFormData] = useState({
    codigo: "",
    cedula: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    extension: "",
    cargo: "",
    sedeId: "",
    departamentoId: "",
    ubicacion: "",
    activo: true,
  })

  const fetchData = async () => {
    try {
      const [empRes, sedesRes, deptRes] = await Promise.all([
        fetch("/api/empleados"),
        fetch("/api/sedes"),
        fetch("/api/departamentos"),
      ])
      const [empResult, sedesResult, deptResult] = await Promise.all([
        empRes.json(),
        sedesRes.json(),
        deptRes.json(),
      ])
      if (empResult.data) setEmpleados(empResult.data)
      if (sedesResult.data) setSedes(sedesResult.data)
      if (deptResult.data) setDepartamentos(deptResult.data)
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
      const url = editing ? `/api/empleados/${editing.id}` : "/api/empleados"
      const method = editing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(editing ? "Empleado actualizado" : "Empleado creado")
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
      codigo: "",
      cedula: "",
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      extension: "",
      cargo: "",
      sedeId: "",
      departamentoId: "",
      ubicacion: "",
      activo: true,
    })
  }

  const handleEdit = (emp: Empleado) => {
    setEditing(emp)
    setFormData({
      codigo: emp.codigo,
      cedula: emp.cedula,
      nombre: emp.nombre,
      apellido: emp.apellido,
      email: emp.email,
      telefono: emp.telefono || "",
      extension: "",
      cargo: emp.cargo,
      sedeId: emp.sede.id,
      departamentoId: emp.departamento.id,
      ubicacion: "",
      activo: emp.activo,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este empleado?")) return

    try {
      const response = await fetch(`/api/empleados/${id}`, { method: "DELETE" })
      if (response.ok) {
        toast.success("Empleado eliminado")
        fetchData()
      } else {
        toast.error("Error al eliminar")
      }
    } catch (error) {
      toast.error("Error al eliminar")
    }
  }

  const filteredEmpleados = empleados.filter((emp) =>
    `${emp.nombre} ${emp.apellido} ${emp.email} ${emp.cedula}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  )

  const filteredDepartamentos = departamentos.filter(
    (d) => d.sedeId === formData.sedeId
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Empleados</h1>
            <p className="text-muted-foreground">Gestión del personal y asignaciones</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { setEditing(null); resetForm(); }}>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Empleado
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editing ? "Editar Empleado" : "Nuevo Empleado"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="cedula">Cédula *</Label>
                    <Input
                      id="cedula"
                      value={formData.cedula}
                      onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
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
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cargo">Cargo *</Label>
                    <Input
                      id="cargo"
                      value={formData.cargo}
                      onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sede">Sede *</Label>
                    <Select
                      value={formData.sedeId}
                      onValueChange={(value) => {
                        setFormData({ ...formData, sedeId: value, departamentoId: "" })
                      }}
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
                    <Label htmlFor="departamento">Departamento *</Label>
                    <Select
                      value={formData.departamentoId}
                      onValueChange={(value) => setFormData({ ...formData, departamentoId: value })}
                      disabled={!formData.sedeId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un departamento" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredDepartamentos.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.nombre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
              <Users className="h-5 w-5" />
              Lista de Empleados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o cédula..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            {isLoading ? (
              <p>Cargando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Equipos</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmpleados.map((emp) => (
                    <TableRow key={emp.id}>
                      <TableCell className="font-medium">{emp.codigo}</TableCell>
                      <TableCell>
                        <Link href={`/empleados/${emp.id}`} className="hover:underline">
                          {emp.nombre} {emp.apellido}
                        </Link>
                      </TableCell>
                      <TableCell>{emp.email}</TableCell>
                      <TableCell>{emp.cargo}</TableCell>
                      <TableCell>{emp.departamento.nombre}</TableCell>
                      <TableCell>{emp._count?.asignaciones || 0}</TableCell>
                      <TableCell>
                        <Badge variant={emp.activo ? "default" : "secondary"}>
                          {emp.activo ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(emp)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(emp.id)}>
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
