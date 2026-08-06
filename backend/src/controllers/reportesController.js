const db = require('../config/database');

const getReporteInventario = async (req, res) => {
  try {
    const { sede_id, categoria_id } = req.query;
    
    let query = `
      SELECT a.sku, a.nombre, a.marca, a.modelo, a.codigo_barras,
             c.nombre as categoria, sed.nombre as sede, s.cantidad,
             s.stock_minimo, s.ubicacion
      FROM stock s
      JOIN articulos a ON s.articulo_id = a.id
      JOIN sedes sed ON s.sede_id = sed.id
      LEFT JOIN categorias c ON a.categoria_id = c.id
      WHERE a.activo = true AND sed.activa = true
    `;
    const params = [];
    let paramIndex = 1;

    if (sede_id) {
      query += ` AND s.sede_id = $${paramIndex}`;
      params.push(sede_id);
      paramIndex++;
    }

    if (categoria_id) {
      query += ` AND a.categoria_id = $${paramIndex}`;
      params.push(categoria_id);
      paramIndex++;
    }

    query += ' ORDER BY sed.nombre, c.nombre, a.nombre';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generando reporte de inventario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getReporteMovimientos = async (req, res) => {
  try {
    const { fecha_desde, fecha_hasta, tipo, sede_id } = req.query;
    
    let query = `
      SELECT m.fecha_movimiento, m.tipo, m.documento_referencia,
             a.nombre as articulo, a.sku, dm.cantidad,
             sor.nombre as sede_origen, sde.nombre as sede_destino,
             b.nombre_completo as beneficiario, u.nombre_completo as usuario
      FROM movimientos m
      JOIN detalle_movimientos dm ON m.id = dm.movimiento_id
      JOIN articulos a ON dm.articulo_id = a.id
      LEFT JOIN sedes sor ON m.sede_origen_id = sor.id
      LEFT JOIN sedes sde ON m.sede_destino_id = sde.id
      LEFT JOIN beneficiarios b ON m.beneficiario_id = b.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (fecha_desde) {
      query += ` AND m.fecha_movimiento >= $${paramIndex}`;
      params.push(fecha_desde);
      paramIndex++;
    }

    if (fecha_hasta) {
      query += ` AND m.fecha_movimiento <= $${paramIndex}`;
      params.push(fecha_hasta);
      paramIndex++;
    }

    if (tipo) {
      query += ` AND m.tipo = $${paramIndex}`;
      params.push(tipo);
      paramIndex++;
    }

    if (sede_id) {
      query += ` AND (m.sede_origen_id = $${paramIndex} OR m.sede_destino_id = $${paramIndex})`;
      params.push(sede_id);
      paramIndex++;
    }

    query += ' ORDER BY m.fecha_movimiento DESC, m.created_at DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generando reporte de movimientos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getReporteAsignaciones = async (req, res) => {
  try {
    const { sede_id } = req.query;
    
    let query = `
      SELECT b.nombre_completo as beneficiario, b.cedula, b.dependencia, b.cargo,
             sed.nombre as sede,
             a.nombre as articulo, a.sku, a.marca, a.modelo, a.codigo_barras,
             m.fecha_movimiento, m.observaciones
      FROM movimientos m
      JOIN detalle_movimientos dm ON m.id = dm.movimiento_id
      JOIN articulos a ON dm.articulo_id = a.id
      JOIN beneficiarios b ON m.beneficiario_id = b.id
      JOIN sedes sed ON m.sede_origen_id = sed.id
      WHERE m.tipo = 'asignacion'
    `;
    const params = [];
    let paramIndex = 1;

    if (sede_id) {
      query += ` AND m.sede_origen_id = $${paramIndex}`;
      params.push(sede_id);
      paramIndex++;
    }

    query += ' ORDER BY b.nombre_completo, m.fecha_movimiento DESC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generando reporte de asignaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const getKardex = async (req, res) => {
  try {
    const { articulo_id, fecha_desde, fecha_hasta } = req.query;
    
    let query = `
      SELECT m.fecha_movimiento, m.tipo, dm.cantidad,
             sor.nombre as sede_origen, sde.nombre as sede_destino,
             b.nombre_completo as beneficiario, u.nombre_completo as usuario,
             m.documento_referencia, m.observaciones
      FROM movimientos m
      JOIN detalle_movimientos dm ON m.id = dm.movimiento_id
      LEFT JOIN sedes sor ON m.sede_origen_id = sor.id
      LEFT JOIN sedes sde ON m.sede_destino_id = sde.id
      LEFT JOIN beneficiarios b ON m.beneficiario_id = b.id
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      WHERE dm.articulo_id = $1
    `;
    const params = [articulo_id];
    let paramIndex = 2;

    if (fecha_desde) {
      query += ` AND m.fecha_movimiento >= $${paramIndex}`;
      params.push(fecha_desde);
      paramIndex++;
    }

    if (fecha_hasta) {
      query += ` AND m.fecha_movimiento <= $${paramIndex}`;
      params.push(fecha_hasta);
      paramIndex++;
    }

    query += ' ORDER BY m.fecha_movimiento ASC, m.created_at ASC';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error generando kardex:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getReporteInventario,
  getReporteMovimientos,
  getReporteAsignaciones,
  getKardex
};
