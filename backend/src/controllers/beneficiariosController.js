const { beneficiarios } = require('../models/queries');

const getAll = async (req, res) => {
  try {
    const beneficiariosList = await beneficiarios.findAll(req.query);
    res.json(beneficiariosList);
  } catch (error) {
    console.error('Error obteniendo beneficiarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const beneficiario = await beneficiarios.findById(req.params.id);
    if (!beneficiario) {
      return res.status(404).json({ error: 'Beneficiario no encontrado' });
    }
    res.json(beneficiario);
  } catch (error) {
    console.error('Error obteniendo beneficiario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const existing = await beneficiarios.findByCedula(req.body.cedula);
    if (existing) {
      return res.status(400).json({ error: 'Ya existe un beneficiario con esa cédula' });
    }

    const newBeneficiario = await beneficiarios.create(req.body);
    res.status(201).json(newBeneficiario);
  } catch (error) {
    console.error('Error creando beneficiario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un beneficiario con esa cédula' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  try {
    const beneficiario = await beneficiarios.findById(req.params.id);
    if (!beneficiario) {
      return res.status(404).json({ error: 'Beneficiario no encontrado' });
    }

    const updatedBeneficiario = await beneficiarios.update(req.params.id, req.body);
    res.json(updatedBeneficiario);
  } catch (error) {
    console.error('Error actualizando beneficiario:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un beneficiario con esa cédula' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const beneficiario = await beneficiarios.findById(req.params.id);
    if (!beneficiario) {
      return res.status(404).json({ error: 'Beneficiario no encontrado' });
    }

    await beneficiarios.delete(req.params.id);
    res.json({ message: 'Beneficiario desactivado correctamente' });
  } catch (error) {
    console.error('Error desactivando beneficiario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, create, update, remove };
