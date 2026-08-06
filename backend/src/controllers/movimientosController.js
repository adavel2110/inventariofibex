const { movimientos, stock } = require('../models/queries');
const db = require('../config/database');

const getAll = async (req, res) => {
  try {
    const movimientosList = await movimientos.findAll(req.query);
    res.json(movimientosList);
  } catch (error) {
    console.error('Error obteniendo movimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const movimiento = await movimientos.findById(req.params.id);
    if (!movimiento) {
      return res.status(404).json({ error: 'Movimiento no encontrado' });
    }

    const detalles = await movimientos.getDetalles(req.params.id);
    res.json({ ...movimiento, detalles });
  } catch (error) {
    console.error('Error obteniendo movimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  const client = await db.getClient();
  
  try {
    await client.query('BEGIN');

    const { tipo, sede_origen_id, sede_destino_id, beneficiario_id, documento_referencia, observaciones, fecha_movimiento, detalles } = req.body;

    // Create movement
    const movimiento = await movimientos.create(client, {
      tipo,
      sede_origen_id,
      sede_destino_id,
      beneficiario_id,
      usuario_id: req.user.id,
      documento_referencia,
      observaciones,
      fecha_movimiento
    });

    // Process each detail
    for (const detalle of detalles) {
      const { articulo_id, cantidad, precio_unitario } = detalle;

      // Create detail
      await movimientos.createDetalle(client, movimiento.id, articulo_id, cantidad, precio_unitario);

      // Update stock based on movement type
      switch (tipo) {
        case 'entrada':
          await stock.incrementCantidad(articulo_id, sede_origen_id, cantidad);
          break;

        case 'salida':
          await stock.decrementCantidad(articulo_id, sede_origen_id, cantidad);
          break;

        case 'asignacion':
          await stock.decrementCantidad(articulo_id, sede_origen_id, cantidad);
          break;

        case 'devolucion':
          await stock.incrementCantidad(articulo_id, sede_origen_id, cantidad);
          break;

        case 'traslado':
          await stock.decrementCantidad(articulo_id, sede_origen_id, cantidad);
          await stock.incrementCantidad(articulo_id, sede_destino_id, cantidad);
          break;

        case 'ajuste':
          // For adjustments, we update directly
          const stockItem = await stock.findByArticuloAndSede(articulo_id, sede_origen_id);
          if (stockItem) {
            await stock.updateCantidad(stockItem.id, cantidad);
          }
          break;

        case 'baja':
          await stock.decrementCantidad(articulo_id, sede_origen_id, cantidad);
          break;
      }
    }

    await client.query('COMMIT');

    // Return complete movement with details
    const completeMovement = await movimientos.findById(movimiento.id);
    const completeDetails = await movimientos.getDetalles(movimiento.id);

    res.status(201).json({ ...completeMovement, detalles: completeDetails });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando movimiento:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

const getEstadisticas = async (req, res) => {
  try {
    const { año, mes } = req.query;
    const stats = await movimientos.getEstadisticasMensuales(
      parseInt(año) || new Date().getFullYear(),
      parseInt(mes) || new Date().getMonth() + 1
    );
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, create, getEstadisticas };
