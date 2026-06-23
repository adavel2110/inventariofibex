import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"
import { z } from "zod"

const devolucionSchema = z.object({
  condicionDevolucion: z.enum(["NUEVO", "USADO_BUENO", "USADO_REGULAR", "MALO", "EN_REPARACION", "OBSOLETO"]),
  observaciones: z.string().optional(),
})

// GET /api/asignaciones/[id]
export async function GET(
  req: Request,
  { params }: { params: { asignacionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const asignacion = await prisma.asignacion.findUnique({
      where: { id: params.asignacionId },
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
            perifericos: {
              include: {
                producto: { include: { modelo: { include: { marca: true } } } },
              },
            },
          },
        },
        empleado: {
          include: {
            departamento: true,
            sede: true,
          },
        },
        entregadoPor: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        recibidoPor: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        despacho: true,
      },
    })

    if (!asignacion) {
      return notFoundResponse("Asignación")
    }

    return successResponse(asignacion)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/asignaciones/[id] - Devolución
export async function PUT(
  req: Request,
  { params }: { params: { asignacionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = devolucionSchema.parse(body)

    const asignacion = await prisma.asignacion.findUnique({
      where: { id: params.asignacionId },
    })

    if (!asignacion) {
      return notFoundResponse("Asignación")
    }

    const userId = session.user.id

    const updated = await prisma.asignacion.update({
      where: { id: params.asignacionId },
      data: {
        estado: "DEVUELTA",
        fechaDevolucion: new Date(),
        condicionDevolucion: data.condicionDevolucion,
        observaciones: data.observaciones,
        recibidoPorId: userId,
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
          },
        },
        empleado: true,
      },
    })

    await prisma.stockItem.update({
      where: { id: asignacion.stockItemId },
      data: { estado: "DISPONIBLE" },
    })

    return successResponse(updated, "Devolución registrada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/asignaciones/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { asignacionId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const asignacion = await prisma.asignacion.findUnique({
      where: { id: params.asignacionId },
    })

    if (!asignacion) {
      return notFoundResponse("Asignación")
    }

    if (asignacion.estado === "ACTIVA") {
      await prisma.stockItem.update({
        where: { id: asignacion.stockItemId },
        data: { estado: "DISPONIBLE" },
      })
    }

    await prisma.asignacion.delete({
      where: { id: params.asignacionId },
    })

    return successResponse(null, "Asignación eliminada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}