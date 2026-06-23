import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import QRCode from "qrcode"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { stockItemSchema } from "@/src/lib/schemas"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"
import { EstadoStock } from "@prisma/client"

// GET /api/inventario
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sedeId = searchParams.get("sedeId")
    const estado = searchParams.get("estado")
    const categoriaId = searchParams.get("categoriaId")
    const search = searchParams.get("search")

    const items = await prisma.stockItem.findMany({
      where: {
        ...(sedeId && { sedeId }),
        ...(estado && { estado: estado as EstadoStock }),
        ...(categoriaId && {
          producto: {
            categoriaId,
          },
        }),
        ...(search && {
          OR: [
            { codigoBarras: { contains: search, mode: "insensitive" } },
            { numeroSerie: { contains: search, mode: "insensitive" } },
            { producto: { nombre: { contains: search, mode: "insensitive" } } },
          ],
        }),
      },
      orderBy: { createdAt: "desc" },
      include: {
        producto: {
          include: {
            modelo: {
              include: {
                marca: true,
                categoria: true,
              },
            },
          },
        },
        sede: true,
        asignaciones: {
          where: { estado: "ACTIVA" },
          include: {
            empleado: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
        perifericos: {
          include: {
            producto: {
              include: {
                modelo: {
                  include: { marca: true },
                },
              },
            },
          },
        },
      },
    })

    return successResponse(items)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/inventario
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = stockItemSchema.parse(body)

    // Crear el item
    const item = await prisma.stockItem.create({
      data: {
        ...data,
        fechaCompra: data.fechaCompra ? new Date(data.fechaCompra) : null,
        garantiaHasta: data.garantiaHasta ? new Date(data.garantiaHasta) : null,
      },
      include: {
        producto: {
          include: {
            modelo: {
              include: { marca: true, categoria: true },
            },
          },
        },
        sede: true,
      },
    })

    // Generar QR Code
    const qrBaseUrl = process.env.NEXT_PUBLIC_QR_BASE_URL || "http://localhost:3000"
    const qrDataUrl = await QRCode.toDataURL(`${qrBaseUrl}/equipo/${item.id}`)
    
    // Actualizar con el QR
    const itemWithQR = await prisma.stockItem.update({
      where: { id: item.id },
      data: { qrCode: qrDataUrl },
      include: {
        producto: {
          include: {
            modelo: {
              include: { marca: true, categoria: true },
            },
          },
        },
        sede: true,
      },
    })

    return createdResponse(itemWithQR, "Equipo creado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
