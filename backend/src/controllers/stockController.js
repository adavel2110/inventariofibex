const { stock, alertas } = require('../models/queries');

const getAll = async (req, res) => {
  try {
    const stockList = await stock.findAll();
    res.json(stockList);
  } catch (error) {
    console.error('Error obteniendo stock:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getBySede = async (req, res) => {
  try {
    const stockList = await stock.findBySede(req.params.sedeId);
    res.json(stockList);
  } catch (error) {
    console.error('Error obteniendo stock por sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getLowStock = async (req, res) => {
  try {
    const lowStock = await stock.findLowStock();
    res.json(lowStock);
  } catch (error) {
    console.error('Error obteniendo stock bajo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const createOrUpdate = async (req, res) => {
  try {
    const stockItem = await stock.createOrUpdate(req.body);

    // Check if stock is low and generate alert
    if (stockItem.cantidad <= stockItem.stock_minimo) {
      const { articulos } = require('../models/queries');
      const articulo = await articulos.findById(stockItem.articulo_id);
      if (articulo) {
        await alertas.create({
          tipo: 'stock_bajo',
          articulo_id: stockItem.articulo_id,
          sede_id: stockItem.sede_id,
          mensaje: `Stock bajo: ${articulo.nombre} (${articulo.sku}) - Cantidad: ${stockItem.cantidad}, Mínimo: ${stockItem.stock_minimo}`
        });
      }
    }

    res.status(201).json(stockItem);
  } catch (error) {
    console.error('Error creando/actualizando stock:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateCantidad = async (req, res) => {
  try {
    const { cantidad } = req.body;
    const updated = await stock.updateCantidad(req.params.id, cantidad);
    if (!updated) {
      return res.status(404).json({ error: 'Registro de stock no encontrado' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error actualizando cantidad:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getBySede, getLowStock, createOrUpdate, updateCantidad };
