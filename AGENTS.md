# AGENTS.md - Sistema de Inventario FIBEX

## Project Overview
Sistema web de control interno de inventarios para el departamento de tecnología de FIBEX.
- **Frontend:** React + TailwindCSS (Vite)
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (usuario: `admin`, BD: `inventariofibex`)
- **Auth:** JWT con roles (admin, operador, consulta)
- **Access:** http://10.10.30.59:3000 (puerto 3000, escucha 0.0.0.0)

## Tech Stack
- React 19 + React Router DOM
- TailwindCSS + Vite
- Express + PostgreSQL (pg)
- bcrypt + jsonwebtoken
- pm2 (process manager)
- Autoskills: nodejs-backend-patterns, nodejs-best-practices, nodejs-express-server

## Project Structure
```
inventariofibex/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express server, sirve API + frontend estático
│   │   ├── routes/            # Express routes (auth, sedes, categorias, articulos, stock, beneficiarios, movimientos, reportes, dashboard, usuarios, pedidos)
│   │   ├── controllers/       # Controllers (auth, sedes, categorias, articulos, stock, beneficiarios, movimientos, reportes, dashboard, usuarios, pedidos)
│   │   ├── models/queries.js  # Todas las queries SQL (761+ líneas)
│   │   └── middleware/        # auth.js (JWT), validate.js (trim + validaciones)
│   └── uploads/
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Rutas React
│   │   ├── pages/             # Pages: Login, Dashboard, Sedes, Categorias, Articulos, Stock, Beneficiarios, Movimientos, Pedidos, Reportes, Alertas, Usuarios, Perfil
│   │   ├── components/        # Layout (Sidebar, Layout), Pagination
│   │   ├── context/           # AuthContext
│   │   └── services/          # api.js (axios)
│   └── dist/                  # Frontend compilado (served by backend)
├── database/
│   └── migrations/            # 001_create_tables.sql, 002_seed_data.sql, 003_create_pedidos.sql
├── .agents/
├── README.md
└── AGENTS.md
```

## Commands
- **Install backend:** `cd backend && npm install`
- **Install frontend:** `cd frontend && npm install`
- **Run backend (dev):** `cd backend && node src/server.js`
- **Run frontend (dev):** `cd frontend && npm run dev`
- **Build frontend:** `cd frontend && npx vite build`
- **Start with pm2:** `cd backend && npx pm2 start src/server.js --name backend`
- **Restart pm2:** `cd backend && npx pm2 restart backend`
- **View logs:** `cd backend && npx pm2 logs backend`

## Conventions
- UUID v4 en todas las tablas (campo `id`)
- Trim automático en todos los campos de texto (middleware validate.js)
- CORS configurado con `origin: '*'` para acceso remoto
- Frontend compilado (dist/) servido por Express en mismo puerto 3000
- Paginación client-side en todas las vistas CRUD (componente Pagination, default 5 por página)
- Sidebar retráctil (solo iconos) con toggle en header, menú hamburguesa para móvil
- Roles: admin (acceso total), operador (CRUD sin eliminar), consulta (solo lectura)

## Database
- **Host:** localhost
- **User:** admin
- **Password:** Abcd1234
- **Database:** inventariofibex
- **Migrations:** Ejecutar en orden: 001 → 002 → 003
- **Admin login:** admin@fibex.com / admin123

## API Endpoints
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil usuario
- `CRUD /api/sedes` - Sedes
- `CRUD /api/categorias` - Categorías
- `CRUD /api/articulos` - Artículos (con SKU, código barras, QR)
- `CRUD /api/stock` - Stock por sede
- `CRUD /api/beneficiarios` - Beneficiarios
- `CRUD /api/movimientos` - Movimientos (entrada, salida, asignación, traslado, etc.)
- `CRUD /api/pedidos` - Pedidos con detalles
- `POST /api/pedidos/:id/procesar` - Procesar pedido (agrega stock)
- `GET /api/dashboard/resumen` - Resumen dashboard
- `GET /api/dashboard/alertas` - Alertas stock bajo
- `CRUD /api/usuarios` - Usuarios (solo admin)
- `GET /api/reportes/*` - Reportes (inventario, movimientos, asignaciones)

## Features Implemented
- Login con JWT y roles
- Dashboard con resumen y alertas de stock bajo
- CRUD completo: Sedes, Categorías, Artículos, Beneficiarios, Stock, Usuarios
- Gestión de pedidos con encabezado + detalle y procesamiento de stock
- Movimientos de inventario con tipos (entrada, salida, asignación, traslado, etc.)
- Reportes de inventario, movimientos y asignaciones
- Alertas de stock mínimo
- Perfil de usuario (cambiar nombre, email, contraseña)
- Paginación en todas las vistas CRUD (default 5 por página)
- Sidebar retráctil con toggle en header
- Menú hamburguesa para móvil
- Full responsive
- Códigos de barras y QR generados automáticamente
- Acceso remoto desde servidor interno

## Notes
- Backend PID manage via pm2: `npx pm2 list`, `npx pm2 restart backend`
- Frontend build: `cd /home/adavel/inventariofibex/frontend && npx vite build`
- Backend accede a frontend via: `path.join(__dirname, '../../frontend/dist')`
- Autoskills instalado para mejores prácticas de Node.js
