import { NextResponse } from "next/server"
import { ZodError } from "zod"

export function handleError(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Datos inválidos", details: error.issues },
      { status: 400 }
    )
  }

  console.error("API Error:", error)
  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 }
  )
}

export function successResponse(data: unknown, message?: string) {
  return NextResponse.json({ data, message })
}

export function createdResponse(data: unknown, message?: string) {
  return NextResponse.json({ data, message }, { status: 201 })
}

export function notFoundResponse(resource: string) {
  return NextResponse.json(
    { error: `${resource} no encontrado` },
    { status: 404 }
  )
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: "No autorizado" },
    { status: 401 }
  )
}
