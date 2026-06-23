import { z } from "zod"

// Schemas de Catálogos
export const sedeSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().min(1, "El código es requerido"),
  direccion: z.string().optional(),
  ciudad: z.string().min(1, "La ciudad es requerida"),
  estado: z.string().min(1, "El estado/departamento es requerido"),
  activo: z.boolean().default(true),
})

export const departamentoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().min(1, "El código es requerido"),
  descripcion: z.string().optional(),
  sedeId: z.string().uuid("Seleccione una sede válida"),
  activo: z.boolean().default(true),
})

export const categoriaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().min(1, "El código es requerido"),
  descripcion: z.string().optional(),
  tipo: z.string().min(1, "El tipo es requerido"),
  esDepreciable: z.boolean().default(false),
  vidaUtilMeses: z.number().int().positive().optional().nullable(),
  activo: z.boolean().default(true),
})

export const marcaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().min(1, "El código es requerido"),
  descripcion: z.string().optional(),
  activo: z.boolean().default(true),
})

export const modeloSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().min(1, "El código es requerido"),
  descripcion: z.string().optional(),
  marcaId: z.string().uuid("Seleccione una marca válida"),
  categoriaId: z.string().uuid("Seleccione una categoría válida"),
  activo: z.boolean().default(true),
})

// Schema de Empleados
export const empleadoSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  cedula: z.string().min(1, "La cédula es requerida"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  email: z.string().email("Email inválido"),
  telefono: z.string().optional(),
  extension: z.string().optional(),
  cargo: z.string().min(1, "El cargo es requerido"),
  sedeId: z.string().uuid("Seleccione una sede válida"),
  departamentoId: z.string().uuid("Seleccione un departamento válido"),
  ubicacion: z.string().optional(),
  fechaIngreso: z.string().datetime().optional().nullable(),
  activo: z.boolean().default(true),
})

// Schema de Usuarios
export const usuarioSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellido: z.string().min(1, "El apellido es requerido"),
  rolId: z.string().uuid("Seleccione un rol válido"),
  empleadoId: z.string().uuid().optional().nullable(),
  activo: z.boolean().default(true),
})

// Schema de Stock Items
export const stockItemSchema = z.object({
  codigoBarras: z.string().optional(),
  qrCode: z.string().optional(),
  productoId: z.string().uuid("Seleccione un producto válido"),
  numeroSerie: z.string().optional(),
  imei: z.string().optional(),
  macAddress: z.string().optional(),
  sedeId: z.string().uuid().optional().nullable(),
  ubicacionFisica: z.string().optional(),
  estado: z.enum(["DISPONIBLE", "ASIGNADO", "EN_REPARACION", "EN_DESPACHO", "DADO_BAJA", "EN_TRANSITO", "RESERVADO"]),
  condicion: z.enum(["NUEVO", "USADO_BUENO", "USADO_REGULAR", "MALO", "EN_REPARACION", "OBSOLETO"]),
  fechaIngreso: z.string().datetime().optional(),
  fechaCompra: z.string().datetime().optional().nullable(),
  numeroFactura: z.string().optional(),
  costo: z.number().min(0).optional().nullable(),
  proveedor: z.string().optional(),
  garantiaHasta: z.string().datetime().optional().nullable(),
  nombreEquipo: z.string().optional(),
  os: z.string().optional(),
  cpu: z.string().optional(),
  memoriaGb: z.string().optional(),
  disco: z.string().optional(),
  ipAsignada: z.string().optional(),
  password: z.string().optional(),
  observaciones: z.string().optional(),
  equipoPadreId: z.string().uuid().optional().nullable(),
})
