#!/bin/sh
echo "--- INICIANDO PROTOCOLO DE DESPLIEGUE WHATSCLOUD ---"

# 1. Ejecutar Migraciones
echo "[DB] Aplicando actualizaciones de esquema..."
npx sequelize-cli db:migrate

# 2. Ejecutar Seeders (Idempotentes)
echo "[DB] Cargando usuarios base si no existen..."
npx sequelize-cli db:seed:all

# 3. Iniciar el Servidor
echo "[SERVER] Lanzando API en puerto 3000..."
node server/server.js
