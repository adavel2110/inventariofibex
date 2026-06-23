import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.usuario.findUnique({
          where: {
            email: credentials.email,
          },
          include: {
            rol: {
              include: {
                permisos: true,
              },
            },
            empleado: true,
          },
        })

        if (!user || !user.activo) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        // Actualizar último acceso
        await prisma.usuario.update({
          where: { id: user.id },
          data: { ultimoAcceso: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.nombre} ${user.apellido}`,
          image: user.avatar,
          rol: {
            id: user.rol.id,
            codigo: user.rol.codigo,
            nombre: user.rol.nombre,
            permisos: user.rol.permisos.map((p: { codigo: string }) => p.codigo),
          },
          empleado: user.empleado
            ? {
                id: user.empleado.id,
                codigo: user.empleado.codigo,
                cedula: user.empleado.cedula,
              }
            : null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.rol = user.rol
        token.empleado = user.empleado
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.rol = token.rol as any
        session.user.empleado = token.empleado as any
      }
      return session
    },
  },
}
