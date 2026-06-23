import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { empleadoSchema } from "@/src/lib/schemas"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"

// GET /api/empleados
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sedeId = searchParams.get("sedeId")
    const departamentoId = searchParams.get("departamentoId")
    const search = searchParams.get("search")

    const empleados = await prisma.empleado.findMany({
      where: {
        ...(sedeId && { sedeId }),
        ...(departamentoId && { departamentoId }),
        ...(search && {
          OR: [
            { nombre: { contains: search, mode: "insensitive" } },
            { apellido: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { cedula: { contains: search, mode: "insensitive" } },
          ],
        }),
      },
      orderBy: { nombre: "asc" },
      include: {
        sede: true,
        departamento: true,
        usuario: true,
        _count: {
          select: {
            asignaciones: {
              where: { estado: "ACTIVA" },
            },
          },
        },
      },
    })

    return successResponse(empleados)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/empleados
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = empleadoSchema.parse(body)

    // Preparar datos para Prisma: convertir fechas y filtrar nulls/undefined
    const createData: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (value === undefined) continue
      if (key === 'fechaIngreso' && value !== null && typeof value === 'string') {
        createData[key] = new Date(value)
      } else if (value !== null) {
        createData[key] = value
      }
    }

    const empleado = await prisma.empleado.create({
      data: createData,
      include: {
        sede: true,
        departamento: true,
      },
    })

    return createdResponse(empleado, "Empleado creado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
