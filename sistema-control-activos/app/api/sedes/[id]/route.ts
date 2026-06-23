import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { sedeSchema } from "@/src/lib/schemas"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"

// GET /api/sedes/[id] - Obtener una sede
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const sede = await prisma.sede.findUnique({
      where: { id: params.id },
      include: {
        departamentos: true,
        empleados: true,
      },
    })

    if (!sede) {
      return notFoundResponse("Sede")
    }

    return successResponse(sede)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/sedes/[id] - Actualizar sede
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
    const data = sedeSchema.partial().parse(body)

    const sede = await prisma.sede.update({
      where: { id: params.id },
      data,
    })

    return successResponse(sede, "Sede actualizada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/sedes/[id] - Eliminar sede
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.sede.delete({
      where: { id: params.id },
    })

    return successResponse(null, "Sede eliminada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
