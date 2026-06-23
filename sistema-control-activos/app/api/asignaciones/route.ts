import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"
import { z } from "zod"
import { EstadoAsignacion } from "@prisma/client"

const asignacionSchema = z.object({
  stockItemId: z.string().uuid("Seleccione un equipo válido"),
  empleadoId: z.string().uuid("Seleccione un empleado válido"),
  fechaAsignacion: z.string().datetime().optional(),
  fechaExpiracion: z.string().datetime().optional().nullable(),
  condicionEntrega: z.enum(["NUEVO", "USADO_BUENO", "USADO_REGULAR", "MALO", "EN_REPARACION", "OBSOLETO"]),
  observaciones: z.string().optional(),
})

// GET /api/asignaciones
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const empleadoId = searchParams.get("empleadoId")
    const estado = searchParams.get("estado")
    const stockItemId = searchParams.get("stockItemId")

    const asignaciones = await prisma.asignacion.findMany({
      where: {
        ...(empleadoId && { empleadoId }),
        ...(stockItemId && { stockItemId }),
        ...(estado && { estado: estado as EstadoAsignacion }),
      },
      orderBy: { fechaAsignacion: "desc" },
      include: {
        stockItem: {
          include: {
            producto: {
              include: {
                modelo: {
                  include: { marca: true },
                },
                categoria: true,
              },
            },
            sede: true,
          },
        },
        empleado: {
          include: {
            departamento: true,
            sede: true,
          },
        },
        entregadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
        recibidoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    })

    return successResponse(asignaciones)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/asignaciones
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = asignacionSchema.parse(body)

    const userId = session.user.id

    const codigo = `ASIG-${Date.now()}`

    const asignacion = await prisma.asignacion.create({
      data: {
        codigo,
        stockItemId: data.stockItemId,
        empleadoId: data.empleadoId,
        fechaAsignacion: data.fechaAsignacion ? new Date(data.fechaAsignacion) : new Date(),
        fechaExpiracion: data.fechaExpiracion ? new Date(data.fechaExpiracion) : null,
        condicionEntrega: data.condicionEntrega,
        observaciones: data.observaciones,
        entregadoPorId: userId,
        estado: "ACTIVA",
      },
      include: {
        stockItem: {
          include: {
            producto: {
              include: {
                modelo: { include: { marca: true } },
                categoria: true,
              },
            },
            sede: true,
          },
        },
        empleado: {
          include: {
            departamento: true,
            sede: true,
          },
        },
        entregadoPor: {
          select: { id: true, nombre: true, apellido: true },
        },
      },
    })

    await prisma.stockItem.update({
      where: { id: data.stockItemId },
      data: { estado: "ASIGNADO" },
    })

    return createdResponse(asignacion, "Asignación creada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}