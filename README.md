# XV Audio System - Frontend

Frontend del sistema de inventario y POS para XV Audio. Desarrollado con React (Vite), TailwindCSS y conexión a la API del backend.

## Requisitos

- Node.js 18+
- Backend XV Audio corriendo (por defecto `http://localhost:5000`)

## Configuración

1. Copiar variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Editar `.env` si tu API está en otra URL:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

## Instalación y ejecución

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

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
