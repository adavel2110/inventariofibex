"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  MapPin,
  Settings,
  LogOut,
  Building2,
  Tags,
  Laptop,
  MousePointer2,
  ClipboardList,
  Box,
} from "lucide-react"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Inventario", href: "/inventario", icon: Package },
  { name: "Despachos", href: "/despachos", icon: Truck },
  { name: "Asignaciones", href: "/asignaciones", icon: ClipboardList },
  { name: "Empleados", href: "/empleados", icon: Users },
]

const catalogos = [
  { name: "Sedes", href: "/catalogos/sedes", icon: Building2 },
  { name: "Departamentos", href: "/catalogos/departamentos", icon: MapPin },
  { name: "Categorías", href: "/catalogos/categorias", icon: Tags },
  { name: "Marcas", href: "/catalogos/marcas", icon: Laptop },
  { name: "Modelos", href: "/catalogos/modelos", icon: MousePointer2 },
  { name: "Productos", href: "/catalogos/productos", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-slate-50">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/" className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <span className="text-lg font-bold">Control Activos</span>
        </Link>
      </div>

      <div className="flex-1 overflow-auto py-4">
        <nav className="space-y-1 px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-slate-900 text-slate-50"
                    : "text-slate-700 hover:bg-slate-200"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <Separator className="my-4" />

        <div className="px-3">
          <p className="mb-2 px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Catálogos
          </p>
          <nav className="space-y-1">
            {catalogos.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-900 text-slate-50"
                      : "text-slate-700 hover:bg-slate-200"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-slate-700"
          onClick={() => signOut()}
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </div>
  )
}
