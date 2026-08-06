-- Tabla de Pedidos (encabezado)
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    recibe VARCHAR(150) NOT NULL,
    fecha_pedido DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    proveedor VARCHAR(150),
    observaciones TEXT,
    estado VARCHAR(20) CHECK (estado IN ('pendiente', 'parcial', 'completado', 'cancelado')) DEFAULT 'pendiente',
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Detalle de Pedidos
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    articulo_id UUID REFERENCES articulos(id) ON DELETE SET NULL,
    cantidad_solicitada INTEGER NOT NULL CHECK (cantidad_solicitada > 0),
    cantidad_recibida INTEGER DEFAULT 0 CHECK (cantidad_recibida >= 0),
    precio_unitario DECIMAL(10,2),
    observaciones TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_sede ON pedidos(sede_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_detalle_pedidos_pedido ON detalle_pedidos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_detalle_pedidos_articulo ON detalle_pedidos(articulo_id);

-- Trigger
CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON pedidos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
