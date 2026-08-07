#!/bin/bash
# Migrar BD si esta vacia
# Ejecutar desde el host

set -e

DB_CONTAINER="inventariofibex-db"
DB_NAME="inventariofibex"
DB_USER="admin"

TABLES=$(podman exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -t -c "SELECT count(*) FROM information_schema.tables WHERE table_schema='public';" 2>/dev/null | tr -d ' ')

if [ "$TABLES" = "0" ] || [ -z "$TABLES" ]; then
    echo "BD vacia, ejecutando migraciones..."
    podman cp /srv/inventariofibex/database/migrations $DB_CONTAINER:/tmp/migrations
    podman exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -f /tmp/migrations/001_create_tables.sql
    podman exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -f /tmp/migrations/002_seed_data.sql
    podman exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -f /tmp/migrations/003_create_pedidos.sql
    podman exec $DB_CONTAINER psql -U $DB_USER -d $DB_NAME -f /tmp/migrations/004_create_equipos_trabajo.sql
    echo "Migraciones completadas."
else
    echo "BD ya tiene $TABLES tablas, nada que hacer."
fi
