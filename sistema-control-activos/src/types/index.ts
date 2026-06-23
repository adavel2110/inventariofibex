import { 
  Usuario, 
  Rol, 
  Empleado, 
  Departamento, 
  Sede,
  Categoria,
  Producto,
  Marca,
  Modelo,
  StockItem,
  Asignacion,
  Despacho,
  DespachoItem,
  Mantenimiento,
  Auditoria,
  Configuracion
} from '@prisma/client'

// Re-exportamos los tipos de Prisma
export type {
  Usuario,
  Rol,
  Empleado,
  Departamento,
  Sede,
  Categoria,
  Producto,
  Marca,
  Modelo,
  StockItem,
  Asignacion,
  Despacho,
  DespachoItem,
  Mantenimiento,
  Auditoria,
  Configuracion
}

// Enums exportados
export {
  EstadoStock,
  CondicionEquipo,
  EstadoAsignacion,
  TipoMantenimiento,
  TipoDespacho,
  EstadoDespacho,
  PrioridadDespacho,
  TipoAccionAuditoria
} from '@prisma/client'

// Tipos personalizados para la aplicación
export interface SessionUser {
  id: string
  email: string
  nombre: string
  apellido: string
  avatar?: string
  rol: {
    id: string
    codigo: string
    nombre: string
    permisos: string[]
  }
  empleado?: {
    id: string
    codigo: string
    cedula: string
  }
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface QueryParams {
  page?: number
  limit?: number
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  filter?: Record<string, unknown>
}

export interface StockItemWithRelations extends StockItem {
  producto: Producto & {
    categoria: Categoria
    modelo: Modelo & {
      marca: Marca
    } | null
  }
  sede: Sede | null
  perifericos: StockItem[]
  equipoPadre: StockItem | null
}

export interface DespachoWithRelations extends Despacho {
  solicitante: Empleado & {
    departamento: Departamento & {
      sede: Sede
    }
  }
  aprobadoPor: Usuario | null
  entregadoPor: Usuario | null
  items: DespachoItem[]
}

export interface AsignacionWithRelations extends Asignacion {
  stockItem: StockItemWithRelations
  empleado: Empleado & {
    departamento: Departamento & {
      sede: Sede
    }
  }
  entregadoPor: Usuario
  recibidoPor: Usuario | null
}

export interface DashboardStats {
  totalEquipos: number
  equiposAsignados: number
  equiposDisponibles: number
  equiposEnReparacion: number
  despachosPendientes: number
  despachosMes: number
  asignacionesActivas: number
  stockBajo: number
}

export interface MovimientoReciente {
  id: string
  tipo: 'asignacion' | 'despacho' | 'mantenimiento' | 'devolucion'
  descripcion: string
  fecha: Date
  usuario: string
  estado: string
}

export interface QRData {
  type: 'equipo' | 'despacho' | 'asignacion'
  id: string
  codigo: string
  url: string
}
