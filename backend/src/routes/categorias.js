const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove } = require('../controllers/categoriasController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateCategoria } = require('../middleware/validate');

router.get('/', authenticateToken, getAll);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, authorizeRoles('admin', 'operador'), validateCategoria, create);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'operador'), validateCategoria, update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), remove);

module.exports = router;
