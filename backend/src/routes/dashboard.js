const express = require('express');
const router = express.Router();
const {
  getResumen,
  getMovimientosPorMes,
  getTopArticulos,
  getStockPorSede,
  getUltimasEntregas,
  getAlertas,
  marcarAlertaLeida
} = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

router.get('/resumen', authenticateToken, getResumen);
router.get('/movimientos-por-mes', authenticateToken, getMovimientosPorMes);
router.get('/top-articulos', authenticateToken, getTopArticulos);
router.get('/stock-por-sede', authenticateToken, getStockPorSede);
router.get('/ultimas-entregas', authenticateToken, getUltimasEntregas);
router.get('/alertas', authenticateToken, getAlertas);
router.put('/alertas/:id/leer', authenticateToken, marcarAlertaLeida);

module.exports = router;
