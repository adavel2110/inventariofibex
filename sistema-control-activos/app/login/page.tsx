"use client"

import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

export default function LoginPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  useEffect(() => {
    if (session) {
      router.push("/")
    }
  }, [session, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Email o contraseña incorrectos. Por favor verifica tus credenciales.")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("Error de conexión. Por favor intenta nuevamente.")
    } finally {
      setIsLoading(false)
    }
  }

  if (status === "loading" || session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-gray-900">
            Control de Activos
          </CardTitle>
          <CardDescription className="text-center text-lg text-gray-600">
            Sistema de Inventario FIBEX
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
            <div className="space-y-2">
<Label htmlFor="email" className="text-gray-900 text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value })
                  setError("")
                }}
                required
                className="text-gray-900 text-lg h-12 placeholder:text-gray-500 bg-white"
              />
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value })
                  setError("")
                }}
                required
                className="text-gray-900 text-lg h-12 placeholder:text-gray-500 bg-white"
              />
        </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50" disabled={isLoading}>
              {isLoading ? "Verificando..." : "Iniciar Sesión"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
