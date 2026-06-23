"use client"

import { useEffect, useRef, useState } from "react"
import { DashboardLayout } from "../dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Camera, Search, Package, Users, MapPin, AlertCircle, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function EscanearPage() {
  const router = useRouter()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState("")
  const [manualCode, setManualCode] = useState("")
  const [loading, setLoading] = useState(false)

  const startScanning = async () => {
    setError("")
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setScanning(true)
      }
    } catch (err) {
      setError("No se pudo acceder a la cámara. Use el código manual.")
    }
  }

  const stopScanning = () => {
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach(track => track.stop())
    }
    setScanning(false)
  }

  const buscarPorCodigo = async (codigo: string) => {
    setLoading(true)
    setError("")
    setResult(null)
    
    try {
      // Extraer ID del URL del QR
      const urlMatch = codigo.match(/\/equipo\/([a-f0-9-]+)/i)
      const searchCode = urlMatch ? urlMatch[1] : codigo

      const res = await fetch(`/api/inventario/${searchCode}`)
      const data = await res.json()

      if (data.data) {
        setResult(data.data)
      } else {
        setError("Equipo no encontrado")
      }
    } catch (err) {
      setError("Error al buscar el equipo")
    } finally {
      setLoading(false)
    }
  }

  const handleManualSearch = () => {
    if (manualCode.trim()) {
      buscarPorCodigo(manualCode.trim())
    }
  }

  useEffect(() => {
    return () => {
      if (scanning) stopScanning()
    }
  }, [scanning])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Escanear Equipo</h1>
          <p className="text-muted-foreground">
            Escanear código QR o buscar manualmente
          </p>
        </div>

        {/* Escaneo por cámara */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Escanear QR
            </CardTitle>
            <CardDescription>
              Use la cámara de su dispositivo para escanear el código QR del equipo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
              <video 
                ref={videoRef} 
                className="w-full h-full object-cover"
                autoPlay 
                playsInline
              />
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-48 h-48 border-4 border-white rounded-lg animate-pulse" />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={startScanning} className="flex-1">
                  <Camera className="mr-2 h-4 w-4" />
                  Iniciar Escaneo
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="secondary" className="flex-1">
                  Detener Escaneo
                </Button>
              )}
            </div>
            {error && !scanning && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}
          </CardContent>
        </Card>

        {/* Búsqueda manual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Búsqueda Manual
            </CardTitle>
            <CardDescription>
              Ingrese el código del equipo o el ID del QR
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Código de equipo o URL del QR..."
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
              />
              <Button onClick={handleManualSearch} disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resultado */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Equipo Encontrado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Producto</p>
                  <p className="text-lg font-bold">{result.producto?.nombre}</p>
                  <p className="text-sm text-muted-foreground">
                    {result.producto?.modelo?.marca?.nombre} {result.producto?.modelo?.nombre}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Serie</p>
                  <p className="text-lg">{result.numeroSerie || "Sin serie"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  <Badge variant={result.estado === "DISPONIBLE" ? "default" : "secondary"}>
                    {result.estado}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Condición</p>
                  <Badge variant="outline">{result.condicion}</Badge>
                </div>
                {result.sede && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Sede</p>
                    <p className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {result.sede.nombre}
                    </p>
                  </div>
                )}
                {result.ubicacionFisica && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ubicación</p>
                    <p>{result.ubicacionFisica}</p>
                  </div>
                )}
              </div>

              {result.asignaciones?.length > 0 && (
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium mb-2">Asignado a:</p>
                  {result.asignaciones
                    .filter((a: any) => a.estado === "ACTIVA")
                    .map((a: any) => (
                      <div key={a.id} className="flex items-center gap-2 bg-muted p-2 rounded">
                        <Users className="h-4 w-4" />
                        <span>{a.empleado?.nombre} {a.empleado?.apellido}</span>
                        <Badge variant="secondary">{a.empleado?.cargo}</Badge>
                      </div>
                    ))}
                </div>
              )}

              <Button onClick={() => router.push(`/inventario/${result.id}`)} className="w-full">
                Ver Detalles Completos
              </Button>
            </CardContent>
          </Card>
        )}

        {error && !result && (
          <Card>
            <CardContent className="flex items-center gap-2 p-4 text-red-500">
              <AlertCircle className="h-5 w-5" />
              {error}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}