import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { modeloSchema } from "@/src/lib/schemas"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"

// GET /api/modelos/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const modelo = await prisma.modelo.findUnique({
      where: { id: params.id },
      include: {
        marca: true,
        categoria: true,
        productos: true,
      },
    })

    if (!modelo) {
      return notFoundResponse("Modelo")
    }

    return successResponse(modelo)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/modelos/[id]
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
    const data = modeloSchema.partial().parse(body)

    const modelo = await prisma.modelo.update({
      where: { id: params.id },
      data,
      include: {
        marca: true,
        categoria: true,
      },
    })

    return successResponse(modelo, "Modelo actualizado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/modelos/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.modelo.delete({
      where: { id: params.id },
    })

    return successResponse(null, "Modelo eliminado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
