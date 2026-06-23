import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"
import { z } from "zod"

const despachoItemSchema = z.object({
  productoId: z.string().uuid("Seleccione un producto"),
  cantidadSolicitada: z.number().int().min(1).default(1),
  observaciones: z.string().optional(),
})

const despachoSchema = z.object({
  codigo: z.string().min(1, "El código es requerido"),
  tipo: z.enum(["NUEVA_ASIGNACION", "REEMPLAZO", "PRESTAMO", "REPARACION", "DEVOLUCION", "CONSUMIBLES"]),
  prioridad: z.enum(["BAJA", "NORMAL", "ALTA", "URGENTE"]).default("NORMAL"),
  solicitanteId: z.string().uuid("Seleccione un solicitante"),
  motivo: z.string().min(1, "El motivo es requerido"),
  observaciones: z.string().optional(),
  fechaRequerida: z.string().datetime().optional(),
  items: z.array(despachoItemSchema).min(1, "Debe incluir al menos un item"),
})

// GET /api/despachos
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const estado = searchParams.get("estado") as
      | "PENDIENTE"
      | "EN_REVISION"
      | "APROBADO"
      | "RECHAZADO"
      | "EN_PREPARACION"
      | "LISTO_ENTREGA"
      | "ENTREGADO"
      | "CANCELADO"
      | null
    const tipo = searchParams.get("tipo") as
      | "NUEVA_ASIGNACION"
      | "REEMPLAZO"
      | "PRESTAMO"
      | "REPARACION"
      | "DEVOLUCION"
      | "CONSUMIBLES"
      | null
    const solicitanteId = searchParams.get("solicitanteId")

    const despachos = await prisma.despacho.findMany({
      where: {
        ...(estado && { estado }),
        ...(tipo && { tipo }),
        ...(solicitanteId && { solicitanteId }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        solicitante: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        aprobadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
        entregadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
        items: {
          include: {
            producto: {
              include: {
                modelo: { include: { marca: true } },
              },
            },
          },
        },
        _count: {
          select: { items: true },
        },
      },
    })

    return successResponse(despachos)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/despachos
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = despachoSchema.parse(body)

    const { items, ...despachoData } = data

    // Crear despacho con items
    const despacho = await prisma.despacho.create({
      data: {
        ...despachoData,
        creadoPorId: session.user.id,
        estado: "PENDIENTE",
        items: {
          create: items.map((item: any) => ({
            productoId: item.productoId,
            cantidadSolicitada: item.cantidadSolicitada,
            observaciones: item.observaciones,
          })),
        },
      },
      include: {
        solicitante: {
          select: { id: true, nombre: true, apellido: true },
        },
        items: {
          include: {
            producto: {
              include: {
                modelo: { include: { marca: true } },
              },
            },
          },
        },
      },
    })

    return createdResponse(despacho, "Despacho creado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
