const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, generateBarcode, generateQR } = require('../controllers/articulosController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateArticulo } = require('../middleware/validate');

router.get('/', authenticateToken, getAll);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, authorizeRoles('admin', 'operador'), validateArticulo, create);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'operador'), validateArticulo, update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), remove);
router.get('/:id/barcode', authenticateToken, generateBarcode);
router.get('/:id/qrcode', authenticateToken, generateQR);

module.exports = router;
