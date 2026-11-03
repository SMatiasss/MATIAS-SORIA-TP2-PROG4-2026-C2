# MATIAS-SORIA-TP2-PROG4-2026-C2

**YuruCamp**: red social de camping nocturno
## Backend
```bash
cd Backend
npm i
cp .env.example .env    # en Windows: copy .env.example .env
```
Completar en `Backend/.env` la cadena de conexión de MongoDB Atlas (`MONGO_URI`) y las credenciales de Cloudinary (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`) y después:
```bash
npm run start:dev       # http://localhost:3000
```
La URL del back está en `Frontend/src/environments/`.
## Frontend
```bash
cd Frontend
npm i
ng serve                # http://localhost:4200
```

