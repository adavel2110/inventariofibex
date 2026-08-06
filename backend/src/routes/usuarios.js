const express = require('express');
const router = express.Router();
const { getAll, getById, create, update, remove, updatePassword } = require('../controllers/usuariosController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateUsuario } = require('../middleware/validate');

router.get('/', authenticateToken, authorizeRoles('admin'), getAll);
router.get('/:id', authenticateToken, authorizeRoles('admin'), getById);
router.post('/', authenticateToken, authorizeRoles('admin'), validateUsuario, create);
router.put('/:id', authenticateToken, authorizeRoles('admin'), update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), remove);
router.put('/:id/password', authenticateToken, authorizeRoles('admin'), updatePassword);

module.exports = router;
