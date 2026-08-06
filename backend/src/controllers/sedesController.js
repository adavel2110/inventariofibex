const { sedes } = require('../models/queries');

const getAll = async (req, res) => {
  try {
    const sedesList = await sedes.findAll();
    res.json(sedesList);
  } catch (error) {
    console.error('Error obteniendo sedes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getAllIncludingInactive = async (req, res) => {
  try {
    const sedesList = await sedes.findAllIncludingInactive();
    res.json(sedesList);
  } catch (error) {
    console.error('Error obteniendo sedes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const sede = await sedes.findById(req.params.id);
    if (!sede) {
      return res.status(404).json({ error: 'Sede no encontrada' });
    }
    res.json(sede);
  } catch (error) {
    console.error('Error obteniendo sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const newSede = await sedes.create(req.body);
    res.status(201).json(newSede);
  } catch (error) {
    console.error('Error creando sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  try {
    const sede = await sedes.findById(req.params.id);
    if (!sede) {
      return res.status(404).json({ error: 'Sede no encontrada' });
    }

    const updatedSede = await sedes.update(req.params.id, req.body);
    res.json(updatedSede);
  } catch (error) {
    console.error('Error actualizando sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const sede = await sedes.findById(req.params.id);
    if (!sede) {
      return res.status(404).json({ error: 'Sede no encontrada' });
    }

    await sedes.delete(req.params.id);
    res.json({ message: 'Sede desactivada correctamente' });
  } catch (error) {
    console.error('Error desactivando sede:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getAllIncludingInactive, getById, create, update, remove };
