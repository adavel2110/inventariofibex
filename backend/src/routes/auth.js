const express = require('express');
const router = express.Router();
const { login, register, getProfile, changePassword, updateProfile } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { validateLogin, validateUsuario } = require('../middleware/validate');

router.post('/login', validateLogin, login);
router.post('/register', validateUsuario, register);
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/change-password', authenticateToken, changePassword);

module.exports = router;
