import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { marcaSchema } from "@/src/lib/schemas"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"

// GET /api/marcas
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const marcas = await prisma.marca.findMany({
      orderBy: { nombre: "asc" },
      include: {
        _count: {
          select: {
            modelos: true,
          },
        },
      },
    })

    return successResponse(marcas)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/marcas
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = marcaSchema.parse(body)

    const marca = await prisma.marca.create({
      data,
    })

    return createdResponse(marca, "Marca creada exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
