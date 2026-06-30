# API — NestJS 11

Backend REST de Cuentas. Puerto por defecto: **3001**.

## Requisitos

- Node.js ≥ 20
- pnpm ≥ 9
- Docker (para la base de datos)

## 1. Variables de entorno

```bash
cp apps/api/.env.example apps/api/.env
```

Edita `apps/api/.env` y rellena:

| Variable | Descripción |
|---|---|
| `PORT` | Puerto de la API (por defecto `3001`) |
| `DATABASE_URL` | URL de conexión a PostgreSQL |
| `JWT_SECRET` | Secreto para firmar los JWT (pon algo seguro) |
| `ANTHROPIC_API_KEY` | API key de Anthropic para el parseo por IA |
| `WEB_ORIGIN` | Origen del frontend (para CORS), ej. `http://localhost:3000` |

## 2. Base de datos (Docker)

```bash
docker compose up -d
```

Levanta un PostgreSQL 16 en el puerto **5432** (o **5433** si ya tienes Postgres instalado
localmente — en ese caso el `docker-compose.yml` ya tiene el puerto cambiado a 5433 y el
`DATABASE_URL` apunta a 5433).

Espera un par de segundos a que esté listo:

```bash
docker compose logs postgres
# cuando veas "database system is ready to accept connections", sigue
```

## 3. Instalar dependencias

Desde la raíz del monorepo:

```bash
pnpm install
```

## 4. Compilar

```bash
pnpm --filter @cuentas/api build
```

El resultado queda en `apps/api/dist/main.js` (bundle webpack único).

## 5. Arrancar

**Producción (compilado):**

```bash
node apps/api/dist/main.js
```

**Desarrollo (con watch + recompilación automática):**

```bash
pnpm --filter @cuentas/api dev
```

> La primera vez en modo `dev` puede tardar unos segundos en compilar antes de servir
> peticiones.

## Endpoints

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | No | Registro con email + password |
| POST | `/api/auth/login` | No | Login, devuelve `accessToken` |
| GET | `/api/transactions` | JWT | Lista de movimientos del usuario |
| GET | `/api/transactions/summary` | JWT | Balance, ingresos, gastos y desglose por categoría |
| POST | `/api/transactions` | JWT | Crea un movimiento |
| POST | `/api/transactions/parse` | No | Parsea texto libre con IA → devuelve `ParsedTransaction` |
| DELETE | `/api/transactions/:id` | JWT | Borra un movimiento |

El JWT va en la cabecera `Authorization: Bearer <token>`.

## Notas

- TypeORM usa `synchronize: true` — las tablas se crean solas al arrancar. No hay migraciones en v1.
- El modelo de IA es `claude-haiku-4-5-20251001`. Para cambiarlo basta con editar `ai.service.ts`.
- Si el puerto 5432 está ocupado por un Postgres local, cambia el mapeo en `docker-compose.yml` a `"5433:5432"` y actualiza `DATABASE_URL` en el `.env`.
