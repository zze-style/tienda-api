# Tienda Virtual – API RESTful

Backend de una tienda virtual construido con **Node.js, Express, MongoDB, Mongoose y JWT**, organizado con el patrón **MVC**.

## Requisitos

- Node.js 18 o superior
- MongoDB (local o MongoDB Atlas)

## Instalación y ejecución

```bash
npm install
cp .env.example .env   # luego edita los valores
npm run seed           # crea el admin y productos de ejemplo
npm run dev            # desarrollo con nodemon
# o
npm start              # producción
```

El servidor queda en `http://localhost:3000`.

## Estructura

```
tienda-api/
├── .env.example
├── .gitignore
├── package.json
└── src/
    ├── app.js
    ├── server.js
    ├── config/db.js
    ├── models/          User.js, Product.js, Order.js
    ├── controllers/     auth, product, order
    ├── routes/          auth, product, order
    ├── middlewares/     auth.middleware.js, error.middleware.js
    ├── utils/           AppError.js, asyncHandler.js
    └── seed/seed.js
```

## Endpoints

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | /api/auth/register | Público | Registra un usuario y devuelve un JWT |
| POST | /api/auth/login | Público | Inicia sesión y devuelve un JWT |
| GET | /api/auth/me | Token | Datos del usuario autenticado |
| GET | /api/products | Público | Lista productos |
| GET | /api/products/:id | Público | Detalle de un producto |
| POST | /api/products | Admin | Crea producto |
| PUT | /api/products/:id | Admin | Actualiza producto |
| DELETE | /api/products/:id | Admin | Elimina producto |
| POST | /api/orders | Token | Crea una orden y descuenta stock |
| GET | /api/orders | Token | Lista las órdenes del usuario (admin: todas) |
| GET | /api/orders/:id | Token | Detalle de una orden propia |
| PATCH | /api/orders/:id/return | Token | Devuelve la orden y restaura stock |

Las rutas privadas requieren el header `Authorization: Bearer <token>`.
