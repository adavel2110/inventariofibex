import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"
import { z } from "zod"

const productoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  codigo: z.string().min(1, "El código es requerido"),
  descripcion: z.string().optional(),
  categoriaId: z.string().uuid("Seleccione una categoría válida"),
  modeloId: z.string().uuid().optional().nullable(),
  especificaciones: z.record(z.string(), z.any()).optional(),
  activo: z.boolean().default(true),
})

// GET /api/productos
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const categoriaId = searchParams.get("categoriaId")
    const modeloId = searchParams.get("modeloId")

    const productos = await prisma.producto.findMany({
      where: {
        ...(categoriaId && { categoriaId }),
        ...(modeloId && { modeloId }),
      },
      orderBy: { nombre: "asc" },
      include: {
        categoria: true,
        modelo: {
          include: { marca: true },
        },
        _count: {
          select: { stockItems: true },
        },
      },
    })

    return successResponse(productos)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/productos
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = productoSchema.parse(body)

    const producto = await prisma.producto.create({
      data,
      include: {
        categoria: true,
        modelo: {
          include: { marca: true },
        },
      },
    })

    return createdResponse(producto, "Producto creado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
