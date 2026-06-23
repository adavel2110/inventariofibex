import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { sedeSchema } from "@/src/lib/schemas"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"

// GET /api/sedes - Listar todas las sedes
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const sedes = await prisma.sede.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: {
            departamentos: true,
            empleados: true,
          },
        },
      },
    })

    return successResponse(sedes)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/sedes - Crear nueva sede
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = sedeSchema.parse(body)

    const sede = await prisma.sede.create({
      data,
    })

    return createdResponse(sede, "Sede creada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
