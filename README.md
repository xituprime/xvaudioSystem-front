# XV Audio System - Frontend

Frontend del sistema de inventario y POS para XV Audio. Desarrollado con React (Vite), TailwindCSS y conexión a la API del backend.

## Requisitos

- Node.js 18+
- Backend XV Audio disponible en producción en `https://xvaudiosystem-back.onrender.com/api`

## Configuración

1. Copiar variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Editar `.env` si tu API está en otra URL:
   ```
   VITE_API_URL=https://xvaudiosystem-back.onrender.com/api
   ```
3. En Vercel, configura la variable de entorno:
   ```text
   VITE_API_URL=https://xvaudiosystem-back.onrender.com/api
   ```

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre la aplicación de desarrollo en el puerto configurado por Vite.

## Build para producción

```bash
npm run build
npm run preview
```

## Roles

- **Admin**: Dashboard, Productos (CRUD), POS, Reportes.
- **Client**: Catálogo de productos y detalle.

## Estructura principal

- `src/api/axiosConfig.js` – Cliente Axios, interceptores 401/403.
- `src/context/AuthContext.jsx` – Estado de autenticación.
- `src/layouts/` – AdminLayout (sidebar), PublicLayout (navbar).
- `src/pages/` – Login, Register, Dashboard, Products, ProductForm, POS, Reports.
- `src/components/` – ProtectedRoute, RoleRoute, Sidebar, Navbar, ProductCard.

Las peticiones privadas envían `Authorization: Bearer <token>`. En 401 se hace logout y redirección a login; en 403 se muestra “Acceso denegado”.
