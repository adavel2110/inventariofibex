#!/bin/bash
set -e

echo "Esperando a que PostgreSQL este listo..."

until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -q; do
  echo "PostgreSQL no esta listo, reintentando en 2s..."
  sleep 2
done

echo "PostgreSQL listo. Iniciando servidor..."
exec node src/server.js
