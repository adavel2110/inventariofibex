import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // ============================================
  // ROLES Y PERMISOS
  // ============================================
  console.log('Creating roles and permissions...')

  const rolAdmin = await prisma.rol.upsert({
    where: { codigo: 'ADMIN' },
    update: {},
    create: {
      codigo: 'ADMIN',
      nombre: 'Administrador',
      descripcion: 'Usuario con acceso completo al sistema',
    },
  })

  const rolUser = await prisma.rol.upsert({
    where: { codigo: 'USUARIO' },
    update: {},
    create: {
      codigo: 'USUARIO',
      nombre: 'Usuario',
      descripcion: 'Usuario con acceso básico',
    },
  })

  const rolJefeDept = await prisma.rol.upsert({
    where: { codigo: 'JEFE_DEPARTAMENTO' },
    update: {},
    create: {
      codigo: 'JEFE_DEPARTAMENTO',
      nombre: 'Jefe de Departamento',
      descripcion: 'Gestiona empleados y recursos de su departamento',
    },
  })

  const rolTecnico = await prisma.rol.upsert({
    where: { codigo: 'TECNICO' },
    update: {},
    create: {
      codigo: 'TECNICO',
      nombre: 'Técnico',
      descripcion: 'Gestiona inventario y mantenimiento',
    },
  })

  // Permisos
  const permisosData = [
    { codigo: 'USUARIOS_VER', nombre: 'Ver usuarios', modulo: 'usuarios', accion: 'ver' },
    { codigo: 'USUARIOS_CREAR', nombre: 'Crear usuarios', modulo: 'usuarios', accion: 'crear' },
    { codigo: 'USUARIOS_EDITAR', nombre: 'Editar usuarios', modulo: 'usuarios', accion: 'editar' },
    { codigo: 'USUARIOS_ELIMINAR', nombre: 'Eliminar usuarios', modulo: 'usuarios', accion: 'eliminar' },
    { codigo: 'INVENTARIO_VER', nombre: 'Ver inventario', modulo: 'inventario', accion: 'ver' },
    { codigo: 'INVENTARIO_CREAR', nombre: 'Crear items', modulo: 'inventario', accion: 'crear' },
    { codigo: 'INVENTARIO_EDITAR', nombre: 'Editar items', modulo: 'inventario', accion: 'editar' },
    { codigo: 'INVENTARIO_ELIMINAR', nombre: 'Eliminar items', modulo: 'inventario', accion: 'eliminar' },
    { codigo: 'DESPACHOS_VER', nombre: 'Ver despachos', modulo: 'despachos', accion: 'ver' },
    { codigo: 'DESPACHOS_CREAR', nombre: 'Crear despachos', modulo: 'despachos', accion: 'crear' },
    { codigo: 'DESPACHOS_APROBAR', nombre: 'Aprobar despachos', modulo: 'despachos', accion: 'aprobar' },
    { codigo: 'ASIGNACIONES_VER', nombre: 'Ver asignaciones', modulo: 'asignaciones', accion: 'ver' },
    { codigo: 'ASIGNACIONES_CREAR', nombre: 'Crear asignaciones', modulo: 'asignaciones', accion: 'crear' },
    { codigo: 'AUDITORIA_VER', nombre: 'Ver auditoría', modulo: 'auditoria', accion: 'ver' },
    { codigo: 'CATALOGOS_GESTIONAR', nombre: 'Gestionar catálogos', modulo: 'catalogos', accion: 'gestionar' },
    { codigo: 'REPORTES_VER', nombre: 'Ver reportes', modulo: 'reportes', accion: 'ver' },
    { codigo: 'REPORTES_EXPORTAR', nombre: 'Exportar reportes', modulo: 'reportes', accion: 'exportar' },
  ]

  for (const perm of permisosData) {
    await prisma.permiso.upsert({
      where: { codigo: perm.codigo },
      update: {},
      create: perm,
    })
  }

  // Asignar todos los permisos al rol ADMIN
  const permisos = await prisma.permiso.findMany()
  await prisma.rol.update({
    where: { id: rolAdmin.id },
    data: { permisos: { connect: permisos.map(p => ({ id: p.id })) } },
  })

  // ============================================
  // USUARIO ADMIN
  // ============================================
  console.log('Creating admin user...')

  const hashedPassword = await bcrypt.hash('admin123', 10)

  const adminUser = await prisma.usuario.upsert({
    where: { email: 'admin@fibex.com' },
    update: {},
    create: {
      email: 'admin@fibex.com',
      password: hashedPassword,
      nombre: 'Administrador',
      apellido: 'Sistema',
      cargo: 'Administrator',
      telefono: '0000-000-0000',
      rolId: rolAdmin.id,
    },
  })

  // ============================================
  // SEDES (OFICINAS COMERCIALES)
  // ============================================
  console.log('Creating sedes (oficinas)...')

  const sedesData = [
    { codigo: 'SEDE-CAJ', nombre: 'Oficina Cajicá', direccion: 'Carrera 5 # 12-45', ciudad: 'Cajicá', estado: 'Cundinamarca' },
    { codigo: 'SEDE-BOG', nombre: 'Oficina Bogotá', direccion: 'Carrera 7 # 71-21', ciudad: 'Bogotá', estado: 'Cundinamarca' },
    { codigo: 'SEDE-MED', nombre: 'Oficina Medellín', direccion: 'Calle 50 # 51-24', ciudad: 'Medellín', estado: 'Antioquia' },
    { codigo: 'SEDE-CAL', nombre: 'Oficina Cali', direccion: 'Avenida 6N # 22-10', ciudad: 'Cali', estado: 'Valle del Cauca' },
  ]

  const sedes = []
  for (const sede of sedesData) {
    const s = await prisma.sede.upsert({
      where: { codigo: sede.codigo },
      update: {},
      create: sede,
    })
    sedes.push(s)
  }

  // ============================================
  // DEPARTAMENTOS
  // ============================================
  console.log('Creating departamentos...')

  const deptosData = [
    { codigo: 'DEPT-IT', nombre: 'Tecnología de Información', sedeId: sedes[0].id },
    { codigo: 'DEPT-RRHH', nombre: 'Recursos Humanos', sedeId: sedes[0].id },
    { codigo: 'DEPT-CONT', nombre: 'Contabilidad', sedeId: sedes[0].id },
    { codigo: 'DEPT-VENT', nombre: 'Ventas', sedeId: sedes[0].id },
    { codigo: 'DEPT-MARK', nombre: 'Mercadeo', sedeId: sedes[0].id },
    { codigo: 'DEPT-OP', nombre: 'Operaciones', sedeId: sedes[0].id },
    { codigo: 'DEPT-JUR', nombre: 'Jurídica', sedeId: sedes[1].id },
    { codigo: 'DEPT-ADM', nombre: 'Administración', sedeId: sedes[1].id },
  ]

  const deptos = []
  for (const dept of deptosData) {
    const d = await prisma.departamento.upsert({
      where: { codigo: dept.codigo },
      update: {},
      create: dept,
    })
    deptos.push(d)
  }

  // ============================================
  // EMPLEADOS DE EJEMPLO
  // ============================================
  console.log('Creating employees...')

  const empleadosData = [
    { codigo: 'EMP-001', cedula: '12345678', nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@fibex.com', cargo: 'Desarrollador', departamentoId: deptos[0].id, sedeId: sedes[0].id },
    { codigo: 'EMP-002', cedula: '23456789', nombre: 'María', apellido: 'García', email: 'maria.garcia@fibex.com', cargo: 'Diseñadora', departamentoId: deptos[4].id, sedeId: sedes[0].id },
    { codigo: 'EMP-003', cedula: '34567890', nombre: 'Carlos', apellido: 'Rodríguez', email: 'carlos.rodriguez@fibex.com', cargo: 'Gerente Ventas', departamentoId: deptos[3].id, sedeId: sedes[0].id },
    { codigo: 'EMP-004', cedula: '45678901', nombre: 'Ana', apellido: 'López', email: 'ana.lopez@fibex.com', cargo: 'Contadora', departamentoId: deptos[2].id, sedeId: sedes[0].id },
    { codigo: 'EMP-005', cedula: '56789012', nombre: 'Luis', apellido: 'Martínez', email: 'luis.martinez@fibex.com', cargo: 'Técnico IT', departamentoId: deptos[0].id, sedeId: sedes[0].id },
  ]

  const empleados = []
  for (const emp of empleadosData) {
    const e = await prisma.empleado.upsert({
      where: { codigo: emp.codigo },
      update: {},
      create: {
        ...emp,
        fechaIngreso: new Date('2024-01-15'),
      },
    })
    empleados.push(e)
  }

  // ============================================
  // CATEGORÍAS (TIPOS DE EQUIPOS - DINÁMICOS)
  // ============================================
  console.log('Creating categorias (tipos de equipos)...')

  const categoriasData = [
    { codigo: 'CAT-PC', nombre: 'Computador de Escritorio', tipo: 'EQUIPO_COMPUTO', descripcion: 'PC de escritorio o All-in-One' },
    { codigo: 'CAT-LAPTOP', nombre: 'Laptop / Portátil', tipo: 'EQUIPO_COMPUTO', descripcion: 'Computadores portátiles' },
    { codigo: 'CAT-SERVIDOR', nombre: 'Servidor', tipo: 'EQUIPO_COMPUTO', descripcion: 'Servidores físicos' },
    { codigo: 'CAT-MONITOR', nombre: 'Monitor', tipo: 'PERIFERICO', descripcion: 'Monitores y pantallas' },
    { codigo: 'CAT-KEYB', nombre: 'Teclado', tipo: 'PERIFERICO', descripcion: 'Teclados' },
    { codigo: 'CAT-MOUSE', nombre: 'Mouse', tipo: 'PERIFERICO', descripcion: 'Mouse y trackballs' },
    { codigo: 'CAT-HEADSET', nombre: 'Auriculares/Micrófono', tipo: 'COMUNICACION', descripcion: 'Audio para comunicación' },
    { codigo: 'CAT-WEB CAM', nombre: 'Cámara Web', tipo: 'COMUNICACION', descripcion: 'Cámaras para video conferencias' },
    { codigo: 'CAT-IMPRESORA', nombre: 'Impresora', tipo: 'PERIFERICO', descripcion: 'Impresoras y multifuncionales' },
    { codigo: 'CAT-SCANNER', nombre: 'Escáner', tipo: 'PERIFERICO', descripcion: 'Escáneres de documentos' },
    { codigo: 'CAT-TELEFONO', nombre: 'Teléfono IP', tipo: 'COMUNICACION', descripcion: 'Teléfonos IP y extensiones' },
    { codigo: 'CAT-TABLET', nombre: 'Tableta', tipo: 'EQUIPO_COMPUTO', descripcion: 'Tablets y dispositivos táctiles' },
    { codigo: 'CAT-ROUTER', nombre: 'Router/Access Point', tipo: 'SEGURIDAD', descripcion: 'Equipos de red' },
    { codigo: 'CAT-SWITCH', nombre: 'Switch', tipo: 'SEGURIDAD', descripcion: 'Switches de red' },
    { codigo: 'CAT-UPS', nombre: 'UPS', tipo: 'ELECTRICO', descripcion: 'Ups y reguladores' },
    { codigo: 'CAT-OTRO', nombre: 'Otro', tipo: 'OTRO', descripcion: 'Otros equipos' },
  ]

  const categorias = []
  for (const cat of categoriasData) {
    const c = await prisma.categoria.upsert({
      where: { codigo: cat.codigo },
      update: {},
      create: cat,
    })
    categorias.push(c)
  }

  // ============================================
  // MARCAS
  // ============================================
  console.log('Creating marcas...')

  const marcasData = [
    { codigo: 'MAR-DELL', nombre: 'Dell' },
    { codigo: 'MAR-HP', nombre: 'HP' },
    { codigo: 'MAR-LENOVO', nombre: 'Lenovo' },
    { codigo: 'MAR-ASUS', nombre: 'Asus' },
    { codigo: 'MAR-APPLE', nombre: 'Apple' },
    { codigo: 'MAR-ACER', nombre: 'Acer' },
    { codigo: 'MAR-MS', nombre: 'Microsoft' },
    { codigo: 'MAR-SAMSUNG', nombre: 'Samsung' },
    { codigo: 'MAR-LG', nombre: 'LG' },
    { codigo: 'MAR-LOGITECH', nombre: 'Logitech' },
    { codigo: 'MAR-CISCO', nombre: 'Cisco' },
    { codigo: 'MAR-TP-LINK', nombre: 'TP-Link' },
    { codigo: 'MAR-EPSON', nombre: 'Epson' },
    { codigo: 'MAR-CANON', nombre: 'Canon' },
    { codigo: 'MAR-OTRO', nombre: 'Otra' },
  ]

  const marcas = []
  for (const marca of marcasData) {
    const m = await prisma.marca.upsert({
      where: { codigo: marca.codigo },
      update: {},
      create: marca,
    })
    marcas.push(m)
  }

  // ============================================
  // MODELOS
  // ============================================
  console.log('Creating modelos...')

  const modelosData = [
    // Dell
    { codigo: 'MOD-DELL-OPT-7090', nombre: 'OptiPlex 7090', marcaId: marcas[0].id, categoriaId: categorias[0].id },
    { codigo: 'MOD-DELL-LAT-5420', nombre: 'Latitude 5420', marcaId: marcas[0].id, categoriaId: categorias[1].id },
    { codigo: 'MOD-DELL-PREC-7560', nombre: 'Precision 7560', marcaId: marcas[0].id, categoriaId: categorias[1].id },
    // HP
    { codigo: 'MOD-HP-PRO-400', nombre: 'ProDesk 400', marcaId: marcas[1].id, categoriaId: categorias[0].id },
    { codigo: 'MOD-HP-ELITE-840', nombre: 'EliteBook 840', marcaId: marcas[1].id, categoriaId: categorias[1].id },
    // Lenovo
    { codigo: 'MOD-LEN-THINKP', nombre: 'ThinkPad T14', marcaId: marcas[2].id, categoriaId: categorias[1].id },
    { codigo: 'MOD-LEN-ThinkC', nombre: 'ThinkCentre M70q', marcaId: marcas[2].id, categoriaId: categorias[0].id },
    // Apple
    { codigo: 'MOD-AP-MAC-M1', nombre: 'MacBook Pro M1', marcaId: marcas[4].id, categoriaId: categorias[1].id },
    { codigo: 'MOD-AP-MAC-DES', nombre: 'iMac 24"', marcaId: marcas[4].id, categoriaId: categorias[0].id },
    // Monitores
    { codigo: 'MOD-DELL-MON-27', nombre: 'UltraSharp U2722D 27"', marcaId: marcas[0].id, categoriaId: categorias[3].id },
    { codigo: 'MOD-LG-MON-24', nombre: '24MB35QB 24"', marcaId: marcas[8].id, categoriaId: categorias[3].id },
    // Impresoras
    { codigo: 'MOD-EPS-L3150', nombre: 'EcoTank L3150', marcaId: marcas[12].id, categoriaId: categorias[8].id },
  ]

  const modelos = []
  for (const mod of modelosData) {
    const m = await prisma.modelo.upsert({
      where: { codigo: mod.codigo },
      update: {},
      create: mod,
    })
    modelos.push(m)
  }

  // ============================================
  // PRODUCTOS
  // ============================================
  console.log('Creating productos...')

  const productosData = [
    { codigo: 'PROD-LAP-001', nombre: 'Laptop Dell Latitude 5420', categoriaId: categorias[1].id, modeloId: modelos[4].id },
    { codigo: 'PROD-LAP-002', nombre: 'Laptop HP EliteBook 840 G8', categoriaId: categorias[1].id, modeloId: modelos[6].id },
    { codigo: 'PROD-LAP-003', nombre: 'Laptop Lenovo ThinkPad T14', categoriaId: categorias[1].id, modeloId: modelos[7].id },
    { codigo: 'PROD-LAP-004', nombre: 'MacBook Pro 14" M1', categoriaId: categorias[1].id, modeloId: modelos[8].id },
    { codigo: 'PROD-PC-001', nombre: 'Desktop Dell OptiPlex 7090', categoriaId: categorias[0].id, modeloId: modelos[0].id },
    { codigo: 'PROD-PC-002', nombre: 'Desktop HP ProDesk 400 G7', categoriaId: categorias[0].id, modeloId: modelos[3].id },
    { codigo: 'PROD-MON-001', nombre: 'Monitor Dell 27" 4K', categoriaId: categorias[3].id, modeloId: modelos[10].id },
    { codigo: 'PROD-MON-002', nombre: 'Monitor LG 24" Full HD', categoriaId: categorias[3].id, modeloId: modelos[11].id },
    { codigo: 'PROD-TEC-001', nombre: 'Teclado Logitech K380', categoriaId: categorias[4].id },
    { codigo: 'PROD-MOU-001', nombre: 'Mouse Logitech MX Master', categoriaId: categorias[5].id },
    { codigo: 'PROD-AUR-001', nombre: 'Headset Logitech H390', categoriaId: categorias[6].id },
    { codigo: 'PROD-CAM-001', nombre: 'Webcam Logitech C920', categoriaId: categorias[7].id },
    { codigo: 'PROD-IMP-001', nombre: 'Impresora Epson L3150', categoriaId: categorias[8].id },
    { codigo: 'PROD-TEL-001', nombre: 'Teléfono IP Yealink T46S', categoriaId: categorias[10].id },
  ]

  for (const prod of productosData) {
    await prisma.producto.upsert({
      where: { codigo: prod.codigo },
      update: {},
      create: prod,
    })
  }

  // ============================================
  // TIPOS PARAMÉTRICOS
  // ============================================
  console.log('Creating tipos parametricos...')

  // Tipo para estados de mantenimiento
  const tipoMant = await prisma.tipoParametrico.upsert({
    where: { codigo: 'ESTADO_MANTENIMIENTO' },
    update: {},
    create: {
      codigo: 'ESTADO_MANTENIMIENTO',
      nombre: 'Estados de Mantenimiento',
      modulo: 'mantenimiento',
    },
  })

  await prisma.valorParametrico.createMany({
    data: [
      { tipoParametricoId: tipoMant.id, codigo: 'PENDIENTE', nombre: 'Pendiente', orden: 1 },
      { tipoParametricoId: tipoMant.id, codigo: 'EN_PROCESO', nombre: 'En Proceso', orden: 2 },
      { tipoParametricoId: tipoMant.id, codigo: 'COMPLETADO', nombre: 'Completado', orden: 3 },
      { tipoParametricoId: tipoMant.id, codigo: 'CANCELADO', nombre: 'Cancelado', orden: 4 },
    ],
    skipDuplicates: true,
  })

  // Tipo para prioridades de equipos
  const tipoPrioridad = await prisma.tipoParametrico.upsert({
    where: { codigo: 'PRIORIDAD_EQUIPO' },
    update: {},
    create: {
      codigo: 'PRIORIDAD_EQUIPO',
      nombre: 'Prioridad de Equipo',
      modulo: 'inventario',
    },
  })

  await prisma.valorParametrico.createMany({
    data: [
      { tipoParametricoId: tipoPrioridad.id, codigo: 'CRITICA', nombre: 'Crítica', orden: 1 },
      { tipoParametricoId: tipoPrioridad.id, codigo: 'ALTA', nombre: 'Alta', orden: 2 },
      { tipoParametricoId: tipoPrioridad.id, codigo: 'MEDIA', nombre: 'Media', orden: 3 },
      { tipoParametricoId: tipoPrioridad.id, codigo: 'BAJA', nombre: 'Baja', orden: 4 },
    ],
    skipDuplicates: true,
  })

  // ============================================
  // CONFIGURACIONES
  // ============================================
  console.log('Creating configuraciones...')

  const configsData = [
    { clave: 'EMPRESA_NOMBRE', valor: 'FIBEX', descripcion: 'Nombre de la empresa', categoria: 'empresa' },
    { clave: 'EMPRESA_NIT', valor: '900000000-0', descripcion: 'NIT de la empresa', categoria: 'empresa' },
    { clave: 'INVENTARIO_QT_ALERTA', valor: '10', descripcion: 'Cantidad mínima de alerta', categoria: 'inventario' },
    { clave: 'DIAS_VENCIMIENTO_GARANTIA', valor: '365', descripcion: 'Días de alerta de garantía', categoria: 'inventario' },
    { clave: 'QR_BASE_URL', valor: 'http://localhost:3000/equipo', descripcion: 'URL base para QR', categoria: 'sistema' },
  ]

  for (const config of configsData) {
    await prisma.configuracion.upsert({
      where: { clave: config.clave },
      update: {},
      create: config,
    })
  }

  console.log('✅ Seed completed successfully!')
  console.log('')
  console.log('📋 Login credentials:')
  console.log('   Email: admin@fibex.com')
  console.log('   Password: admin123')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })