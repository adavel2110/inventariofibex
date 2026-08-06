const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { usuarios } = require('../models/queries');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await usuarios.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    if (!user.activo) {
      return res.status(401).json({ error: 'Usuario desactivado' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    await usuarios.updateLastAccess(user.id);

    const token = jwt.sign(
      { id: user.id, email: user.email, rol: user.rol },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        nombre_completo: user.nombre_completo,
        rol: user.rol
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, nombre_completo, rol } = req.body;

    const existingUser = await usuarios.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const existingUsername = await usuarios.findByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: 'El username ya está en uso' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await usuarios.create({
      username,
      email,
      password_hash,
      nombre_completo,
      rol
    });

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await usuarios.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await usuarios.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Contraseña actual incorrecta' });
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await usuarios.updatePassword(req.user.id, password_hash);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { nombre_completo, email } = req.body;

    const user = await usuarios.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (email && email !== user.email) {
      const existing = await usuarios.findByEmail(email);
      if (existing) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }
    }

    const updated = await usuarios.update(req.user.id, { nombre_completo, email });
    res.json(updated);
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El email ya está en uso' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { login, register, getProfile, changePassword, updateProfile };
