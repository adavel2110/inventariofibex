import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { categoriaSchema } from "@/src/lib/schemas"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"

// GET /api/categorias/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const categoria = await prisma.categoria.findUnique({
      where: { id: params.id },
      include: {
        productos: true,
        modelos: true,
      },
    })

    if (!categoria) {
      return notFoundResponse("Categoría")
    }

    return successResponse(categoria)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/categorias/[id]
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
    const data = categoriaSchema.partial().parse(body)

    const categoria = await prisma.categoria.update({
      where: { id: params.id },
      data,
    })

    return successResponse(categoria, "Categoría actualizada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/categorias/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.categoria.delete({
      where: { id: params.id },
    })

    return successResponse(null, "Categoría eliminada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
