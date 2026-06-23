import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import bcrypt from "bcryptjs"
import { prisma } from "@/src/lib/prisma"
import { authOptions } from "@/src/lib/auth"
import { usuarioSchema } from "@/src/lib/schemas"
import { handleError, successResponse, createdResponse } from "@/src/lib/api-utils"

// GET /api/usuarios
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const usuarios = await prisma.usuario.findMany({
      orderBy: { nombre: "asc" },
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
          },
        },
        empleado: {
          select: {
            id: true,
            codigo: true,
            cedula: true,
            cargo: true,
          },
        },
      },
    })

    return successResponse(usuarios)
  } catch (error) {
    return handleError(error)
  }
}

// POST /api/usuarios
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await req.json()
    const data = usuarioSchema.parse(body)

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10)

    const usuario = await prisma.usuario.create({
      data: {
        ...data,
        password: hashedPassword,
      },
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

    return createdResponse(usuario, "Usuario creado exitosamente")
  } catch (error) {
    return handleError(error)
  }
}
