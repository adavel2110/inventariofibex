import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import QRCode from "qrcode"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { handleError, successResponse } from "@/src/lib/api-utils"

// GET /api/inventario/[id]/qr - Obtener o regenerar QR
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const item = await prisma.stockItem.findUnique({
      where: { id: params.id },
      select: { id: true, qrCode: true },
    })

    if (!item) {
      return NextResponse.json({ error: "Equipo no encontrado" }, { status: 404 })
    }

    // Generar nuevo QR
    const qrBaseUrl = process.env.NEXT_PUBLIC_QR_BASE_URL || "http://localhost:3000"
    const qrDataUrl = await QRCode.toDataURL(`${qrBaseUrl}/equipo/${params.id}`)

    // Actualizar en BD
    await prisma.stockItem.update({
      where: { id: params.id },
      data: { qrCode: qrDataUrl },
    })

    return successResponse({ qrCode: qrDataUrl })
  } catch (error) {
    return handleError(error)
  }
}
