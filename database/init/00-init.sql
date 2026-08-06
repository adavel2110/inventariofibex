-- InventarioFIBEX - Script de inicialización para PostgreSQL en contenedor
-- Ejecuta todas las migraciones en orden

\echo '=== Creando tablas ==='
\i /docker-entrypoint-initdb.d/migrations/001_create_tables.sql

\echo '=== Insertando datos iniciales ==='
\i /docker-entrypoint-initdb.d/migrations/002_seed_data.sql

\echo '=== Creando tablas de pedidos ==='
\i /docker-entrypoint-initdb.d/migrations/003_create_pedidos.sql

\echo '=== Creando tabla equipos de trabajo ==='
\i /docker-entrypoint-initdb.d/migrations/004_create_equipos_trabajo.sql

\echo '=== Inicialización completada ==='
