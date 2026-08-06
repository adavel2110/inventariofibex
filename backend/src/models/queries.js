const db = require('../config/database');

// Helper function to trim strings
const trimString = (str) => typeof str === 'string' ? str.trim() : str;

// ==================== USUARIOS ====================
const usuarios = {
  findAll: async () => {
    const result = await db.query(
      'SELECT id, username, email, nombre_completo, rol, activo, ultimo_acceso, created_at FROM usuarios ORDER BY created_at DESC'
    );
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query(
      'SELECT id, username, email, nombre_completo, rol, activo, ultimo_acceso, created_at FROM usuarios WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  findByEmail: async (email) => {
    const result = await db.query(
      'SELECT * FROM usuarios WHERE email = $1',
      [trimString(email)]
    );
    return result.rows[0];
  },

  findByUsername: async (username) => {
    const result = await db.query(
      'SELECT * FROM usuarios WHERE username = $1',
      [trimString(username)]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const { username, email, password_hash, nombre_completo, rol } = data;
    const result = await db.query(
      'INSERT INTO usuarios (username, email, password_hash, nombre_completo, rol) VALUES ($1, $2, $3, $4, $5) RETURNING id, username, email, nombre_completo, rol, activo, created_at',
      [trimString(username), trimString(email).toLowerCase(), password_hash, trimString(nombre_completo), rol || 'operador']
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { nombre_completo, email, rol, activo } = data;
    const result = await db.query(
      'UPDATE usuarios SET nombre_completo = COALESCE($1, nombre_completo), email = COALESCE($2, email), rol = COALESCE($3, rol), activo = COALESCE($4, activo) WHERE id = $5 RETURNING id, username, email, nombre_completo, rol, activo',
      [trimString(nombre_completo), trimString(email)?.toLowerCase(), rol, activo, id]
    );
    return result.rows[0];
  },

  updatePassword: async (id, password_hash) => {
    const result = await db.query(
      'UPDATE usuarios SET password_hash = $1 WHERE id = $2 RETURNING id',
      [password_hash, id]
    );
    return result.rowCount > 0;
  },

  updateLastAccess: async (id) => {
    await db.query(
      'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
      [id]
    );
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

// ==================== SEDES ====================
const sedes = {
  findAll: async () => {
    const result = await db.query(
      'SELECT * FROM sedes WHERE activa = true ORDER BY nombre'
    );
    return result.rows;
  },

  findAllIncludingInactive: async () => {
    const result = await db.query(
      'SELECT * FROM sedes ORDER BY nombre'
    );
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query('SELECT * FROM sedes WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const { nombre, direccion, ciudad, pais, telefono, responsable } = data;
    const result = await db.query(
      'INSERT INTO sedes (nombre, direccion, ciudad, pais, telefono, responsable) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [
        trimString(nombre),
        trimString(direccion),
        trimString(ciudad),
        trimString(pais) || 'Venezuela',
        trimString(telefono),
        trimString(responsable)
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { nombre, direccion, ciudad, pais, telefono, responsable, activa } = data;
    const result = await db.query(
      'UPDATE sedes SET nombre = COALESCE($1, nombre), direccion = COALESCE($2, direccion), ciudad = COALESCE($3, ciudad), pais = COALESCE($4, pais), telefono = COALESCE($5, telefono), responsable = COALESCE($6, responsable), activa = COALESCE($7, activa) WHERE id = $8 RETURNING *',
      [trimString(nombre), trimString(direccion), trimString(ciudad), trimString(pais), trimString(telefono), trimString(responsable), activa, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('UPDATE sedes SET activa = false WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

// ==================== CATEGORIAS ====================
const categorias = {
  findAll: async () => {
    const result = await db.query(
      'SELECT * FROM categorias WHERE activa = true ORDER BY nombre'
    );
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query('SELECT * FROM categorias WHERE id = $1', [id]);
    return result.rows[0];
  },

  create: async (data) => {
    const { nombre, descripcion, stock_minimo } = data;
    const result = await db.query(
      'INSERT INTO categorias (nombre, descripcion, stock_minimo) VALUES ($1, $2, $3) RETURNING *',
      [trimString(nombre), trimString(descripcion), stock_minimo || 5]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { nombre, descripcion, stock_minimo, activa } = data;
    const result = await db.query(
      'UPDATE categorias SET nombre = COALESCE($1, nombre), descripcion = COALESCE($2, descripcion), stock_minimo = COALESCE($3, stock_minimo), activa = COALESCE($4, activa) WHERE id = $5 RETURNING *',
      [trimString(nombre), trimString(descripcion), stock_minimo, activa, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('UPDATE categorias SET activa = false WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

// ==================== ARTICULOS ====================
const articulos = {
  findAll: async (filters = {}) => {
    let query = `
      SELECT a.*, c.nombre as categoria_nombre 
      FROM articulos a 
      LEFT JOIN categorias c ON a.categoria_id = c.id 
      WHERE a.activo = true
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.categoria_id) {
      query += ` AND a.categoria_id = $${paramIndex}`;
      params.push(filters.categoria_id);
      paramIndex++;
    }

    if (filters.marca) {
      query += ` AND LOWER(a.marca) = LOWER($${paramIndex})`;
      params.push(trimString(filters.marca));
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (LOWER(a.nombre) LIKE $${paramIndex} OR LOWER(a.sku) LIKE $${paramIndex} OR LOWER(a.marca) LIKE $${paramIndex})`;
      params.push(`%${trimString(filters.search).toLowerCase()}%`);
      paramIndex++;
    }

    query += ' ORDER BY a.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query(
      `SELECT a.*, c.nombre as categoria_nombre 
       FROM articulos a 
       LEFT JOIN categorias c ON a.categoria_id = c.id 
       WHERE a.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  findBySku: async (sku) => {
    const result = await db.query(
      'SELECT * FROM articulos WHERE sku = $1',
      [trimString(sku)]
    );
    return result.rows[0];
  },

  findByCodigoBarras: async (codigo_barras) => {
    const result = await db.query(
      'SELECT * FROM articulos WHERE codigo_barras = $1',
      [trimString(codigo_barras)]
    );
    return result.rows[0];
  },

  generateSku: async (categoria_id) => {
    const result = await db.query(
      `SELECT COUNT(*) + 1 as next_num FROM articulos WHERE categoria_id = $1`,
      [categoria_id]
    );
    const num = result.rows[0].next_num;
    const prefix = result.rows[0].categoria_nombre?.substring(0, 3).toUpperCase() || 'ART';
    return `${prefix}-${String(num).padStart(5, '0')}`;
  },

  create: async (data) => {
    const { sku, nombre, descripcion, marca, modelo, categoria_id, unidad_medida, precio_unitario, codigo_barras, codigo_qr, imagen_url } = data;
    const result = await db.query(
      `INSERT INTO articulos (sku, nombre, descripcion, marca, modelo, categoria_id, unidad_medida, precio_unitario, codigo_barras, codigo_qr, imagen_url) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
      [
        trimString(sku),
        trimString(nombre),
        trimString(descripcion),
        trimString(marca),
        trimString(modelo),
        categoria_id,
        trimString(unidad_medida) || 'Unidad',
        precio_unitario,
        trimString(codigo_barras),
        trimString(codigo_qr),
        trimString(imagen_url)
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { nombre, descripcion, marca, modelo, categoria_id, unidad_medida, precio_unitario, codigo_barras, codigo_qr, imagen_url, activo } = data;
    const result = await db.query(
      `UPDATE articulos SET 
        nombre = COALESCE($1, nombre), 
        descripcion = COALESCE($2, descripcion), 
        marca = COALESCE($3, marca), 
        modelo = COALESCE($4, modelo), 
        categoria_id = COALESCE($5, categoria_id), 
        unidad_medida = COALESCE($6, unidad_medida), 
        precio_unitario = COALESCE($7, precio_unitario), 
        codigo_barras = COALESCE($8, codigo_barras), 
        codigo_qr = COALESCE($9, codigo_qr), 
        imagen_url = COALESCE($10, imagen_url),
        activo = COALESCE($11, activo)
       WHERE id = $12 RETURNING *`,
      [trimString(nombre), trimString(descripcion), trimString(marca), trimString(modelo), categoria_id, trimString(unidad_medida), precio_unitario, trimString(codigo_barras), trimString(codigo_qr), trimString(imagen_url), activo, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('UPDATE articulos SET activo = false WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

// ==================== STOCK ====================
const stock = {
  findByArticuloAndSede: async (articulo_id, sede_id) => {
    const result = await db.query(
      `SELECT s.*, a.nombre as articulo_nombre, a.sku, sed.nombre as sede_nombre 
       FROM stock s 
       JOIN articulos a ON s.articulo_id = a.id 
       JOIN sedes sed ON s.sede_id = sed.id 
       WHERE s.articulo_id = $1 AND s.sede_id = $2`,
      [articulo_id, sede_id]
    );
    return result.rows[0];
  },

  findBySede: async (sede_id) => {
    const result = await db.query(
      `SELECT s.*, a.nombre as articulo_nombre, a.sku, a.marca, a.modelo, a.codigo_barras, c.nombre as categoria_nombre
       FROM stock s 
       JOIN articulos a ON s.articulo_id = a.id 
       LEFT JOIN categorias c ON a.categoria_id = c.id
       WHERE s.sede_id = $1 
       ORDER BY c.nombre, a.nombre`,
      [sede_id]
    );
    return result.rows;
  },

  findAll: async () => {
    const result = await db.query(
      `SELECT s.*, a.nombre as articulo_nombre, a.sku, a.marca, a.modelo, sed.nombre as sede_nombre, c.nombre as categoria_nombre
       FROM stock s 
       JOIN articulos a ON s.articulo_id = a.id 
       JOIN sedes sed ON s.sede_id = sed.id
       LEFT JOIN categorias c ON a.categoria_id = c.id
       ORDER BY sed.nombre, c.nombre, a.nombre`
    );
    return result.rows;
  },

  findLowStock: async () => {
    const result = await db.query(
      `SELECT s.*, a.nombre as articulo_nombre, a.sku, sed.nombre as sede_nombre, c.nombre as categoria_nombre
       FROM stock s 
       JOIN articulos a ON s.articulo_id = a.id 
       JOIN sedes sed ON s.sede_id = sed.id
       LEFT JOIN categorias c ON a.categoria_id = c.id
       WHERE s.cantidad <= s.stock_minimo
       ORDER BY (s.stock_minimo - s.cantidad) DESC`
    );
    return result.rows;
  },

  createOrUpdate: async (data) => {
    const { articulo_id, sede_id, cantidad, stock_minimo, stock_maximo, ubicacion } = data;
    const result = await db.query(
      `INSERT INTO stock (articulo_id, sede_id, cantidad, stock_minimo, stock_maximo, ubicacion) 
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (articulo_id, sede_id) 
       DO UPDATE SET cantidad = stock.cantidad + $3, stock_minimo = COALESCE($4, stock.stock_minimo), stock_maximo = COALESCE($5, stock.stock_maximo), ubicacion = COALESCE($6, stock.ubicacion)
       RETURNING *`,
      [articulo_id, sede_id, cantidad, stock_minimo, stock_maximo, trimString(ubicacion)]
    );
    return result.rows[0];
  },

  updateCantidad: async (id, cantidad) => {
    const result = await db.query(
      'UPDATE stock SET cantidad = $1 WHERE id = $2 RETURNING *',
      [cantidad, id]
    );
    return result.rows[0];
  },

  decrementCantidad: async (articulo_id, sede_id, cantidad) => {
    const result = await db.query(
      `UPDATE stock SET cantidad = cantidad - $1 
       WHERE articulo_id = $2 AND sede_id = $3 AND cantidad >= $1 
       RETURNING *`,
      [cantidad, articulo_id, sede_id]
    );
    return result.rowCount > 0;
  },

  incrementCantidad: async (articulo_id, sede_id, cantidad) => {
    const result = await db.query(
      `UPDATE stock SET cantidad = cantidad + $1 
       WHERE articulo_id = $2 AND sede_id = $3 
       RETURNING *`,
      [cantidad, articulo_id, sede_id]
    );
    return result.rowCount > 0;
  }
};

// ==================== BENEFICIARIOS ====================
const beneficiarios = {
  findAll: async (filters = {}) => {
    let query = `
      SELECT b.*, sed.nombre as sede_nombre 
      FROM beneficiarios b 
      LEFT JOIN sedes sed ON b.sede_id = sed.id 
      WHERE b.activo = true
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.search) {
      query += ` AND (LOWER(b.nombre_completo) LIKE $${paramIndex} OR LOWER(b.cedula) LIKE $${paramIndex} OR LOWER(b.dependencia) LIKE $${paramIndex})`;
      params.push(`%${trimString(filters.search).toLowerCase()}%`);
      paramIndex++;
    }

    if (filters.sede_id) {
      query += ` AND b.sede_id = $${paramIndex}`;
      params.push(filters.sede_id);
      paramIndex++;
    }

    query += ' ORDER BY b.nombre_completo';

    const result = await db.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query(
      `SELECT b.*, sed.nombre as sede_nombre 
       FROM beneficiarios b 
       LEFT JOIN sedes sed ON b.sede_id = sed.id 
       WHERE b.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  findByCedula: async (cedula) => {
    const result = await db.query(
      'SELECT * FROM beneficiarios WHERE cedula = $1',
      [trimString(cedula)]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const { cedula, nombre_completo, email, telefono, dependencia, cargo, sede_id } = data;
    const result = await db.query(
      `INSERT INTO beneficiarios (cedula, nombre_completo, email, telefono, dependencia, cargo, sede_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        trimString(cedula),
        trimString(nombre_completo),
        trimString(email)?.toLowerCase(),
        trimString(telefono),
        trimString(dependencia),
        trimString(cargo),
        sede_id
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { cedula, nombre_completo, email, telefono, dependencia, cargo, sede_id, activo } = data;
    const result = await db.query(
      `UPDATE beneficiarios SET 
        cedula = COALESCE($1, cedula), 
        nombre_completo = COALESCE($2, nombre_completo), 
        email = COALESCE($3, email), 
        telefono = COALESCE($4, telefono), 
        dependencia = COALESCE($5, dependencia), 
        cargo = COALESCE($6, cargo), 
        sede_id = COALESCE($7, sede_id),
        activo = COALESCE($8, activo)
       WHERE id = $9 RETURNING *`,
      [trimString(cedula), trimString(nombre_completo), trimString(email)?.toLowerCase(), trimString(telefono), trimString(dependencia), trimString(cargo), sede_id, activo, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('UPDATE beneficiarios SET activo = false WHERE id = $1', [id]);
    return result.rowCount > 0;
  }
};

// ==================== MOVIMIENTOS ====================
const movimientos = {
  findAll: async (filters = {}) => {
    let query = `
      SELECT m.*, 
        u.nombre_completo as usuario_nombre,
        b.nombre_completo as beneficiario_nombre,
        b.cedula as beneficiario_cedula,
        sor.nombre as sede_origen_nombre,
        sde.nombre as sede_destino_nombre
      FROM movimientos m
      LEFT JOIN usuarios u ON m.usuario_id = u.id
      LEFT JOIN beneficiarios b ON m.beneficiario_id = b.id
      LEFT JOIN sedes sor ON m.sede_origen_id = sor.id
      LEFT JOIN sedes sde ON m.sede_destino_id = sde.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.tipo) {
      query += ` AND m.tipo = $${paramIndex}`;
      params.push(filters.tipo);
      paramIndex++;
    }

    if (filters.sede_id) {
      query += ` AND (m.sede_origen_id = $${paramIndex} OR m.sede_destino_id = $${paramIndex})`;
      params.push(filters.sede_id);
      paramIndex++;
    }

    if (filters.fecha_desde) {
      query += ` AND m.fecha_movimiento >= $${paramIndex}`;
      params.push(filters.fecha_desde);
      paramIndex++;
    }

    if (filters.fecha_hasta) {
      query += ` AND m.fecha_movimiento <= $${paramIndex}`;
      params.push(filters.fecha_hasta);
      paramIndex++;
    }

    query += ' ORDER BY m.created_at DESC';

    if (filters.limit) {
      query += ` LIMIT $${paramIndex}`;
      params.push(filters.limit);
      paramIndex++;
    }

    const result = await db.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query(
      `SELECT m.*, 
        u.nombre_completo as usuario_nombre,
        b.nombre_completo as beneficiario_nombre,
        b.cedula as beneficiario_cedula,
        sor.nombre as sede_origen_nombre,
        sde.nombre as sede_destino_nombre
       FROM movimientos m
       LEFT JOIN usuarios u ON m.usuario_id = u.id
       LEFT JOIN beneficiarios b ON m.beneficiario_id = b.id
       LEFT JOIN sedes sor ON m.sede_origen_id = sor.id
       LEFT JOIN sedes sde ON m.sede_destino_id = sde.id
       WHERE m.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  create: async (client, data) => {
    const { tipo, sede_origen_id, sede_destino_id, beneficiario_id, usuario_id, documento_referencia, observaciones, fecha_movimiento } = data;
    const result = await client.query(
      `INSERT INTO movimientos (tipo, sede_origen_id, sede_destino_id, beneficiario_id, usuario_id, documento_referencia, observaciones, fecha_movimiento) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        tipo,
        sede_origen_id,
        sede_destino_id,
        beneficiario_id,
        usuario_id,
        trimString(documento_referencia),
        trimString(observaciones),
        fecha_movimiento || new Date().toISOString().split('T')[0]
      ]
    );
    return result.rows[0];
  },

  createDetalle: async (client, movimiento_id, articulo_id, cantidad, precio_unitario) => {
    const result = await client.query(
      `INSERT INTO detalle_movimientos (movimiento_id, articulo_id, cantidad, precio_unitario) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [movimiento_id, articulo_id, cantidad, precio_unitario]
    );
    return result.rows[0];
  },

  getDetalles: async (movimiento_id) => {
    const result = await db.query(
      `SELECT dm.*, a.nombre as articulo_nombre, a.sku, a.marca, a.modelo
       FROM detalle_movimientos dm
       JOIN articulos a ON dm.articulo_id = a.id
       WHERE dm.movimiento_id = $1`,
      [movimiento_id]
    );
    return result.rows;
  },

  getEstadisticasMensuales: async (año, mes) => {
    const result = await db.query(
      `SELECT tipo, COUNT(*) as cantidad, SUM(dm.cantidad) as total_unidades
       FROM movimientos m
       LEFT JOIN detalle_movimientos dm ON m.id = dm.movimiento_id
       WHERE EXTRACT(YEAR FROM m.fecha_movimiento) = $1 
       AND EXTRACT(MONTH FROM m.fecha_movimiento) = $2
       GROUP BY tipo`,
      [año, mes]
    );
    return result.rows;
  }
};

// ==================== DASHBOARD ====================
const dashboard = {
  getResumen: async () => {
    const [totalArticulos, totalSedes, totalBeneficiarios, stockBajo, movimientosHoy] = await Promise.all([
      db.query('SELECT COUNT(*) as total FROM articulos WHERE activo = true'),
      db.query('SELECT COUNT(*) as total FROM sedes WHERE activa = true'),
      db.query('SELECT COUNT(*) as total FROM beneficiarios WHERE activo = true'),
      db.query(
        `SELECT COUNT(*) as total FROM stock s 
         JOIN articulos a ON s.articulo_id = a.id 
         WHERE s.cantidad <= s.stock_minimo AND a.activo = true`
      ),
      db.query(
        `SELECT COUNT(*) as total FROM movimientos 
         WHERE fecha_movimiento = CURRENT_DATE`
      )
    ]);

    return {
      total_articulos: parseInt(totalArticulos.rows[0].total),
      total_sedes: parseInt(totalSedes.rows[0].total),
      total_beneficiarios: parseInt(totalBeneficiarios.rows[0].total),
      stock_bajo: parseInt(stockBajo.rows[0].total),
      movimientos_hoy: parseInt(movimientosHoy.rows[0].total)
    };
  },

  getMovimientosPorMes: async (año) => {
    const result = await db.query(
      `SELECT 
        EXTRACT(MONTH FROM fecha_movimiento) as mes,
        tipo,
        COUNT(*) as cantidad
       FROM movimientos
       WHERE EXTRACT(YEAR FROM fecha_movimiento) = $1
       GROUP BY EXTRACT(MONTH FROM fecha_movimiento), tipo
       ORDER BY mes`,
      [año]
    );
    return result.rows;
  },

  getTopArticulos: async (limit = 10) => {
    const result = await db.query(
      `SELECT a.nombre, a.sku, a.marca, SUM(dm.cantidad) as total_movido
       FROM detalle_movimientos dm
       JOIN articulos a ON dm.articulo_id = a.id
       JOIN movimientos m ON dm.movimiento_id = m.id
       WHERE m.fecha_movimiento >= CURRENT_DATE - INTERVAL '30 days'
       GROUP BY a.id, a.nombre, a.sku, a.marca
       ORDER BY total_movido DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  getStockPorSede: async () => {
    const result = await db.query(
      `SELECT sed.nombre as sede_nombre, 
              COUNT(DISTINCT s.articulo_id) as total_articulos,
              SUM(s.cantidad) as total_unidades
       FROM stock s
       JOIN sedes sed ON s.sede_id = sed.id
       WHERE sed.activa = true
       GROUP BY sed.id, sed.nombre
       ORDER BY total_unidades DESC`
    );
    return result.rows;
  },

  getUltimasEntregas: async (limit = 10) => {
    const result = await db.query(
      `SELECT m.fecha_movimiento, m.tipo,
              b.nombre_completo as beneficiario_nombre,
              sed.nombre as sede_nombre,
              u.nombre_completo as usuario_nombre,
              COUNT(dm.id) as total_articulos
       FROM movimientos m
       LEFT JOIN beneficiarios b ON m.beneficiario_id = b.id
       LEFT JOIN sedes sed ON m.sede_origen_id = sed.id
       LEFT JOIN usuarios u ON m.usuario_id = u.id
       LEFT JOIN detalle_movimientos dm ON m.id = dm.movimiento_id
       WHERE m.tipo IN ('salida', 'asignacion')
       GROUP BY m.id, m.fecha_movimiento, m.tipo, b.nombre_completo, sed.nombre, u.nombre_completo
       ORDER BY m.created_at DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }
};

// ==================== ALERTAS ====================
const alertas = {
  findPendientes: async () => {
    const result = await db.query(
      `SELECT al.*, a.nombre as articulo_nombre, a.sku, sed.nombre as sede_nombre
       FROM alertas al
       LEFT JOIN articulos a ON al.articulo_id = a.id
       LEFT JOIN sedes sed ON al.sede_id = sed.id
       WHERE al.leida = false
       ORDER BY al.created_at DESC`
    );
    return result.rows;
  },

  create: async (data) => {
    const { tipo, articulo_id, sede_id, mensaje } = data;
    const result = await db.query(
      'INSERT INTO alertas (tipo, articulo_id, sede_id, mensaje) VALUES ($1, $2, $3, $4) RETURNING *',
      [tipo, articulo_id, sede_id, mensaje]
    );
    return result.rows[0];
  },

  markAsRead: async (id) => {
    const result = await db.query(
      'UPDATE alertas SET leida = true WHERE id = $1 RETURNING *',
      [id]
    );
    return result.rows[0];
  },

  generateLowStockAlerts: async () => {
    const result = await db.query(
      `INSERT INTO alertas (tipo, articulo_id, sede_id, mensaje)
       SELECT 
         'stock_bajo',
         s.articulo_id,
         s.sede_id,
         CONCAT('Stock bajo: ', a.nombre, ' (', a.sku, ') - Cantidad: ', s.cantidad, ', Mínimo: ', s.stock_minimo)
       FROM stock s
       JOIN articulos a ON s.articulo_id = a.id
       WHERE s.cantidad <= s.stock_minimo
       AND NOT EXISTS (
         SELECT 1 FROM alertas al 
         WHERE al.articulo_id = s.articulo_id 
         AND al.sede_id = s.sede_id 
         AND al.tipo = 'stock_bajo' 
         AND al.leida = false
       )
       RETURNING *`
    );
    return result.rows;
  }
};

// ==================== PEDIDOS ====================
const pedidos = {
  findAll: async (filters = {}) => {
    let query = `
      SELECT p.*, 
        u.nombre_completo as usuario_nombre,
        sed.nombre as sede_nombre
      FROM pedidos p
      LEFT JOIN usuarios u ON p.usuario_id = u.id
      LEFT JOIN sedes sed ON p.sede_id = sed.id
      WHERE 1=1
    `;
    const params = [];
    let paramIndex = 1;

    if (filters.estado) {
      query += ` AND p.estado = $${paramIndex}`;
      params.push(filters.estado);
      paramIndex++;
    }

    if (filters.sede_id) {
      query += ` AND p.sede_id = $${paramIndex}`;
      params.push(filters.sede_id);
      paramIndex++;
    }

    if (filters.fecha_desde) {
      query += ` AND p.fecha_pedido >= $${paramIndex}`;
      params.push(filters.fecha_desde);
      paramIndex++;
    }

    if (filters.fecha_hasta) {
      query += ` AND p.fecha_pedido <= $${paramIndex}`;
      params.push(filters.fecha_hasta);
      paramIndex++;
    }

    if (filters.search) {
      query += ` AND (LOWER(p.numero_pedido) LIKE $${paramIndex} OR LOWER(p.recibe) LIKE $${paramIndex} OR LOWER(p.proveedor) LIKE $${paramIndex})`;
      params.push(`%${filters.search.toLowerCase()}%`);
      paramIndex++;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await db.query(query, params);
    return result.rows;
  },

  findById: async (id) => {
    const result = await db.query(
      `SELECT p.*, 
        u.nombre_completo as usuario_nombre,
        sed.nombre as sede_nombre
       FROM pedidos p
       LEFT JOIN usuarios u ON p.usuario_id = u.id
       LEFT JOIN sedes sed ON p.sede_id = sed.id
       WHERE p.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  findByNumero: async (numero) => {
    const result = await db.query(
      'SELECT * FROM pedidos WHERE numero_pedido = $1',
      [trimString(numero)]
    );
    return result.rows[0];
  },

  create: async (data) => {
    const { numero_pedido, recibe, fecha_pedido, fecha_ingreso, proveedor, observaciones, usuario_id, sede_id } = data;
    const result = await db.query(
      `INSERT INTO pedidos (numero_pedido, recibe, fecha_pedido, fecha_ingreso, proveedor, observaciones, usuario_id, sede_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        trimString(numero_pedido),
        trimString(recibe),
        fecha_pedido || new Date().toISOString().split('T')[0],
        fecha_ingreso || new Date().toISOString().split('T')[0],
        trimString(proveedor),
        trimString(observaciones),
        usuario_id,
        sede_id
      ]
    );
    return result.rows[0];
  },

  update: async (id, data) => {
    const { numero_pedido, recibe, fecha_pedido, fecha_ingreso, proveedor, observaciones, estado, sede_id } = data;
    const result = await db.query(
      `UPDATE pedidos SET 
        numero_pedido = COALESCE($1, numero_pedido),
        recibe = COALESCE($2, recibe),
        fecha_pedido = COALESCE($3, fecha_pedido),
        fecha_ingreso = COALESCE($4, fecha_ingreso),
        proveedor = COALESCE($5, proveedor),
        observaciones = COALESCE($6, observaciones),
        estado = COALESCE($7, estado),
        sede_id = COALESCE($8, sede_id)
       WHERE id = $9 RETURNING *`,
      [trimString(numero_pedido), trimString(recibe), fecha_pedido, fecha_ingreso, trimString(proveedor), trimString(observaciones), estado, sede_id, id]
    );
    return result.rows[0];
  },

  delete: async (id) => {
    const result = await db.query('DELETE FROM pedidos WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  // Detalle
  getDetalles: async (pedido_id) => {
    const result = await db.query(
      `SELECT dp.*, a.nombre as articulo_nombre, a.sku, a.marca, a.modelo, a.codigo_barras
       FROM detalle_pedidos dp
       LEFT JOIN articulos a ON dp.articulo_id = a.id
       WHERE dp.pedido_id = $1
       ORDER BY dp.created_at`,
      [pedido_id]
    );
    return result.rows;
  },

  createDetalle: async (client, data) => {
    const { pedido_id, articulo_id, cantidad_solicitada, cantidad_recibida, precio_unitario, observaciones } = data;
    const result = await client.query(
      `INSERT INTO detalle_pedidos (pedido_id, articulo_id, cantidad_solicitada, cantidad_recibida, precio_unitario, observaciones) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [pedido_id, articulo_id, cantidad_solicitada, cantidad_recibida || 0, precio_unitario, trimString(observaciones)]
    );
    return result.rows[0];
  },

  updateDetalle: async (id, data) => {
    const { cantidad_recibida, observaciones } = data;
    const result = await db.query(
      `UPDATE detalle_pedidos SET cantidad_recibida = COALESCE($1, cantidad_recibida), observaciones = COALESCE($2, observaciones) WHERE id = $3 RETURNING *`,
      [cantidad_recibida, trimString(observaciones), id]
    );
    return result.rows[0];
  },

  deleteDetalle: async (id) => {
    const result = await db.query('DELETE FROM detalle_pedidos WHERE id = $1', [id]);
    return result.rowCount > 0;
  },

  updateEstado: async (id) => {
    const result = await db.query(
      `UPDATE pedidos SET estado = CASE 
        WHEN (SELECT COUNT(*) FROM detalle_pedidos WHERE pedido_id = $1) = 0 THEN 'pendiente'
        WHEN (SELECT SUM(cantidad_recibida) FROM detalle_pedidos WHERE pedido_id = $1) >= (SELECT SUM(cantidad_solicitada) FROM detalle_pedidos WHERE pedido_id = $1) THEN 'completado'
        WHEN (SELECT SUM(cantidad_recibida) FROM detalle_pedidos WHERE pedido_id = $1) > 0 THEN 'parcial'
        ELSE 'pendiente'
      END WHERE id = $1 RETURNING *`,
      [id]
    );
    return result.rows[0];
  }
};

module.exports = {
  usuarios,
  sedes,
  categorias,
  articulos,
  stock,
  beneficiarios,
  movimientos,
  dashboard,
  alertas,
  pedidos
};
