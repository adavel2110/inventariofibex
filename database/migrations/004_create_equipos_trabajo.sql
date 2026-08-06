-- Tabla de Equipos de Trabajo (estaciones completas)
-- Vincula el equipo principal con sus perifericos asignados
CREATE TABLE IF NOT EXISTS equipos_trabajo (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre_pc VARCHAR(100) NOT NULL,
    serial VARCHAR(100),
    os VARCHAR(100),
    cpu VARCHAR(200),
    memoria VARCHAR(50),
    disco VARCHAR(50),
    ip VARCHAR(50),
    mac VARCHAR(50),
    password_pc VARCHAR(100),

    -- Equipo principal
    articulo_id UUID REFERENCES articulos(id) ON DELETE SET NULL,

    -- Perifericos (como texto ya que no existen como articulos separados)
    diadema_marca VARCHAR(100),
    diadema_fecha DATE,
    mouse_marca VARCHAR(100),
    mouse_modelo VARCHAR(100),
    mouse_fecha DATE,
    teclado_marca VARCHAR(100),
    teclado_modelo VARCHAR(100),
    teclado_fecha DATE,
    monitor_marca VARCHAR(100),
    monitor_modelo VARCHAR(100),
    monitor_fecha DATE,
    bolsos VARCHAR(100),
    bolsos_fecha DATE,

    -- Relaciones
    beneficiario_id UUID REFERENCES beneficiarios(id) ON DELETE SET NULL,
    sede_id UUID REFERENCES sedes(id) ON DELETE SET NULL,
    departamento VARCHAR(100),

    -- Estado
    estado VARCHAR(20) CHECK (estado IN ('asignado', 'en_revision', 'disponible', 'baja')) DEFAULT 'asignado',
    activo BOOLEAN DEFAULT true,
    last_update DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_equipos_trabajo_sede ON equipos_trabajo(sede_id);
CREATE INDEX IF NOT EXISTS idx_equipos_trabajo_beneficiario ON equipos_trabajo(beneficiario_id);
CREATE INDEX IF NOT EXISTS idx_equipos_trabajo_nombre_pc ON equipos_trabajo(nombre_pc);
CREATE INDEX IF NOT EXISTS idx_equipos_trabajo_serial ON equipos_trabajo(serial);
CREATE INDEX IF NOT EXISTS idx_equipos_trabajo_estado ON equipos_trabajo(estado);

CREATE TRIGGER update_equipos_trabajo_updated_at BEFORE UPDATE ON equipos_trabajo FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
