import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsuariosService } from './usuarios.service.js';
import { Usuario, UsuarioSchema } from './entities/usuario.entity.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';
import { UsuariosController } from './usuarios.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Usuario.name, schema: UsuarioSchema }]),
    CloudinaryModule,
  ],
  providers: [UsuariosService],
  exports: [UsuariosService],
  controllers: [UsuariosController],
})
export class UsuariosModule {}
