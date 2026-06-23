import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"
import { z } from "zod"

const updateDespachoSchema = z.object({
  estado: z.enum(["PENDIENTE", "APROBADO", "RECHAZADO", "EN_ENTREGA", "ENTREGADO", "CANCELADO"]).optional(),
  observaciones: z.string().optional(),
})

// GET /api/despachos/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const despacho = await prisma.despacho.findUnique({
      where: { id: params.id },
      include: {
        solicitante: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        aprobadoPor: {
          select: { id: true, nombre: true, apellido: true, email: true },
        },
        entregadoPor: {
          select: { id: true, nombre: true, apellido: true, email: true },
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

    if (!despacho) {
      return notFoundResponse("Despacho")
    }

    return successResponse(despacho)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/despachos/[id] - Aprobar, rechazar, entregar
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = updateDespachoSchema.parse(body)

    // Determinar quién está realizando la acción según el estado
    const updateData: any = { ...data }
    if (data.estado === "APROBADO") {
      updateData.aprobadorId = session.user.id
      updateData.fechaAprobacion = new Date()
    } else if (data.estado === "ENTREGADO") {
      updateData.entregadoPorId = session.user.id
      updateData.fechaEntrega = new Date()
    }

    const despacho = await prisma.despacho.update({
      where: { id: params.id },
      data: updateData,
      include: {
        solicitante: { select: { id: true, nombre: true, apellido: true } },
        aprobadoPor: { select: { id: true, nombre: true, apellido: true } },
        entregadoPor: { select: { id: true, nombre: true, apellido: true } },
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

    return successResponse(despacho, "Despacho actualizado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
