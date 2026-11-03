import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsuariosModule } from '../usuarios/usuarios.module.js';

@Module({
  imports: [UsuariosModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
