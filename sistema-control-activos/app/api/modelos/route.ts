import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { modeloSchema } from "@/src/lib/schemas"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"

// GET /api/modelos
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const marcaId = searchParams.get("marcaId")
    const categoriaId = searchParams.get("categoriaId")

    const modelos = await prisma.modelo.findMany({
      where: {
        ...(marcaId && { marcaId }),
        ...(categoriaId && { categoriaId }),
      },
      orderBy: { nombre: "asc" },
      include: {
        marca: true,
        categoria: true,
        _count: {
          select: {
            productos: true,
          },
        },
      },
    })

    return successResponse(modelos)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/modelos
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = modeloSchema.parse(body)

    const modelo = await prisma.modelo.create({
      data,
      include: {
        marca: true,
        categoria: true,
      },
    })

    return createdResponse(modelo, "Modelo creado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
