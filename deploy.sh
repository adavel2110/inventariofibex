#!/bin/bash
# Deploy InventarioFIBEX con Podman
# Servidor: 10.10.30.53
# Puerto: 3002

set -e

echo "========================================="
echo "  Despliegue InventarioFIBEX (Podman)"
echo "  Puerto: 3002"
echo "========================================="

echo ""
echo "[1/5] Deteniendo servicios existentes..."
podman-compose down 2>/dev/null || true

echo ""
echo "[2/5] Construyendo imagenes..."
podman-compose build

echo ""
echo "[3/5] Iniciando servicios..."
podman-compose up -d

echo ""
echo "[4/5] Esperando a que DB este lista..."
sleep 10
./wait-for-db.sh && echo "DB lista." || echo "Esperando..."

echo ""
echo "[5/5] Verificando estado..."
podman-compose ps

echo ""
echo "========================================="
echo "  Despliegue completado!"
echo ""
echo "  URL: http://10.10.30.53:3002"
echo "  Login: admin@fibex.com / admin123"
echo ""
echo "  Para importar datos:"
echo "  DB_PORT=5434 EXCEL_PATH=/srv/inventariofibex/Inventario_Unificado_Fibex.xlsx python3 database/migrations/importar_excel.py"
echo ""
echo "  Comandos utiles:"
echo "  - Ver logs:     podman-compose logs -f"
echo "  - Ver estado:   podman-compose ps"
echo "  - Reiniciar:    podman-compose restart"
echo "  - Detener:      podman-compose down"
echo "  - Reconstruir:  podman-compose up -d --build"
echo "========================================="
