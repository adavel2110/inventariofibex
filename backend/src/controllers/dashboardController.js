const { dashboard, alertas } = require('../models/queries');

const getResumen = async (req, res) => {
  try {
    const resumen = await dashboard.getResumen();
    res.json(resumen);
  } catch (error) {
    console.error('Error obteniendo resumen:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getMovimientosPorMes = async (req, res) => {
  try {
    const { año } = req.query;
    const movimientos = await dashboard.getMovimientosPorMes(
      parseInt(año) || new Date().getFullYear()
    );
    res.json(movimientos);
  } catch (error) {
    console.error('Error obteniendo movimientos por mes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getTopArticulos = async (req, res) => {
  try {
    const { limit } = req.query;
    const topArticulos = await dashboard.getTopArticulos(parseInt(limit) || 10);
    res.json(topArticulos);
  } catch (error) {
    console.error('Error obteniendo top artículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getStockPorSede = async (req, res) => {
  try {
    const stockPorSede = await dashboard.getStockPorSede();
    res.json(stockPorSede);
  } catch (error) {
    console.error('Error obteniendo stock por sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getUltimasEntregas = async (req, res) => {
  try {
    const { limit } = req.query;
    const ultimasEntregas = await dashboard.getUltimasEntregas(parseInt(limit) || 10);
    res.json(ultimasEntregas);
  } catch (error) {
    console.error('Error obteniendo últimas entregas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAlertas = async (req, res) => {
  try {
    // Generate new low stock alerts
    await alertas.generateLowStockAlerts();
    
    const alertasPendientes = await alertas.findPendientes();
    res.json(alertasPendientes);
  } catch (error) {
    console.error('Error obteniendo alertas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const marcarAlertaLeida = async (req, res) => {
  try {
    const alerta = await alertas.markAsRead(req.params.id);
    if (!alerta) {
      return res.status(404).json({ error: 'Alerta no encontrada' });
    }
    res.json(alerta);
  } catch (error) {
    console.error('Error marcando alerta:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getResumen,
  getMovimientosPorMes,
  getTopArticulos,
  getStockPorSede,
  getUltimasEntregas,
  getAlertas,
  marcarAlertaLeida
};
