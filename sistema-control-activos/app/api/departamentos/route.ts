import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { departamentoSchema } from "@/src/lib/schemas"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"

// GET /api/departamentos - Listar todos los departamentos
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sedeId = searchParams.get("sedeId")

    const departamentos = await prisma.departamento.findMany({
      where: sedeId ? { sedeId } : undefined,
      orderBy: { nombre: "asc" },
      include: {
        sede: true,
        _count: {
          select: {
            empleados: true,
          },
        },
      },
    })

    return successResponse(departamentos)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/departamentos - Crear nuevo departamento
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = departamentoSchema.parse(body)

    const departamento = await prisma.departamento.create({
      data,
      include: {
        sede: true,
      },
    })

    return createdResponse(departamento, "Departamento creado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
