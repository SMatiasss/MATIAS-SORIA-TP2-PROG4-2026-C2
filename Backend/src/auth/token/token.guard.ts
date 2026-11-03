import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';

@Injectable()
export class TokenGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // header "Authorization": "Bearer TOKEN"
    const req = context.switchToHttp().getRequest();
    const token = req.headers.authorization?.replace('Bearer ', '');

    // El enunciado pide 401 ante cualquier problema con el token (la clase 14 respondía 403).
    if (!token) throw new UnauthorizedException('Tenés que iniciar sesión para entrar al campamento');

    try {
      // Los controllers leen quién hace el pedido desde req.usuario ({ id, perfil }).
      req.usuario = jwt.verify(token, process.env.CONTRASENA_DEL_SERVER ?? '');
      return true;
    } catch {
      throw new UnauthorizedException('Tu sesión venció o no es válida. Iniciá sesión de nuevo');
    }
  }
}
