# Sistema de Inventario FIBEX

Sistema de control de inventario para el departamento de tecnología de FIBEX.

## Características

- Control de inventario con UUIDs para mayor seguridad
- Gestión de sedes, categorías, artículos y beneficiarios
- Generación automática de códigos de barras y QR
- Control de stock por sede con alertas de stock mínimo
- Registro de movimientos (entradas, salidas, asignaciones, traslados)
- Dashboard con gráficos y estadísticas
- Reportes exportables a CSV
- Autenticación JWT con roles (admin, operador, consulta)
- Validación y limpieza de campos (trim automático)

## Tecnologías

- **Backend:** Node.js + Express
- **Frontend:** React + TailwindCSS + Vite
- **Base de datos:** PostgreSQL
- **Autenticación:** JWT + bcrypt

## Requisitos previos

- Node.js 18+
- PostgreSQL 12+
- npm o yarn

## Instalación

### 1. Clonar el repositorio

```bash
cd inventariofibex
```

### 2. Configurar base de datos

```bash
# Crear la base de datos
psql -U postgres -c "CREATE DATABASE inventariofibex;"

# Ejecutar migraciones
psql -U postgres -d inventariofibex -f database/migrations/001_create_tables.sql
psql -U postgres -d inventariofibex -f database/migrations/002_seed_data.sql
```

### 3. Configurar Backend

```bash
cd backend
cp .env.example .env  # Editar con tus configuraciones
npm install
```

### 4. Configurar Frontend

```bash
cd frontend
npm install
```

### 5. (Opcional) Migrar datos desde Excel

```bash
cd database/seeders
pip install psycopg2-binary openpyxl
python migrate_excel.py ../../Inventario_Unificado_Fibex.xlsx
```

## Ejecución

### Backend

```bash
cd backend
npm run dev
```

El servidor backend estará disponible en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## Credenciales por defecto

- **Email:** admin@fibex.com
- **Contraseña:** admin123

## Estructura del proyecto

```
inventariofibex/
├── backend/
│   ├── src/
│   │   ├── config/        # Configuración
│   │   ├── controllers/   # Controladores
│   │   ├── middleware/     # Middleware (auth, validación)
│   │   ├── models/        # Queries SQL
│   │   ├── routes/        # Rutas API
│   │   └── utils/         # Utilidades (barcode, qrcode)
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── context/       # Context (Auth)
│   │   ├── pages/         # Páginas
│   │   └── services/      # Servicios API
│   └── package.json
├── database/
│   ├── migrations/        # SQL migrations
│   └── seeders/           # Seed data y migración Excel
└── README.md
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `GET /api/auth/profile` - Obtener perfil

### Sedes
- `GET /api/sedes` - Listar sedes
- `POST /api/sedes` - Crear sede
- `PUT /api/sedes/:id` - Actualizar sede
- `DELETE /api/sedes/:id` - Desactivar sede

### Categorías
- `GET /api/categorias` - Listar categorías
- `POST /api/categorias` - Crear categoría
- `PUT /api/categorias/:id` - Actualizar categoría
- `DELETE /api/categorias/:id` - Desactivar categoría

### Artículos
- `GET /api/articulos` - Listar artículos
- `POST /api/articulos` - Crear artículo
- `PUT /api/articulos/:id` - Actualizar artículo
- `DELETE /api/articulos/:id` - Desactivar artículo
- `GET /api/articulos/:id/barcode` - Generar código de barras
- `GET /api/articulos/:id/qrcode` - Generar código QR

### Stock
- `GET /api/stock` - Listar stock
- `POST /api/stock` - Crear/actualizar stock
- `GET /api/stock/low` - Stock bajo

### Beneficiarios
- `GET /api/beneficiarios` - Listar beneficiarios
- `POST /api/beneficiarios` - Crear beneficiario
- `PUT /api/beneficiarios/:id` - Actualizar beneficiario
- `DELETE /api/beneficiarios/:id` - Desactivar beneficiario

### Movimientos
- `GET /api/movimientos` - Listar movimientos
- `POST /api/movimientos` - Crear movimiento

### Dashboard
- `GET /api/dashboard/resumen` - Resumen general
- `GET /api/dashboard/movimientos-por-mes` - Movimientos mensuales
- `GET /api/dashboard/top-articulos` - Top artículos
- `GET /api/dashboard/stock-por-sede` - Stock por sede
- `GET /api/dashboard/alertas` - Alertas pendientes

### Reportes
- `GET /api/reportes/inventario` - Reporte de inventario
- `GET /api/reportes/movimientos` - Reporte de movimientos
- `GET /api/reportes/asignaciones` - Reporte de asignaciones

## Licencia

ISC
