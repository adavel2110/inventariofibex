import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { categoriaSchema } from "@/src/lib/schemas"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"

// GET /api/categorias
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get("tipo") as
      | "EQUIPO_COMPUTO"
      | "PERIFERICO"
      | "CONSUMIBLE"
      | "ACCESORIO"
      | "COMUNICACION"
      | "SEGURIDAD"
      | "OTRO"
      | null

    const categorias = await prisma.categoria.findMany({
      where: tipo ? { tipo } : undefined,
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: {
            productos: true,
          },
        },
      },
    })

    return successResponse(categorias)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/categorias
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = categoriaSchema.parse(body)

    const categoria = await prisma.categoria.create({
      data,
    })

    return createdResponse(categoria, "Categoría creada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
