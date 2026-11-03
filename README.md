# MATIAS-SORIA-TP2-PROG4-2026-C2

**YuruCamp**: red social de camping nocturno.

- Front: https://yurucamp-beta.vercel.app
- Back: https://backend-azure-two-38.vercel.app

## Backend

```bash
cd Backend
npm i
cp .env.example .env    # en Windows: copy .env.example .env
```

Completar en `Backend/.env`:

- `MONGO_URI`: cadena de conexión de MongoDB Atlas.
- `CONTRASENA_DEL_SERVER`: clave con la que se firma el JWT.
- `FRONT_URL`: URL del front permitida por CORS (`http://localhost:4200` en local, sin barra al final).
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` y `CLOUDINARY_API_SECRET`: credenciales de Cloudinary para las imágenes.
- `PORT` (opcional): por defecto 3000.

Después:

```bash
npm run start:dev       # http://localhost:3000
```

## Frontend

```bash
cd Frontend
npm i
ng serve                # http://localhost:4200
```

La URL del back está en `Frontend/src/environments/`: `environment.development.ts` (local) y `environment.ts` (deploy).
