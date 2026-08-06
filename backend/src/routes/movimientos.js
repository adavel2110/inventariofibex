const express = require('express');
const router = express.Router();
const { getAll, getById, create, getEstadisticas } = require('../controllers/movimientosController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateMovimiento } = require('../middleware/validate');

router.get('/', authenticateToken, getAll);
router.get('/estadisticas', authenticateToken, getEstadisticas);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, authorizeRoles('admin', 'operador'), validateMovimiento, create);

module.exports = router;
