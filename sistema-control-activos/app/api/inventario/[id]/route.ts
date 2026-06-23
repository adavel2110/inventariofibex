import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import QRCode from "qrcode"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { stockItemSchema } from "@/src/lib/schemas"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"

// GET /api/inventario/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const item = await prisma.stockItem.findUnique({
      where: { id: params.id },
      include: {
        producto: {
          include: {
            modelo: { include: { marca: true } },
            categoria: true,
          },
        },
        sede: true,
        equipoPadre: {
          include: {
            producto: {
              include: {
                modelo: { include: { marca: true } },
              },
            },
          },
        },
        perifericos: {
          include: {
            producto: {
              include: {
                modelo: { include: { marca: true } },
              },
            },
          },
        },
        asignaciones: {
          include: {
            empleado: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                cargo: true,
              },
            },
          },
          orderBy: { fechaAsignacion: "desc" },
        },
        mantenimientos: {
          orderBy: { fecha: "desc" },
        },
      },
    })

    if (!item) {
      return notFoundResponse("Equipo")
    }

    return successResponse(item)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/inventario/[id]
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
    const data = stockItemSchema.partial().parse(body)

    // Si se cambia el estado a ASIGNADO o similar, verificar que tenga asignación
    // Si se proporciona código de barras, regenerar QR
    let qrCode = undefined
    if (data.codigoBarras) {
      const qrBaseUrl = process.env.NEXT_PUBLIC_QR_BASE_URL || "http://localhost:3000"
      qrCode = await QRCode.toDataURL(`${qrBaseUrl}/equipo/${params.id}`)
    }

    const item = await prisma.stockItem.update({
      where: { id: params.id },
      data: {
        ...data,
        ...(data.fechaCompra && { fechaCompra: new Date(data.fechaCompra) }),
        ...(data.garantiaHasta && { garantiaHasta: new Date(data.garantiaHasta) }),
        ...(qrCode && { qrCode }),
      },
      include: {
        producto: {
          include: {
            modelo: { include: { marca: true } },
            categoria: true,
          },
        },
        sede: true,
      },
    })

    return successResponse(item, "Equipo actualizado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/inventario/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.stockItem.delete({
      where: { id: params.id },
    })

    return successResponse(null, "Equipo eliminado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
