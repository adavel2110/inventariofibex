## Plan: Sistema de inventario de activos

TL;DR: Diseñar un sistema centralizado que gestione stock de consumibles (mouse, tintas, toner, teclados) y activos fijos (equipos nuevos), con asignación a personal y registro histórico de entregas.

**Pasos**
1. Analizar los datos actuales del Excel.
   - Identificar hojas, columnas y registros disponibles.
   - Confirmar qué campos existen para: categoría, descripción, cantidad, serial/SKU, ubicación, asignado a, fecha de entrega, estado, proveedor.
   - Si falta información, definir los campos necesarios para el modelo.
2. Definir el modelo de datos.
   - Entidad `Articulo` / `Activo`: categoría, subcategoría, SKU/serial, descripción, marca/modelo, unidad de medida.
   - Entidad `StockItem`: cantidad disponible, ubicación, lote/fecha de ingreso, mínimo de stock, estado.
   - Entidad `Empleado`: nombre, documento, departamento, área, cargo, contacto.
   - Entidad `Asignacion`: activo, empleado, fecha de entrega, fecha de devolución, condición, observaciones, responsable.
   - Entidad `Movimiento`: entrada, salida, reasignación, baja, auditoría.
3. Elegir arquitectura mínima viable.
   - Backend con base de datos relacional (SQLite para prototipo, Postgres/MySQL para producción).
   - API REST o aplicación web ligera.
   - Frontend simple para: registrar stock, ver niveles, asignar activos, consultar entregas y devoluciones.
   - Operaciones clave: alta de artículos, recepción de stock, salida de stock, asignación, devolución, ajuste de inventario.
4. Diseñar flujos de control.
   - Para consumibles: ingreso de stock, consumo por despacho, control de stock mínimo y alertas.
   - Para equipos: alta con serial, registro de asignación a empleado, devolución, seguimiento de estado.
   - Para asignaciones: debe existir un registro único con empleado actual y el historial de cambios.
5. Establecer mejores prácticas.
   - Separar consumibles de activos fijos.
   - Usar identificación única: SKU para consumibles, serial para equipos.
   - Registrar siempre responsable de la entrega y fecha.
   - Llevar historial de movimientos para auditoría.
   - Integrar alertas de stock bajo y control de vencimientos si aplica para tinta/toner.
   - Usar un formulario de entrega/recepción firmado digitalmente o con aprobación interna.
6. Validación y puesta en marcha.
   - Importar los datos existentes desde el Excel al modelo nuevo.
   - Probar consultas clave: "¿qué equipo tiene asignado X empleado?", "¿qué consumibles están bajos?", "historial de entregas de mouse/toner".
   - Ajustar el diseño según necesidades reales del departamento y los controles de la empresa.

**Relevancia actual del workspace**
- Actualmente no hay código en `/home/adavel/Descargas/fibex/inventariofibex`; solo el archivo `Inventario_Unificado_Fibex_2026-05-05.xlsx`.
- El paso inicial imprescindible es inspeccionar el contenido del Excel y mapear las columnas existentes.

**Verificación**
1. Listar hojas y columnas del Excel.
2. Confirmar que el modelo cubre consumibles y equipos nuevos.
3. Verificar que la consulta de asignaciones devuelva el empleado actual para cada equipo.
4. Probar el flujo de ingreso/salida de stock y la generación de alertas.

**Decisiones importantes**
- El sistema debe diferenciar entre inventario de consumo y activos fijos.
- La prioridad es controlar quién tiene cada equipo entregado, con historial de cambio.
- Para un prototipo rápido, usar una base relacional y una interfaz web ligera.

**Pendiente / solicitud de datos**
- Necesito los encabezados de columnas del archivo Excel o una muestra de registros para mapear el modelo exacto.
- Si quieres, puedo proponer una estructura de base de datos concreta basada en esas columnas.