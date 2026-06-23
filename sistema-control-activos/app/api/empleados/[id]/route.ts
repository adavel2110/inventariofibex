import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { empleadoSchema } from "@/src/lib/schemas"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"

// GET /api/empleados/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const empleado = await prisma.empleado.findUnique({
      where: { id: params.id },
      include: {
        sede: true,
        departamento: true,
        usuario: true,
        asignaciones: {
          include: {
            stockItem: {
              include: {
                producto: {
                  include: {
                    modelo: { include: { marca: true } },
                  },
                },
              },
            },
          },
          orderBy: { fechaAsignacion: "desc" },
        },
      },
    })

    if (!empleado) {
      return notFoundResponse("Empleado")
    }

    return successResponse(empleado)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/empleados/[id]
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
    const data = empleadoSchema.partial().parse(body)

    // Preparar datos para Prisma: convertir fechas y filtrar undefined
    const updateData: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue
      if (key === 'fechaIngreso' && value !== null && typeof value === 'string') {
        updateData[key] = new Date(value)
      } else {
        updateData[key] = value
      }
    }

    const empleado = await prisma.empleado.update({
      where: { id: params.id },
      data: updateData,
      include: {
        sede: true,
        departamento: true,
      },
    })

    return successResponse(empleado, "Empleado actualizado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/empleados/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.empleado.delete({
      where: { id: params.id },
    })

    return successResponse(null, "Empleado eliminado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
