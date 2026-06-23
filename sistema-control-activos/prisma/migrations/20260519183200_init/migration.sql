-- CreateEnum
CREATE TYPE "EstadoStock" AS ENUM ('DISPONIBLE', 'ASIGNADO', 'EN_REPARACION', 'EN_DESPACHO', 'DADO_BAJA', 'EN_TRANSITO', 'RESERVADO');

-- CreateEnum
CREATE TYPE "CondicionEquipo" AS ENUM ('NUEVO', 'USADO_BUENO', 'USADO_REGULAR', 'MALO', 'EN_REPARACION', 'OBSOLETO');

-- CreateEnum
CREATE TYPE "EstadoAsignacion" AS ENUM ('ACTIVA', 'DEVUELTA', 'PERDIDA', 'DANADA', 'VENCIDA');

-- CreateEnum
CREATE TYPE "TipoMantenimiento" AS ENUM ('PREVENTIVO', 'CORRECTIVO', 'ACTUALIZACION', 'LIMPIEZA', 'REVISION');

-- CreateEnum
CREATE TYPE "TipoDespacho" AS ENUM ('NUEVA_ASIGNACION', 'REEMPLAZO', 'PRESTAMO', 'REPARACION', 'DEVOLUCION', 'CONSUMIBLES');

-- CreateEnum
CREATE TYPE "EstadoDespacho" AS ENUM ('PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO', 'EN_PREPARACION', 'LISTO_ENTREGA', 'ENTREGADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "PrioridadDespacho" AS ENUM ('BAJA', 'NORMAL', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "TipoAccionAuditoria" AS ENUM ('CREAR', 'ACTUALIZAR', 'ELIMINAR', 'LOGIN', 'LOGOUT', 'EXPORTAR', 'IMPORTAR', 'APROBAR', 'RECHAZAR', 'ENTREGAR', 'DEVOLVER');

-- CreateTable
CREATE TABLE "tipos_parametricos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tipos_parametricos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "valores_parametricos" (
    "id" TEXT NOT NULL,
    "tipoParametricoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "valores_parametricos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuraciones" (
    "id" TEXT NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoria" TEXT NOT NULL,
    "editable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "updatedById" TEXT,

    CONSTRAINT "configuraciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sedes" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT,
    "ciudad" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sedes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departamentos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" TEXT NOT NULL,
    "esDepreciable" BOOLEAN NOT NULL DEFAULT false,
    "vidaUtilMeses" INTEGER,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marcas" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marcas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modelos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "marcaId" TEXT NOT NULL,
    "categoriaId" TEXT NOT NULL,
    "especificaciones" JSONB,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "modelos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "sku" TEXT,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "categoriaId" TEXT NOT NULL,
    "modeloId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permisos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "modulo" TEXT NOT NULL,
    "accion" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "permisos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "cargo" TEXT,
    "telefono" TEXT,
    "avatar" TEXT,
    "rolId" TEXT NOT NULL,
    "empleadoId" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoAcceso" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "empleados" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "cedula" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "telefono" TEXT,
    "cargo" TEXT NOT NULL,
    "departamentoId" TEXT NOT NULL,
    "sedeId" TEXT NOT NULL,
    "fechaIngreso" TIMESTAMP(3) NOT NULL,
    "fechaEgreso" TIMESTAMP(3),
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "empleados_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_items" (
    "id" TEXT NOT NULL,
    "codigoBarras" TEXT,
    "qrCode" TEXT,
    "productoId" TEXT NOT NULL,
    "numeroSerie" TEXT,
    "imei" TEXT,
    "macAddress" TEXT,
    "sedeId" TEXT,
    "ubicacionFisica" TEXT,
    "estado" "EstadoStock" NOT NULL DEFAULT 'DISPONIBLE',
    "condicion" "CondicionEquipo" NOT NULL DEFAULT 'NUEVO',
    "fechaIngreso" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaCompra" TIMESTAMP(3),
    "numeroFactura" TEXT,
    "costo" DECIMAL(12,2),
    "proveedor" TEXT,
    "garantiaHasta" TIMESTAMP(3),
    "nombreEquipo" TEXT,
    "os" TEXT,
    "cpu" TEXT,
    "memoriaGb" TEXT,
    "disco" TEXT,
    "ipAsignada" TEXT,
    "password" TEXT,
    "observaciones" TEXT,
    "equipoPadreId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mantenimientos" (
    "id" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "tipo" "TipoMantenimiento" NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "descripcion" TEXT NOT NULL,
    "realizadoPor" TEXT NOT NULL,
    "costo" DECIMAL(12,2),
    "proximoMantenimiento" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mantenimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "asignaciones" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "stockItemId" TEXT NOT NULL,
    "empleadoId" TEXT NOT NULL,
    "fechaAsignacion" TIMESTAMP(3) NOT NULL,
    "fechaDevolucion" TIMESTAMP(3),
    "fechaExpiracion" TIMESTAMP(3),
    "condicionEntrega" "CondicionEquipo" NOT NULL,
    "condicionDevolucion" "CondicionEquipo",
    "entregadoPorId" TEXT NOT NULL,
    "recibidoPorId" TEXT,
    "observaciones" TEXT,
    "documentoUrl" TEXT,
    "firmaDigital" TEXT,
    "estado" "EstadoAsignacion" NOT NULL DEFAULT 'ACTIVA',
    "despachoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "asignaciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despachos" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoDespacho" NOT NULL,
    "estado" "EstadoDespacho" NOT NULL DEFAULT 'PENDIENTE',
    "prioridad" "PrioridadDespacho" NOT NULL DEFAULT 'NORMAL',
    "solicitanteId" TEXT NOT NULL,
    "fechaSolicitud" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaRequerida" TIMESTAMP(3),
    "fechaAprobacion" TIMESTAMP(3),
    "fechaEntrega" TIMESTAMP(3),
    "aprobadoPorId" TEXT,
    "entregadoPorId" TEXT,
    "motivo" TEXT NOT NULL,
    "observaciones" TEXT,
    "observacionesAprobacion" TEXT,
    "observacionesEntrega" TEXT,
    "creadoPorId" TEXT,
    "qrCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despachos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despacho_items" (
    "id" TEXT NOT NULL,
    "despachoId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "cantidadSolicitada" INTEGER NOT NULL,
    "cantidadEntregada" INTEGER NOT NULL DEFAULT 0,
    "stockItems" JSONB,
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "despacho_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auditorias" (
    "id" TEXT NOT NULL,
    "tabla" TEXT NOT NULL,
    "registroId" TEXT NOT NULL,
    "accion" "TipoAccionAuditoria" NOT NULL,
    "datosAnteriores" JSONB,
    "datosNuevos" JSONB,
    "usuarioId" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "endpoint" TEXT,
    "aprobadoPorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auditorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_PermisoToRol" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "tipos_parametricos_codigo_key" ON "tipos_parametricos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "valores_parametricos_tipoParametricoId_codigo_key" ON "valores_parametricos"("tipoParametricoId", "codigo");

-- CreateIndex
CREATE UNIQUE INDEX "configuraciones_clave_key" ON "configuraciones"("clave");

-- CreateIndex
CREATE UNIQUE INDEX "sedes_codigo_key" ON "sedes"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "departamentos_codigo_key" ON "departamentos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_codigo_key" ON "categorias"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "marcas_codigo_key" ON "marcas"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "modelos_codigo_key" ON "modelos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "productos_codigo_key" ON "productos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "productos_sku_key" ON "productos"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "roles_codigo_key" ON "roles"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "permisos_codigo_key" ON "permisos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_empleadoId_key" ON "usuarios"("empleadoId");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_codigo_key" ON "empleados"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_cedula_key" ON "empleados"("cedula");

-- CreateIndex
CREATE UNIQUE INDEX "empleados_email_key" ON "empleados"("email");

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_codigoBarras_key" ON "stock_items"("codigoBarras");

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_qrCode_key" ON "stock_items"("qrCode");

-- CreateIndex
CREATE UNIQUE INDEX "asignaciones_codigo_key" ON "asignaciones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "despachos_codigo_key" ON "despachos"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "despachos_qrCode_key" ON "despachos"("qrCode");

-- CreateIndex
CREATE INDEX "auditorias_tabla_registroId_idx" ON "auditorias"("tabla", "registroId");

-- CreateIndex
CREATE INDEX "auditorias_createdAt_idx" ON "auditorias"("createdAt");

-- CreateIndex
CREATE INDEX "auditorias_usuarioId_idx" ON "auditorias"("usuarioId");

-- CreateIndex
CREATE UNIQUE INDEX "_PermisoToRol_AB_unique" ON "_PermisoToRol"("A", "B");

-- CreateIndex
CREATE INDEX "_PermisoToRol_B_index" ON "_PermisoToRol"("B");

-- AddForeignKey
ALTER TABLE "valores_parametricos" ADD CONSTRAINT "valores_parametricos_tipoParametricoId_fkey" FOREIGN KEY ("tipoParametricoId") REFERENCES "tipos_parametricos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuraciones" ADD CONSTRAINT "configuraciones_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "departamentos" ADD CONSTRAINT "departamentos_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modelos" ADD CONSTRAINT "modelos_marcaId_fkey" FOREIGN KEY ("marcaId") REFERENCES "marcas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modelos" ADD CONSTRAINT "modelos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_modeloId_fkey" FOREIGN KEY ("modeloId") REFERENCES "modelos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usuarios" ADD CONSTRAINT "usuarios_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleados"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_departamentoId_fkey" FOREIGN KEY ("departamentoId") REFERENCES "departamentos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "empleados" ADD CONSTRAINT "empleados_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_sedeId_fkey" FOREIGN KEY ("sedeId") REFERENCES "sedes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_equipoPadreId_fkey" FOREIGN KEY ("equipoPadreId") REFERENCES "stock_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mantenimientos" ADD CONSTRAINT "mantenimientos_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "stock_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_empleadoId_fkey" FOREIGN KEY ("empleadoId") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_entregadoPorId_fkey" FOREIGN KEY ("entregadoPorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_recibidoPorId_fkey" FOREIGN KEY ("recibidoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asignaciones" ADD CONSTRAINT "asignaciones_despachoId_fkey" FOREIGN KEY ("despachoId") REFERENCES "despachos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_solicitanteId_fkey" FOREIGN KEY ("solicitanteId") REFERENCES "empleados"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_entregadoPorId_fkey" FOREIGN KEY ("entregadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despachos" ADD CONSTRAINT "despachos_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despacho_items" ADD CONSTRAINT "despacho_items_despachoId_fkey" FOREIGN KEY ("despachoId") REFERENCES "despachos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despacho_items" ADD CONSTRAINT "despacho_items_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auditorias" ADD CONSTRAINT "auditorias_aprobadoPorId_fkey" FOREIGN KEY ("aprobadoPorId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToRol" ADD CONSTRAINT "_PermisoToRol_A_fkey" FOREIGN KEY ("A") REFERENCES "permisos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_PermisoToRol" ADD CONSTRAINT "_PermisoToRol_B_fkey" FOREIGN KEY ("B") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
