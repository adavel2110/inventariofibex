# Sistema Control de Activos - FIBEX

Aplicación web para gestión de inventario de activos tecnológicos: equipos de cómputo, periféricos y consumibles, con asignación a empleados, despachos y control de stock.

**Stack**: Next.js 14 App Router, TypeScript, PostgreSQL, Prisma, NextAuth v4, TailwindCSS, shadcn/ui.

---

## Desarrollo Local

Ver [`AGENTS.md`](./AGENTS.md) para setup rápido y gotchas.

```bash
cd sistema-control-activos
npm install
npx prisma generate
npm run db:seed
npm run dev
```

**Credenciales seed**: `admin@fibex.com` / `admin123`

---

## Despliegue en Producción (Debian 12 VPS)

### 1. Prerrequisitos

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker y Docker Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
# Cerrar sesión y volver a entrar para aplicar grupos

# Verificar instalación
docker --version
docker compose version
```

### 2. Clonar el repositorio

```bash
git clone git@github.com:adavel2110/inventariofibex.git
cd inventariofibex/sistema-control-activos
```

### 3. Configurar variables de entorno

Crear archivo `.env`:

```bash
nano .env
```

Contenido (ajustar **NEXTAUTH_URL** con la IP/dominio real):

```env
DATABASE_URL="postgresql://admin:Abcd1234@postgres:5432/inventario_db?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generar-un-secret-seguro-aqui"
NEXT_PUBLIC_APP_NAME="Control de Activos - FIBEX"
NEXT_PUBLIC_APP_VERSION="1.0.0"
```

> **Importante**: `DATABASE_URL` apunta a `postgres` (nombre del servicio Docker), no a `localhost` — Docker Compose resuelve este hostname internamente.
>
> Cambia `NEXTAUTH_SECRET` por un valor único. Genera uno con: `openssl rand -base64 32`.
>
> Cambia `NEXTAUTH_URL` por el dominio público o IP del VPS cuando tengas el dominio configurado.

### 4. Construir y levantar

```bash
docker compose up -d --build
```

Esto levanta dos contenedores:
- **`fibex-db`** — PostgreSQL 16 con persistencia en volumen Docker
- **`fibex-app`** — Next.js en modo standalone (puerto 3000)

Verificar que ambos estén corriendo:

```bash
docker compose ps
docker compose logs -f   # Ctrl+C para salir
```

### 5. Poblar la base de datos

Ejecutar el seed dentro del contenedor de la app:

```bash
docker compose exec app npx prisma generate
docker compose exec app npx tsx prisma/seed.ts
```

Esto crea el usuario admin y datos de ejemplo.

### 6. Configurar Nginx como reverse proxy (recomendado)

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Crear configuración `/etc/nginx/sites-available/control-activos`:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilitar sitio y obtener SSL:

```bash
sudo ln -s /etc/nginx/sites-available/control-activos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d tu-dominio.com
```

> Sin dominio: usa la IP del VPS directamente en `http://IP:3000` (omite Nginx).

### 7. Asegurar que los contenedores arranquen solos

Por defecto `restart: unless-stopped` ya está en `docker-compose.yml`. Los contenedores se reinician automáticamente al reiniciar el VPS.

### 8. Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `docker compose logs -f` | Ver logs en tiempo real |
| `docker compose logs app -f` | Solo logs de la app |
| `docker compose down` | Detener y eliminar contenedores |
| `docker compose up -d` | Levantar servicios en segundo plano |
| `docker compose exec app sh` | Acceder al contenedor de la app |
| `docker compose exec app npx prisma studio` | Prisma Studio (puerto 5555) |
| `docker compose restart app` | Reiniciar solo la app |

### 9. Actualizar la app

```bash
cd inventariofibex
git pull origin main
cd sistema-control-activos
docker compose up -d --build
```

---

## Estructura del proyecto

```
inventariofibex/
├── AGENTS.md                    # Instrucciones para OpenCode
├── sistema-control-activos/     # Código fuente
│   ├── app/                     # Páginas y API routes (Next.js App Router)
│   ├── components/              # Componentes shadcn/ui y layouts
│   ├── lib/                     # Auth utils
│   ├── prisma/                  # Schema y migraciones
│   ├── scripts/                 # Utilidades de migración
│   ├── src/                     # Middleware, tipos, lib
│   ├── Dockerfile               # Build multi-stage para producción
│   ├── docker-compose.yml       # PostgreSQL + App
│   └── .env                     # Variables de entorno (no versionado)
└── planInventarioFibex.prompt.md
```
