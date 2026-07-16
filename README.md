# The Family Store — Backend

API REST para The Family Store, tienda en línea de moda (ropa, calzado, bolsos,
belleza y cuidado personal). Node.js + Express + MongoDB.

## Instalación

```bash
npm install
cp .env.example .env
```

Completa `.env` con:
- `MONGODB_URI`: connection string de tu cluster gratuito de MongoDB Atlas (M0).
- `JWT_SECRET`: una cadena aleatoria larga.
- `CLOUDINARY_*`: credenciales de tu cuenta gratuita de Cloudinary (para las imágenes de producto).
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` / `ADMIN_NOMBRE`: solo se usan una vez, para crear el único usuario administrador.

## Crear el usuario admin

```bash
npm run create-admin
```

## Desarrollo

```bash
npm run dev
```

Health check: `GET http://localhost:5001/api/health`

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login de admin, devuelve JWT |
| GET | `/api/auth/me` | Sí | Datos del admin autenticado |
| GET | `/api/products` | No | Lista productos (`?categoria=`, `?search=`, `?page=`) |
| GET | `/api/products/:id` | No | Detalle de un producto |
| POST | `/api/products` | Sí | Crea producto (multipart, campo `imagenes`) |
| PUT | `/api/products/:id` | Sí | Actualiza producto |
| DELETE | `/api/products/:id` | Sí | Elimina producto |

Categorías válidas: `ropa-dama`, `ropa-caballero`, `calzado`, `bolsos`,
`belleza-cosmeticos`, `cuidado-personal`.
