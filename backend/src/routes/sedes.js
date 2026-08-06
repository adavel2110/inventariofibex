const express = require('express');
const router = express.Router();
const { getAll, getAllIncludingInactive, getById, create, update, remove } = require('../controllers/sedesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateSede } = require('../middleware/validate');

router.get('/', authenticateToken, getAll);
router.get('/all', authenticateToken, authorizeRoles('admin'), getAllIncludingInactive);
router.get('/:id', authenticateToken, getById);
router.post('/', authenticateToken, authorizeRoles('admin', 'operador'), validateSede, create);
router.put('/:id', authenticateToken, authorizeRoles('admin', 'operador'), validateSede, update);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), remove);

module.exports = router;
