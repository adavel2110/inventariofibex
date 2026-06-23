import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { handleError, successResponse } from "@/src/lib/api-utils"
import { EstadoStock, EstadoDespacho, EstadoAsignacion } from "@prisma/client"

// GET /api/dashboard
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const [
      totalEquipos,
      equiposDisponibles,
      equiposAsignados,
      equiposEnReparacion,
      despachosPendientes,
      despachosAprobados,
      asignacionesActivas,
      totalSedes,
      totalEmpleados,
      totalCategorias,
      marcasConteo,
      modelosConteo,
      productosConteo,
    ] = await Promise.all([
      prisma.stockItem.count(),
      prisma.stockItem.count({ where: { estado: EstadoStock.DISPONIBLE } }),
      prisma.stockItem.count({ where: { estado: EstadoStock.ASIGNADO } }),
      prisma.stockItem.count({ where: { estado: EstadoStock.EN_REPARACION } }),
      prisma.despacho.count({ 
        where: { estado: { in: [EstadoDespacho.PENDIENTE, EstadoDespacho.EN_REVISION] } }
      }),
      prisma.despacho.count({ where: { estado: EstadoDespacho.APROBADO } }),
      prisma.asignacion.count({ where: { estado: EstadoAsignacion.ACTIVA } }),
      prisma.sede.count({ where: { activo: true } }),
      prisma.empleado.count({ where: { activo: true } }),
      prisma.categoria.count({ where: { activo: true } }),
      prisma.marca.count({ where: { activo: true } }),
      prisma.modelo.count({ where: { activo: true } }),
      prisma.producto.count({ where: { activo: true } }),
    ])

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const despachosMes = await prisma.despacho.count({
      where: {
        createdAt: { gte: startOfMonth },
      },
    })

    const equiposPorCategoria = await prisma.stockItem.groupBy({
      by: ["estado"],
      _count: { estado: true },
    })

    const equiposPorSede = await prisma.stockItem.groupBy({
      by: ["sedeId"],
      _count: true,
      where: { sedeId: { not: null } },
    })

    const ultimosDespachos = await prisma.despacho.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        codigo: true,
        estado: true,
        tipo: true,
        createdAt: true,
        solicitante: {
          select: { nombre: true, apellido: true },
        },
      },
    })

    const ultimasAsignaciones = await prisma.asignacion.findMany({
      take: 5,
      orderBy: { fechaAsignacion: "desc" },
      select: {
        id: true,
        codigo: true,
        estado: true,
        fechaAsignacion: true,
        empleado: {
          select: { nombre: true, apellido: true },
        },
        stockItem: {
          select: { 
            producto: { select: { nombre: true } },
            numeroSerie: true,
          },
        },
      },
    })

    const stats = {
      totalEquipos,
      equiposDisponibles,
      equiposAsignados,
      equiposEnReparacion,
      despachosPendientes,
      despachosAprobados,
      despachosMes,
      asignacionesActivas,
      totalSedes,
      totalEmpleados,
      totalCategorias,
      marcasConteo,
      modelosConteo,
      productosConteo,
      equiposPorCategoria,
      equiposPorSede,
      ultimosDespachos,
      ultimasAsignaciones,
    }

    return successResponse(stats)
  } catch (error) {
    return handleError(error)
  }
}