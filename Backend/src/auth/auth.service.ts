import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { hashear, verificar } from './contrasena.js';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async registro(dto: RegistroDto, imagen?: Express.Multer.File) {
    dto.contrasena = await hashear(dto.contrasena);
    const usuario = await this.usuariosService.crear(dto, imagen);
    return { token: this.generarToken(usuario._id.toString(), usuario.perfil), usuario };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarParaLogin(dto.usuario);

    if (!usuario || !(await verificar(dto.contrasena, usuario.contrasena))) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    return { token: this.generarToken(usuario._id.toString(), usuario.perfil), usuario };
  }

  autorizar(id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  refrescar(payload: any) {
    return { token: this.generarToken(payload.id, payload.perfil) };
  }

  generarToken(id: string, perfil: string) {
    const fechaActual = Math.round(Date.now() / 1000);

    const payload = {
      id,
      perfil,
      iat: fechaActual,
      exp: fechaActual + 60 * 15,
    };

    return jwt.sign(payload, process.env.CONTRASENA_DEL_SERVER ?? '', { issuer: 'YuruCamp' });
  }
}
