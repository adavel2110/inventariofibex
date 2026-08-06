-- Create UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop tables if they exist
DROP TABLE IF EXISTS alertas CASCADE;
DROP TABLE IF EXISTS detalle_movimientos CASCADE;
DROP TABLE IF EXISTS movimientos CASCADE;
DROP TABLE IF EXISTS stock CASCADE;
DROP TABLE IF EXISTS articulos CASCADE;
DROP TABLE IF EXISTS beneficiarios CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS sedes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- Table: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol VARCHAR(20) CHECK (rol IN ('admin', 'operador', 'consulta')) DEFAULT 'operador',
    activo BOOLEAN DEFAULT true,
    ultimo_acceso TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: sedes
CREATE TABLE sedes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    ciudad VARCHAR(100),
    pais VARCHAR(100) DEFAULT 'Venezuela',
    telefono VARCHAR(20),
    responsable VARCHAR(150),
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: categorias
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    stock_minimo INTEGER DEFAULT 5,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: articulos
CREATE TABLE articulos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sku VARCHAR(50) UNIQUE NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    marca VARCHAR(100),
    modelo VARCHAR(100),
    categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
    unidad_medida VARCHAR(20) DEFAULT 'Unidad',
    precio_unitario DECIMAL(10,2),
    codigo_barras VARCHAR(100) UNIQUE,
    codigo_qr VARCHAR(100) UNIQUE,
    imagen_url VARCHAR(500),
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: stock
CREATE TABLE stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    articulo_id UUID REFERENCES articulos(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE CASCADE,
    cantidad INTEGER DEFAULT 0,
    stock_minimo INTEGER DEFAULT 5,
    stock_maximo INTEGER DEFAULT 100,
    ubicacion VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(articulo_id, sede_id)
);

-- Table: beneficiarios
CREATE TABLE beneficiarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cedula VARCHAR(20) UNIQUE NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(100),
    telefono VARCHAR(20),
    dependencia VARCHAR(100),
    cargo VARCHAR(100),
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: movimientos
CREATE TABLE movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) CHECK (tipo IN ('entrada', 'salida', 'asignacion', 'devolucion', 'traslado', 'ajuste', 'baja')) NOT NULL,
    sede_origen_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    sede_destino_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    beneficiario_id UUID REFERENCES beneficiarios(id) ON DELETE SET NULL,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    documento_referencia VARCHAR(50),
    observaciones TEXT,
    fecha_movimiento DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: detalle_movimientos
CREATE TABLE detalle_movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movimiento_id UUID REFERENCES movimientos(id) ON DELETE CASCADE,
    articulo_id UUID REFERENCES articulos(id) ON DELETE CASCADE,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: alertas
CREATE TABLE alertas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) CHECK (tipo IN ('stock_bajo', 'vencimiento', 'asignacion_pendiente')) NOT NULL,
    articulo_id UUID REFERENCES articulos(id) ON DELETE CASCADE,
    sede_id UUID REFERENCES sedes(id) ON DELETE CASCADE,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_stock_articulo ON stock(articulo_id);
CREATE INDEX idx_stock_sede ON stock(sede_id);
CREATE INDEX idx_stock_cantidad ON stock(cantidad);
CREATE INDEX idx_stock_stock_minimo ON stock(stock_minimo);
CREATE INDEX idx_articulos_categoria ON articulos(categoria_id);
CREATE INDEX idx_articulos_sku ON articulos(sku);
CREATE INDEX idx_articulos_codigo_barras ON articulos(codigo_barras);
CREATE INDEX idx_articulos_codigo_qr ON articulos(codigo_qr);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha_movimiento);
CREATE INDEX idx_movimientos_sede_origen ON movimientos(sede_origen_id);
CREATE INDEX idx_movimientos_sede_destino ON movimientos(sede_destino_id);
CREATE INDEX idx_movimientos_beneficiario ON movimientos(beneficiario_id);
CREATE INDEX idx_movimientos_usuario ON movimientos(usuario_id);
CREATE INDEX idx_detalle_movimientos_movimiento ON detalle_movimientos(movimiento_id);
CREATE INDEX idx_detalle_movimientos_articulo ON detalle_movimientos(articulo_id);
CREATE INDEX idx_beneficiarios_cedula ON beneficiarios(cedula);
CREATE INDEX idx_beneficiarios_sede ON beneficiarios(sede_id);
CREATE INDEX idx_alertas_tipo ON alertas(tipo);
CREATE INDEX idx_alertas_leida ON alertas(leida);

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sedes_updated_at BEFORE UPDATE ON sedes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categorias_updated_at BEFORE UPDATE ON categorias FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articulos_updated_at BEFORE UPDATE ON articulos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_stock_updated_at BEFORE UPDATE ON stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_beneficiarios_updated_at BEFORE UPDATE ON beneficiarios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_movimientos_updated_at BEFORE UPDATE ON movimientos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
