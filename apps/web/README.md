# Web — Next.js 15

Frontend de Cuentas. Puerto por defecto: **3000**.

## Requisitos

- Node.js ≥ 20
- pnpm ≥ 9
- La API corriendo (ver `apps/api/README.md`)

## 1. Variables de entorno

```bash
cp apps/web/.env.example apps/web/.env
```

El único valor que necesitas:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API, por defecto `http://localhost:3001/api` |

## 2. Instalar dependencias

Desde la raíz del monorepo:

```bash
pnpm install
```

## 3. Arrancar

**Desarrollo (Turbopack):**

```bash
pnpm --filter @cuentas/web dev
```

Abre **http://localhost:3000** (si el puerto está ocupado Next.js usará el siguiente libre,
te lo indica en la terminal).

**Build de producción:**

```bash
pnpm --filter @cuentas/web build
pnpm --filter @cuentas/web start
```

## Páginas

| Ruta | Descripción |
|---|---|
| `/` | Redirige a `/login` |
| `/login` | Formulario de login y registro (toggle) |
| `/dashboard` | Panel principal (protegido, redirige a `/login` si no hay sesión) |

## Funcionalidades del dashboard

- **Tarjetas de resumen**: balance, ingresos y gastos totales.
- **Input de lenguaje natural**: escribe una frase ("gasté 12€ en comida"), pulsa *Analizar* y el formulario se precarga con los datos extraídos por la IA.
- **Formulario manual**: tipo (gasto/ingreso), importe, categoría, fecha y nota.
- **Lista de movimientos**: ordenada por fecha, con botón de borrado.
- **Desglose por categoría**: resumen de lo gastado/ingresado por categoría.

## PWA

La app incluye un `manifest.webmanifest` y un service worker básico (`public/sw.js`).
En móvil puedes instalarla desde el navegador con "Añadir a pantalla de inicio".

## Notas

- El token JWT se guarda en `localStorage`. Para cerrar sesión pulsa *Salir* en el header.
- Si cambias el puerto de la API, actualiza `NEXT_PUBLIC_API_URL` en el `.env`.
- Si el frontend corre en un puerto distinto al que tiene la API en `WEB_ORIGIN`, verás
  errores de CORS. Actualiza `WEB_ORIGIN` en `apps/api/.env` para que coincidan y reinicia la API.
