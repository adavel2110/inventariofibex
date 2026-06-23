import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { usuarioSchema } from "@/src/lib/schemas"
import { handleError, successResponse, notFoundResponse } from "@/src/lib/api-utils"

// GET /api/usuarios/[id]
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const usuario = await prisma.usuario.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true,
        ultimoAcceso: true,
        createdAt: true,
        avatar: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            permisos: true,
          },
        },
        empleado: {
          select: {
            id: true,
            codigo: true,
            cedula: true,
            cargo: true,
            sede: true,
            departamento: true,
          },
        },
      },
    })

    if (!usuario) {
      return notFoundResponse("Usuario")
    }

    return successResponse(usuario)
  } catch (error) {
    return handleError(error)
  }
}

// PUT /api/usuarios/[id]
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const { password, ...rest } = body
    const data = usuarioSchema.partial().parse(rest)

    // Hash password if provided
    let updateData = { ...data }
    if (password) {
      updateData.password = await bcrypt.hash(password, 10)
    }

    const usuario = await prisma.usuario.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true,
        rol: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        empleado: {
          select: {
            id: true,
            codigo: true,
          },
        },
      },
    })

    return successResponse(usuario, "Usuario actualizado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}

// DELETE /api/usuarios/[id]
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    await prisma.usuario.delete({
      where: { id: params.id },
    })

    return successResponse(null, "Usuario eliminado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
