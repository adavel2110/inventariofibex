const { body, param, query, validationResult } = require('express-validator');

// Middleware to trim and sanitize strings
const trimStrings = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    }
  }
  next();
};

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      error: 'Errores de validación',
      details: errors.array() 
    });
  }
  next();
};

// Validation rules for sedes
const validateSede = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('direccion')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('La dirección no puede exceder 200 caracteres'),
  body('ciudad')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La ciudad no puede exceder 100 caracteres'),
  body('pais')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El país no puede exceder 100 caracteres'),
  body('telefono')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  body('responsable')
    .optional()
    .trim()
    .isLength({ max: 150 }).withMessage('El responsable no puede exceder 150 caracteres'),
  handleValidationErrors
];

// Validation rules for categorias
const validateCategoria = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('descripcion')
    .optional()
    .trim(),
  body('stock_minimo')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero positivo'),
  handleValidationErrors
];

// Validation rules for articulos
const validateArticulo = [
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('El SKU no puede exceder 50 caracteres'),
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('descripcion')
    .optional()
    .trim(),
  body('marca')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La marca no puede exceder 100 caracteres'),
  body('modelo')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El modelo no puede exceder 100 caracteres'),
  body('categoria_id')
    .optional()
    .isUUID().withMessage('ID de categoría inválido'),
  body('unidad_medida')
    .optional()
    .isIn(['Unidad', 'Kit', 'Par', 'Rollo', 'Caja', 'Metro', 'Litro']).withMessage('Unidad de medida inválida'),
  body('precio_unitario')
    .optional()
    .isFloat({ min: 0 }).withMessage('El precio debe ser un número positivo'),
  handleValidationErrors
];

// Validation rules for beneficiarios
const validateBeneficiario = [
  body('cedula')
    .trim()
    .notEmpty().withMessage('La cédula es requerida')
    .isLength({ max: 20 }).withMessage('La cédula no puede exceder 20 caracteres'),
  body('nombre_completo')
    .trim()
    .notEmpty().withMessage('El nombre completo es requerido')
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Email inválido')
    .isLength({ max: 100 }).withMessage('El email no puede exceder 100 caracteres'),
  body('telefono')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('El teléfono no puede exceder 20 caracteres'),
  body('dependencia')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('La dependencia no puede exceder 100 caracteres'),
  body('cargo')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('El cargo no puede exceder 100 caracteres'),
  body('sede_id')
    .optional()
    .isUUID().withMessage('ID de sede inválido'),
  handleValidationErrors
];

// Validation rules for usuarios
const validateUsuario = [
  body('username')
    .trim()
    .notEmpty().withMessage('El username es requerido')
    .isLength({ min: 3, max: 50 }).withMessage('El username debe tener entre 3 y 50 caracteres')
    .isAlphanumeric().withMessage('El username solo puede contener letras y números'),
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido')
    .isLength({ max: 100 }).withMessage('El email no puede exceder 100 caracteres'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('nombre_completo')
    .trim()
    .notEmpty().withMessage('El nombre completo es requerido')
    .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('rol')
    .optional()
    .isIn(['admin', 'operador', 'consulta']).withMessage('Rol inválido'),
  handleValidationErrors
];

// Validation rules for login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('El email es requerido')
    .isEmail().withMessage('Email inválido'),
  body('password')
    .notEmpty().withMessage('La contraseña es requerida'),
  handleValidationErrors
];

// Validation rules for stock
const validateStock = [
  body('articulo_id')
    .notEmpty().withMessage('El artículo es requerido')
    .isUUID().withMessage('ID de artículo inválido'),
  body('sede_id')
    .notEmpty().withMessage('La sede es requerida')
    .isUUID().withMessage('ID de sede inválido'),
  body('cantidad')
    .isInt({ min: 0 }).withMessage('La cantidad debe ser un número entero no negativo'),
  body('stock_minimo')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock mínimo debe ser un número entero no negativo'),
  body('stock_maximo')
    .optional()
    .isInt({ min: 0 }).withMessage('El stock máximo debe ser un número entero no negativo'),
  handleValidationErrors
];

// Validation rules for movimientos
const validateMovimiento = [
  body('tipo')
    .notEmpty().withMessage('El tipo de movimiento es requerido')
    .isIn(['entrada', 'salida', 'asignacion', 'devolucion', 'traslado', 'ajuste', 'baja']).withMessage('Tipo de movimiento inválido'),
  body('sede_origen_id')
    .optional()
    .isUUID().withMessage('ID de sede origen inválido'),
  body('sede_destino_id')
    .optional()
    .isUUID().withMessage('ID de sede destino inválido'),
  body('beneficiario_id')
    .optional()
    .isUUID().withMessage('ID de beneficiario inválido'),
  body('documento_referencia')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('El documento de referencia no puede exceder 50 caracteres'),
  body('observaciones')
    .optional()
    .trim(),
  body('fecha_movimiento')
    .optional()
    .isDate().withMessage('Fecha inválida'),
  body('detalles')
    .isArray({ min: 1 }).withMessage('Debe incluir al menos un artículo'),
  body('detalles.*.articulo_id')
    .isUUID().withMessage('ID de artículo inválido'),
  body('detalles.*.cantidad')
    .isInt({ min: 1 }).withMessage('La cantidad debe ser mayor a 0'),
  handleValidationErrors
];

module.exports = {
  trimStrings,
  handleValidationErrors,
  validateSede,
  validateCategoria,
  validateArticulo,
  validateBeneficiario,
  validateUsuario,
  validateLogin,
  validateStock,
  validateMovimiento
};
