const express = require('express');
const router = express.Router();
const { getReporteInventario, getReporteMovimientos, getReporteAsignaciones, getKardex } = require('../controllers/reportesController');
const { authenticateToken } = require('../middleware/auth');

router.get('/inventario', authenticateToken, getReporteInventario);
router.get('/movimientos', authenticateToken, getReporteMovimientos);
router.get('/asignaciones', authenticateToken, getReporteAsignaciones);
router.get('/kardex', authenticateToken, getKardex);

module.exports = router;
