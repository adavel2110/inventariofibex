const { pedidos, stock } = require('../models/queries');
const db = require('../config/database');

const getAll = async (req, res) => {
  try {
    const pedidosList = await pedidos.findAll(req.query);
    res.json(pedidosList);
  } catch (error) {
    console.error('Error obteniendo pedidos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const pedido = await pedidos.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const detalles = await pedidos.getDetalles(req.params.id);
    res.json({ ...pedido, detalles });
  } catch (error) {
    console.error('Error obteniendo pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const { numero_pedido, recibe, fecha_pedido, fecha_ingreso, proveedor, observaciones, sede_id, detalles } = req.body;

    // Verify numero_pedido unique
    const existing = await pedidos.findByNumero(numero_pedido);
    if (existing) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Ya existe un pedido con ese número' });
    }

    // Create pedido
    const pedido = await pedidos.create({
      numero_pedido,
      recibe,
      fecha_pedido,
      fecha_ingreso,
      proveedor,
      observaciones,
      usuario_id: req.user.id,
      sede_id
    });

    // Create details
    if (detalles && detalles.length > 0) {
      for (const det of detalles) {
        await pedidos.createDetalle(client, {
          pedido_id: pedido.id,
          articulo_id: det.articulo_id,
          cantidad_solicitada: det.cantidad_solicitada,
          cantidad_recibida: det.cantidad_recibida || 0,
          precio_unitario: det.precio_unitario,
          observaciones: det.observaciones
        });
      }
    }

    await client.query('COMMIT');

    const completePedido = await pedidos.findById(pedido.id);
    const completeDetails = await pedidos.getDetalles(pedido.id);

    res.status(201).json({ ...completePedido, detalles: completeDetails });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creando pedido:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un pedido con ese número' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

const update = async (req, res) => {
  try {
    const pedido = await pedidos.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const updated = await pedidos.update(req.params.id, req.body);
    res.json(updated);
  } catch (error) {
    console.error('Error actualizando pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const pedido = await pedidos.findById(req.params.id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    await pedidos.delete(req.params.id);
    res.json({ message: 'Pedido eliminado correctamente' });
  } catch (error) {
    console.error('Error eliminando pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Update detail received quantity
const updateDetalle = async (req, res) => {
  try {
    const updated = await pedidos.updateDetalle(req.params.detalleId, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }

    // Update pedido estado
    await pedidos.updateEstado(updated.pedido_id);

    res.json(updated);
  } catch (error) {
    console.error('Error actualizando detalle:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Delete detail
const deleteDetalle = async (req, res) => {
  try {
    await pedidos.deleteDetalle(req.params.detalleId);
    await pedidos.updateEstado(req.params.id);
    res.json({ message: 'Detalle eliminado' });
  } catch (error) {
    console.error('Error eliminando detalle:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Process pedido - add to stock
const processPedido = async (req, res) => {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const pedido = await pedidos.findById(req.params.id);
    if (!pedido) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const detalles = await pedidos.getDetalles(req.params.id);

    for (const det of detalles) {
      if (det.cantidad_recibida > 0 && det.articulo_id) {
        // Add to stock
        await stock.createOrUpdate({
          articulo_id: det.articulo_id,
          sede_id: pedido.sede_id,
          cantidad: det.cantidad_recibida,
          stock_minimo: 5,
          stock_maximo: 100
        });

        // Create movement
        const { movimientos } = require('../models/queries');
        const movimiento = await movimientos.create(client, {
          tipo: 'entrada',
          sede_origen_id: pedido.sede_id,
          sede_destino_id: null,
          beneficiario_id: null,
          usuario_id: req.user.id,
          documento_referencia: pedido.numero_pedido,
          observaciones: `Pedido ${pedido.numero_pedido} - ${pedido.recibe}`,
          fecha_movimiento: pedido.fecha_ingreso
        });

        await movimientos.createDetalle(client, movimiento.id, det.articulo_id, det.cantidad_recibida, det.precio_unitario);
      }
    }

    // Update estado to completado
    await pedidos.update(req.params.id, { estado: 'completado' });

    await client.query('COMMIT');

    const updatedPedido = await pedidos.findById(req.params.id);
    const updatedDetails = await pedidos.getDetalles(req.params.id);

    res.json({ ...updatedPedido, detalles: updatedDetails });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error procesando pedido:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  } finally {
    client.release();
  }
};

module.exports = { getAll, getById, create, update, remove, updateDetalle, deleteDetalle, processPedido };
