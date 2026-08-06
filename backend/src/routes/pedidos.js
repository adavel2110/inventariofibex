const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, updateDetalle, deleteDetalle, processPedido } = require('../controllers/pedidosController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, getAll);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, authorizeRoles('admin', 'operador'), create);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'operador'), update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), remove);
router.put('/:id/detalles/:detalleId', authenticateToken, authorizeRoles('admin', 'operador'), updateDetalle);
router.delete('/:id/detalles/:detalleId', authenticateToken, authorizeRoles('admin', 'operador'), deleteDetalle);
router.post('/:id/procesar', authenticateToken, authorizeRoles('admin'), processPedido);

module.exports = router;
