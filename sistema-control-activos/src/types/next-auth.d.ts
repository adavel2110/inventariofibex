import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      rol: {
        id: string
        codigo: string
        nombre: string
        permisos: string[]
      }
      empleado?: {
        id: string
        codigo: string
        cedula: string
      } | null
    }
  }

  interface User {
    id: string
    rol: {
      id: string
      codigo: string
      nombre: string
      permisos: string[]
    }
    empleado?: {
      id: string
      codigo: string
      cedula: string
    } | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    rol?: {
      id: string
      codigo: string
      nombre: string
      permisos: string[]
    }
    empleado?: {
      id: string
      codigo: string
      cedula: string
    } | null
  }
}
