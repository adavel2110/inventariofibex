const express = require('express');
const router = express.Router();
const { getAll, getBySede, getLowStock, createOrUpdate, updateCantidad } = require('../controllers/stockController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateStock } = require('../middleware/validate');

router.get('/', authenticateToken, getAll);
router.get('/low', authenticateToken, getLowStock);
router.get('/sede/:sedeId', authenticateToken, getBySede);
router.post('/', authenticateToken, authorizeRoles('admin', 'operador'), validateStock, createOrUpdate);
router.put('/:id/cantidad', authenticateToken, authorizeRoles('admin', 'operador'), updateCantidad);

module.exports = router;
