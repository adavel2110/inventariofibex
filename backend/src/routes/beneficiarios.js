const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/beneficiariosController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateBeneficiario } = require('../middleware/validate');

router.get('/', authenticateToken, getAll);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, authorizeRoles('admin', 'operador'), validateBeneficiario, create);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'operador'), validateBeneficiario, update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), remove);

module.exports = router;
