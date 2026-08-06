#!/bin/bash
# Deploy InventarioFIBEX con Podman
# Servidor: 10.10.30.53
# Puerto: 3002

set -e

echo "========================================="
echo "  Despliegue InventarioFIBEX (Podman)"
echo "  Puerto: 3002"
echo "========================================="

# Verificar que podman-compose esté disponible
if ! command -v podman-compose &> /dev/null; then
    echo "Instalando podman-compose..."
    pip3 install podman-compose
fi

echo ""
echo "[1/4] Construyendo imagenes..."
podman-compose build --no-cache

echo ""
echo "[2/4] Deteniendo servicios existentes..."
podman-compose down

echo ""
echo "[3/4] Iniciando servicios..."
podman-compose up -d

echo ""
echo "[4/4] Verificando estado..."
sleep 5
podman-compose ps

echo ""
echo "========================================="
echo "  Despliegue completado!"
echo ""
echo "  URL: http://10.10.30.53:3002"
echo "  Login: admin@fibex.com / admin123"
echo ""
echo "  Comandos utiles:"
echo "  - Ver logs:     podman-compose logs -f"
echo "  - Ver estado:   podman-compose ps"
echo "  - Reiniciar:    podman-compose restart"
echo "  - Detener:      podman-compose down"
echo "  - Reconstruir:  podman-compose up -d --build"
echo "========================================="
