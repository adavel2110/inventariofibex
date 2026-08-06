const { articulos } = require('../models/queries');
const { generateQRCode } = require('../utils/qrcode');
const { v4: uuidv4 } = require('uuid');

const getAll = async (req, res) => {
  try {
    const articulosList = await articulos.findAll(req.query);
    res.json(articulosList);
  } catch (error) {
    console.error('Error obteniendo artículos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const articulo = await articulos.findById(req.params.id);
    if (!articulo) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }
    res.json(articulo);
  } catch (error) {
    console.error('Error obteniendo artículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    let { sku, codigo_barras, codigo_qr } = req.body;

    // Generate SKU if not provided
    if (!sku) {
      sku = await articulos.generateSku(req.body.categoria_id);
    }

    // Generate unique codes for barcode and QR
    if (!codigo_barras) {
      codigo_barras = `BC-${uuidv4().substring(0, 8).toUpperCase()}`;
    }
    if (!codigo_qr) {
      codigo_qr = `QR-${uuidv4().substring(0, 8).toUpperCase()}`;
    }

    const newArticulo = await articulos.create({
      ...req.body,
      sku,
      codigo_barras,
      codigo_qr
    });

    // Generate QR code data
    const qrData = await generateQRCode(JSON.stringify({
      id: newArticulo.id,
      sku: newArticulo.sku,
      nombre: newArticulo.nombre
    }));

    res.status(201).json({
      ...newArticulo,
      qr_image: qrData
    });
  } catch (error) {
    console.error('Error creando artículo:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un artículo con ese SKU o código' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const update = async (req, res) => {
  try {
    const articulo = await articulos.findById(req.params.id);
    if (!articulo) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    const updatedArticulo = await articulos.update(req.params.id, req.body);
    res.json(updatedArticulo);
  } catch (error) {
    console.error('Error actualizando artículo:', error);
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Ya existe un artículo con ese código' });
    }
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const articulo = await articulos.findById(req.params.id);
    if (!articulo) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    await articulos.delete(req.params.id);
    res.json({ message: 'Artículo desactivado correctamente' });
  } catch (error) {
    console.error('Error desactivando artículo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const generateBarcode = async (req, res) => {
  try {
    const articulo = await articulos.findById(req.params.id);
    if (!articulo) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    const { generateBarcode: genBarcode } = require('../utils/barcode');
    const barcodeBuffer = genBarcode(articulo.codigo_barras || articulo.sku);

    res.set('Content-Type', 'image/png');
    res.send(barcodeBuffer);
  } catch (error) {
    console.error('Error generando código de barras:', error);
    res.status(500).json({ error: 'Error generando código de barras' });
  }
};

const generateQR = async (req, res) => {
  try {
    const articulo = await articulos.findById(req.params.id);
    if (!articulo) {
      return res.status(404).json({ error: 'Artículo no encontrado' });
    }

    const qrData = await generateQRCode(JSON.stringify({
      id: articulo.id,
      sku: articulo.sku,
      nombre: articulo.nombre,
      marca: articulo.marca,
      modelo: articulo.modelo
    }));

    res.json({ qr: qrData });
  } catch (error) {
    console.error('Error generando código QR:', error);
    res.status(500).json({ error: 'Error generando código QR' });
  }
};

module.exports = { getAll, getById, create, update, remove, generateBarcode, generateQR };
