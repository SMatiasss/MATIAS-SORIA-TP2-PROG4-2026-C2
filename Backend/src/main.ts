import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module.js';
import { Multer } from 'multer';

async function bootstrap() {
  if (!process.env.MONGO_URI) throw new Error('Falta MONGO_URI en .env');
  if (!process.env.FRONT_URL) throw new Error('Falta FRONT_URL en .env');
  if (!process.env.CONTRASENA_DEL_SERVER) throw new Error('Falta CONTRASENA_DEL_SERVER en .env');
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Faltan las credenciales de Cloudinary en .env');
  }

  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, stopAtFirstError: true }));
  // CORS: sin esto el navegador bloquea los pedidos del front (otro puerto) al back.
  app.enableCors({ origin: process.env.FRONT_URL, exposedHeaders: ['X-Total-Count'] });
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
