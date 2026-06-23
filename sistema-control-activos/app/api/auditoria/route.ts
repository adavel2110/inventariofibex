import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { handleError, successResponse } from "@/src/lib/api-utils"

// GET /api/auditoria
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tabla = searchParams.get("tabla")
    const usuarioId = searchParams.get("usuarioId")
    const accion = searchParams.get("accion")
    const fechaDesde = searchParams.get("fechaDesde")
    const fechaHasta = searchParams.get("fechaHasta")
    const limit = parseInt(searchParams.get("limit") || "50")
    const offset = parseInt(searchParams.get("offset") || "0")

    const where: any = {}

    if (tabla) where.tabla = tabla
    if (usuarioId) where.usuarioId = usuarioId
    if (accion) where.accion = accion

    if (fechaDesde || fechaHasta) {
      where.createdAt = {}
      if (fechaDesde) where.createdAt.gte = new Date(fechaDesde)
      if (fechaHasta) where.createdAt.lte = new Date(fechaHasta)
    }

    const [logs, total] = await Promise.all([
      prisma.auditoria.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
        include: {
          usuario: {
            select: { id: true, nombre: true, apellido: true, email: true },
          },
        },
      }),
      prisma.auditoria.count({ where }),
    ])

    const tablasUnicas = await prisma.auditoria.findMany({
      select: { tabla: true },
      distinct: ["tabla"],
    })

    return successResponse({
      logs,
      total,
      limit,
      offset,
      tablas: tablasUnicas.map(t => t.tabla),
    })
  } catch (error) {
    return handleError(error)
  }
}