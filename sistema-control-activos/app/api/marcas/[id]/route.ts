import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { marcaSchema } from "@/src/lib/schemas"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"

// GET /api/marcas/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const marca = await prisma.marca.findUnique({
      where: { id: params.id },
      include: {
        modelos: {
          include: {
            categoria: true,
          },
        },
      },
    })

    if (!marca) {
      return notFoundResponse("Marca")
    }

    return successResponse(marca)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/marcas/[id]
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
    const data = marcaSchema.partial().parse(body)

    const marca = await prisma.marca.update({
      where: { id: params.id },
      data,
    })

    return successResponse(marca, "Marca actualizada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/marcas/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.marca.delete({
      where: { id: params.id },
    })

    return successResponse(null, "Marca eliminada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
