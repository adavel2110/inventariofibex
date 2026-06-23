import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { departamentoSchema } from "@/src/lib/schemas"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"

// GET /api/departamentos/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const departamento = await prisma.departamento.findUnique({
      where: { id: params.id },
      include: {
        sede: true,
        empleados: true,
      },
    })

    if (!departamento) {
      return notFoundResponse("Departamento")
    }

    return successResponse(departamento)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/departamentos/[id]
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
    const data = departamentoSchema.partial().parse(body)

    const departamento = await prisma.departamento.update({
      where: { id: params.id },
      data,
      include: {
        sede: true,
      },
    })

    return successResponse(departamento, "Departamento actualizado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/departamentos/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.departamento.delete({
      where: { id: params.id },
    })

    return successResponse(null, "Departamento eliminado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
