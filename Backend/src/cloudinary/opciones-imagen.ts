import { BadRequestException } from '@nestjs/common';

const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp'];

export const OPCIONES_IMAGEN = {
  fileFilter: (req: any, archivo: Express.Multer.File, res: any) =>
    TIPOS_IMAGEN.includes(archivo.mimetype)
      ? res(null, true)
      : res(new BadRequestException('La imagen tiene que ser PNG, JPG o WEBP'), false),
  limits: { fileSize: 1024 * 1024 },
};
