import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  async subir(archivo: Express.Multer.File, carpeta: string) {
    const base64 = `data:${archivo.mimetype};base64,${archivo.buffer.toString('base64')}`;
    try {
      const resultado = await cloudinary.uploader.upload(base64, { folder: `yurucamp/${carpeta}` });
      return { url: resultado.secure_url, id: resultado.public_id };
    } catch (error: any) {
      // Cloudinary no lanza errores de Nest: sin esto el back respondería 500 "Internal server error".
      if (error.http_code === 400) throw new BadRequestException('La imagen no es válida o está dañada');
      throw new ServiceUnavailableException('No se pudo subir la imagen. Probá de nuevo en unos minutos');
    }
  }

  async borrar(id: string) {
    await cloudinary.uploader.destroy(id);
  }
}
