import { PrismaClient } from "@prisma/client";
import * as XLSX from "xlsx";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";

const prisma = new PrismaClient();

interface ExcelRow {
  USUARIO: string;
  UBICACION: string;
  SEDE: string;
  DEPARTAMENTO: string;
  "NOMBRE PC": string;
  OS: string;
  CPU: string;
  "MEMORIA GB": string;
  DISCO: string;
  TIPO: string;
  MARCA: string;
  MODELO: string;
  SERIAL: string;
  "V ANDROID": string;
  IP: string;
  MAC: string;
  PASSWORD: string;
  DIADEMA: string;
  "F ASIG_DIADEMA": string;
  MOUSE: string;
  "MOUSE MODELO": string;
  "F ASIG_MOUSE": string;
  TECLADO: string;
  "TECLADO MODELO": string;
  "F ASIG_TECLADO": string;
  MONITOR: string;
  "MONITOR MODELO": string;
  "F ASIG_MONITOR": string;
  BOLSOS: string;
  "F ASIG_BOLSOS": string;
  "LAST UPDATE": string;
}

async function migrateFromExcel(excelPath: string) {
  console.log("📊 Iniciando migración desde Excel...");
  console.log(`📁 Archivo: ${excelPath}`);

  try {
    // Verificar archivo existe
    if (!fs.existsSync(excelPath)) {
      throw new Error(`Archivo no encontrado: ${excelPath}`);
    }

    // Leer Excel
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as ExcelRow[];

    console.log(`📋 Total de registros: ${data.length}`);

    // Crear sede por defecto
    const sedeDefault = await prisma.sede.upsert({
      where: { codigo: "SED-001" },
      update: {},
      create: {
        id: uuidv4(),
        nombre: "Sede Principal",
        codigo: "SED-001",
        direccion: "Dirección por defecto",
        ciudad: "Ciudad",
        estado: "ACTIVO",
        activo: true,
      },
    });

    // Crear departamento por defecto
    const deptDefault = await prisma.departamento.upsert({
      where: { codigo: "DEPT-001" },
      update: {},
      create: {
        id: uuidv4(),
        nombre: "Tecnología",
        codigo: "DEPT-001",
        sede: { connect: { id: sedeDefault.id } },
        activo: true,
      },
    });

    // Crear categorías
    const categorias = {
      LAPTOP: await prisma.categoria.upsert({
        where: { codigo: "CAT-LAPTOP" },
        update: {},
        create: {
          id: uuidv4(),
          nombre: "Laptop",
          codigo: "CAT-LAPTOP",
          tipo: "EQUIPO",
          activo: true,
        },
      }),
      DESKTOP: await prisma.categoria.upsert({
        where: { codigo: "CAT-DESKTOP" },
        update: {},
        create: {
          id: uuidv4(),
          nombre: "Desktop",
          codigo: "CAT-DESKTOP",
          tipo: "EQUIPO",
          activo: true,
        },
      }),
      MOBILE: await prisma.categoria.upsert({
        where: { codigo: "CAT-MOBILE" },
        update: {},
        create: {
          id: uuidv4(),
          nombre: "Dispositivo Móvil",
          codigo: "CAT-MOBILE",
          tipo: "EQUIPO",
          activo: true,
        },
      }),
      PERIFERICO: await prisma.categoria.upsert({
        where: { codigo: "CAT-PERIF" },
        update: {},
        create: {
          id: uuidv4(),
          nombre: "Periférico",
          codigo: "CAT-PERIF",
          tipo: "PERIFERICO",
          activo: true,
        },
      }),
    };

    // Cache para marcas y modelos
    const marcasCache = new Map<string, string>();
    const modelosCache = new Map<string, string>();
    const productosCache = new Map<string, string>();
    const empleadosCache = new Map<string, string>();

    let procesados = 0;
    const errores: string[] = [];

    for (const row of data) {
      try {
        // Extraer marca del equipo
        const marcaNombre = row.MARCA || "DESCONOCIDA";
        let marcaId = marcasCache.get(marcaNombre);
        if (!marcaId) {
          const marca = await prisma.marca.upsert({
            where: { codigo: `MARCA-${marcaNombre.replace(/\s+/g, "-").toUpperCase()}` },
            update: {},
            create: {
              id: uuidv4(),
              nombre: marcaNombre,
              codigo: `MARCA-${marcaNombre.replace(/\s+/g, "-").toUpperCase()}`,
              activo: true,
            },
          });
          marcaId = marca.id;
          marcasCache.set(marcaNombre, marcaId);
        }

        // Extraer modelo del equipo
        const modeloNombre = row.MODELO || "MODELO-DESCONOCIDO";
        const modeloKey = `${marcaId}-${modeloNombre}`;
        let modeloId = modelosCache.get(modeloKey);
        if (!modeloId) {
          const modelo = await prisma.modelo.upsert({
            where: { codigo: `MOD-${marcaNombre.replace(/\s+/g, "-")}-${modeloNombre.replace(/\s+/g, "-").toUpperCase()}` },
            update: {},
            create: {
              id: uuidv4(),
              nombre: modeloNombre,
              codigo: `MOD-${marcaNombre.replace(/\s+/g, "-")}-${modeloNombre.replace(/\s+/g, "-").toUpperCase()}`,
              marcaId,
              categoriaId: row.TIPO?.toUpperCase().includes("LAPTOP")
                ? categorias.LAPTOP.id
                : row.TIPO?.toUpperCase().includes("DESKTOP")
                ? categorias.DESKTOP.id
                : categorias.MOBILE.id,
              activo: true,
            },
          });
          modeloId = modelo.id;
          modelosCache.set(modeloKey, modeloId);
        }

        // Crear producto
        const productoKey = `${modeloId}-GENERICO`;
        let productoId = productosCache.get(productoKey);
        if (!productoId) {
          const producto = await prisma.producto.create({
            data: {
              id: uuidv4(),
              nombre: `${marcaNombre} ${modeloNombre}`,
              codigo: `PROD-${marcaNombre.replace(/\s+/g, "-")}-${modeloNombre.replace(/\s+/g, "-").toUpperCase()}`,
              categoriaId: row.TIPO?.toUpperCase().includes("LAPTOP")
                ? categorias.LAPTOP.id
                : row.TIPO?.toUpperCase().includes("DESKTOP")
                ? categorias.DESKTOP.id
                : categorias.MOBILE.id,
              modeloId,
              activo: true,
            },
          });
          productoId = producto.id;
          productosCache.set(productoKey, productoId);
        }

        // Crear empleado si tiene usuario
        let empleadoId: string | null = null;
        if (row.USUARIO && row.USUARIO.trim() !== "") {
          const usuarioNombre = row.USUARIO.trim();
          empleadoId = empleadosCache.get(usuarioNombre);
          if (!empleadoId) {
            const partes = usuarioNombre.split(" ");
            const nombre = partes[0] || usuarioNombre;
            const apellido = partes.slice(1).join(" ") || "";

            const empleado = await prisma.empleado.create({
              data: {
                id: uuidv4(),
                codigo: `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                cedula: `TEMP-${Date.now()}`,
                nombre,
                apellido,
                email: `${nombre.toLowerCase().replace(/\s+/g, ".")}@fibex.com`,
                cargo: "Empleado",
                sede: { connect: { id: sedeDefault.id } },
                departamento: { connect: { id: deptDefault.id } },
                fechaIngreso: new Date(),
                activo: true,
              },
            });
            empleadoId = empleado.id;
            empleadosCache.set(usuarioNombre, empleadoId);
          }
        }

        // Crear stock item (equipo principal)
        const stockItem = await prisma.stockItem.create({
          data: {
            id: uuidv4(),
            nombreEquipo: row["NOMBRE PC"] || null,
            numeroSerie: row.SERIAL || null,
            productoId,
            modeloId,
            estado: empleadoId ? "ASIGNADO" : "DISPONIBLE",
            condicion: "NUEVO",
            sede: { connect: { id: sedeDefault.id } },
            departamento: { connect: { id: deptDefault.id } },
            ubicacionFisica: row.UBICACION || null,
            os: row.OS || null,
            cpu: row.CPU || null,
            memoriaGb: row["MEMORIA GB"] || null,
            disco: row.DISCO || null,
            ipAsignada: row.IP || null,
            password: row.PASSWORD || null,
            activo: true,
          },
        });

        // Crear asignación si tiene empleado
        if (empleadoId) {
          await prisma.asignacion.create({
            data: {
              id: uuidv4(),
              codigo: `ASI-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              stockItem: { connect: { id: stockItem.id } },
              empleado: { connect: { id: empleadoId } },
              fechaAsignacion: new Date(),
              condicionEntrega: "NUEVO",
              estado: "ACTIVA",
            },
          });
        }

        // Procesar periféricos (mouse, teclado, monitor, diadema)
        const perifericos = [
          { nombre: row.MOUSE, modelo: row["MOUSE MODELO"], tipo: "MOUSE" },
          { nombre: row.TECLADO, modelo: row["TECLADO MODELO"], tipo: "TECLADO" },
          { nombre: row.MONITOR, modelo: row["MONITOR MODELO"], tipo: "MONITOR" },
          { nombre: row.DIADEMA, modelo: null, tipo: "DIADEMA" },
        ];

        for (const perif of perifericos) {
          if (perif.nombre && perif.nombre.trim() !== "") {
            // Crear o obtener marca del periférico
            const perifMarca = perif.nombre.split(" ")[0] || "GENERICO";
            let perifMarcaId = marcasCache.get(perifMarca);
            if (!perifMarcaId) {
              const marca = await prisma.marca.upsert({
                where: { codigo: `MARCA-${perifMarca.toUpperCase()}` },
                update: {},
                create: {
                  id: uuidv4(),
                  nombre: perifMarca,
                  codigo: `MARCA-${perifMarca.toUpperCase()}`,
                  activo: true,
                },
              });
              perifMarcaId = marca.id;
              marcasCache.set(perifMarca, perifMarcaId);
            }

            // Crear modelo del periférico
            const perifModelo = perif.modelo || `${perif.tipo}-GENERICO`;
            const perifModeloKey = `${perifMarcaId}-${perifModelo}-${perif.tipo}`;
            let perifModeloId = modelosCache.get(perifModeloKey);
            if (!perifModeloId) {
              const modelo = await prisma.modelo.upsert({
                where: { codigo: `MOD-${perif.tipo}-${perifMarca}-${Date.now()}` },
                update: {},
                create: {
                  id: uuidv4(),
                  nombre: perifModelo,
                  codigo: `MOD-${perif.tipo}-${perifMarca}-${Date.now()}`,
                  marcaId: perifMarcaId,
                  categoriaId: categorias.PERIFERICO.id,
                  activo: true,
                },
              });
              perifModeloId = modelo.id;
              modelosCache.set(perifModeloKey, perifModeloId);
            }

            // Crear producto del periférico
            const perifProductoKey = `${perifModeloId}-PERIF`;
            let perifProductoId = productosCache.get(perifProductoKey);
            if (!perifProductoId) {
              const producto = await prisma.producto.create({
                data: {
                  id: uuidv4(),
                  nombre: `${perifMarca} ${perifModelo} (${perif.tipo})`,
                  codigo: `PROD-${perif.tipo}-${Date.now()}`,
                  categoriaId: categorias.PERIFERICO.id,
                  modeloId: perifModeloId,
                  activo: true,
                },
              });
              perifProductoId = producto.id;
              productosCache.set(perifProductoKey, perifProductoId);
            }

            // Crear stock item del periférico vinculado al equipo
            await prisma.stockItem.create({
              data: {
                id: uuidv4(),
                nombreEquipo: `${perif.tipo} ${perifMarca}`,
                productoId: perifProductoId,
                modeloId: perifModeloId,
                estado: "ASIGNADO",
                condicion: "NUEVO",
                sede: { connect: { id: sedeDefault.id } },
                departamento: { connect: { id: deptDefault.id } },
                equipoPadre: { connect: { id: stockItem.id } },
                activo: true,
              },
            });
          }
        }

        procesados++;
        if (procesados % 50 === 0) {
          console.log(`✅ Procesados: ${procesados}/${data.length}`);
        }
      } catch (error) {
        const msg = `Error en fila ${procesados + 1}: ${error instanceof Error ? error.message : "Error desconocido"}`;
        console.error(msg);
        errores.push(msg);
      }
    }

    console.log("\n📊 RESUMEN DE MIGRACIÓN");
    console.log("========================");
    console.log(`✅ Registros procesados exitosamente: ${procesados}`);
    console.log(`❌ Errores: ${errores.length}`);

    if (errores.length > 0) {
      console.log("\n⚠️ Errores encontrados:");
      errores.slice(0, 10).forEach((e) => console.log(`  - ${e}`));
      if (errores.length > 10) {
        console.log(`  ... y ${errores.length - 10} errores más`);
      }
    }

    console.log("\n🎉 Migración completada!");
  } catch (error) {
    console.error("💥 Error en la migración:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const args = process.argv.slice(2);
  const excelPath = args[0] || "./Inventario_Unificado_Fibex_2026-05-05.xlsx";

  migrateFromExcel(excelPath)
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { migrateFromExcel };