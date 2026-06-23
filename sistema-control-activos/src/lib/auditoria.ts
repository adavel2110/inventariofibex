import { prisma } from "./prisma"
import { TipoAccionAuditoria } from "@prisma/client"

export async function logAuditoria(
  usuarioId: string,
  tabla: string,
  registroId: string,
  accion: TipoAccionAuditoria,
  datosAnteriores?: any,
  datosNuevos?: any,
  ipAddress?: string,
  userAgent?: string,
  endpoint?: string
) {
  try {
    await prisma.auditoria.create({
      data: {
        usuarioId,
        tabla,
        registroId,
        accion,
        datosAnteriores: datosAnteriores ? JSON.parse(JSON.stringify(datosAnteriores)) : undefined,
        datosNuevos: datosNuevos ? JSON.parse(JSON.stringify(datosNuevos)) : undefined,
        ipAddress,
        userAgent,
        endpoint,
      },
    })
  } catch (error) {
    console.error("Error logging auditoria:", error)
  }
}