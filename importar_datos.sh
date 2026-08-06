#!/bin/bash
# Ejecutar migracion y importar datos
# Ejecutar desde el host, NO desde el contenedor

set -e

echo "========================================="
echo "  Migracion + Importacion de datos"
echo "========================================="

# Verificar que los contenedores estan corriendo
if ! podman ps | grep -q inventariofibex-backend; then
    echo "ERROR: Los contenedores no estan corriendo. Ejecuta ./deploy.sh primero"
    exit 1
fi

echo ""
echo "[1/3] Ejecutando migracion 004 (equipos_trabajo)..."
podman exec inventariofibex-db psql -U admin -d inventariofibex -f /docker-entrypoint-initdb.d/migrations/004_create_equipos_trabajo.sql

echo ""
echo "[2/3] Verificando psycopg2..."
python3 -c "import psycopg2" 2>/dev/null || {
    echo "Instalando psycopg2..."
    sudo pip3 install --break-system-packages psycopg2-binary
}

echo ""
echo "[3/3] Importando datos del Excel..."
python3 /srv/inventariofibex/database/migrations/importar_excel.py

echo ""
echo "========================================="
echo "  Importacion completada!"
echo "========================================="
