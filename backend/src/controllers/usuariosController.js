const bcrypt = require('bcryptjs');
const { usuarios } = require('../models/queries');

const getAll = async (req, res) => {
  try {
    const usuariosList = await usuarios.findAll();
    res.json(usuariosList);
  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const usuario = await usuarios.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(usuario);
  } catch (error) {
    console.error('Error obteniendo usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
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
    console.error('Error creando usuario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El email o username ya está en uso' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  try {
    const usuario = await usuarios.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updatedUsuario = await usuarios.update(req.params.id, req.body);
    res.json(updatedUsuario);
  } catch (error) {
    console.error('Error actualizando usuario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'El email ya está en uso' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const usuario = await usuarios.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await usuarios.update(req.params.id, { activo: false });
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error desactivando usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password } = req.body;
    
    const usuario = await usuarios.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await usuarios.updatePassword(req.params.id, password_hash);

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error actualizando contraseña:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, create, update, remove, updatePassword };
