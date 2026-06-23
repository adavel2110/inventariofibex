import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const authOptions = {
  session: {
    strategy: "jwt" as const,
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
          where: { email: credentials.email },
          include: {
            rol: { include: { permisos: true } },
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

        await prisma.usuario.update({
          where: { id: user.id },
          data: { ultimoAcceso: new Date() },
        })

        return {
          id: user.id,
          email: user.email,
          name: `${user.nombre} ${user.apellido}`,
          rol: {
            id: user.rol.id,
            codigo: user.rol.codigo,
            nombre: user.rol.nombre,
            permisos: user.rol.permisos.map((p: any) => p.codigo),
          },
          empleado: user.empleado
            ? { id: user.empleado.id, codigo: user.empleado.codigo, cedula: user.empleado.cedula }
            : null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.rol = user.rol
        token.empleado = user.empleado
      }
      return token
    },
    async session({ session, token }: any) {
      if (token) {
        session.user.id = token.id
        session.user.rol = token.rol
        session.user.empleado = token.empleado
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }