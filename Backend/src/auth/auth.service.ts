import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { verificar } from './contrasena.js';

@Injectable()
export class AuthService {
  constructor(private readonly usuariosService: UsuariosService) {}

  async registro(dto: RegistroDto, imagen?: Express.Multer.File) {
    const usuario = await this.usuariosService.crear(dto, imagen);
    return { token: this.generarToken(usuario._id.toString(), usuario.perfil), usuario };
  }

  async login(dto: LoginDto) {
    const usuario = await this.usuariosService.buscarParaLogin(dto.usuario);

    if (!usuario || !(await verificar(dto.contrasena, usuario.contrasena))) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }
    this.revisarActivo(usuario.activo);
    return { token: this.generarToken(usuario._id.toString(), usuario.perfil), usuario };
  }

  // Lo usa la pantalla de carga al recargar: un usuario deshabilitado con la sesión abierta también queda afuera.
  async autorizar(id: string) {
    const usuario = await this.usuariosService.buscarPorId(id);
    this.revisarActivo(usuario.activo);
    return usuario;
  }

  revisarActivo(activo: boolean) {
    if (!activo) {
      throw new UnauthorizedException('Tu cuenta está deshabilitada. Un administrador tiene que habilitarla para que puedas volver a entrar');
    }
  }

  // Un usuario deshabilitado tampoco puede extender la sesión: si no, con el aviso de los 10 minutos no saldría nunca.
  async refrescar(payload: any) {
    const usuario = await this.usuariosService.buscarPorId(payload.id);
    this.revisarActivo(usuario.activo);
    return { token: this.generarToken(payload.id, payload.perfil) };
  }

  generarToken(id: string, perfil: string) {
    const fechaActual = Math.round(Date.now() / 1000);

    const payload = {
      id,
      perfil,
      iat: fechaActual,
      exp: fechaActual + 60 * 5,
    };

    return jwt.sign(payload, process.env.CONTRASENA_DEL_SERVER ?? '', { issuer: 'YuruCamp' });
  }
}
