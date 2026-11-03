import { OmitType, PartialType } from '@nestjs/mapped-types';
import { RegistroDto } from '../../auth/dto/registro.dto.js';

// Se edita el perfil, no la cuenta: correo, usuario y contraseña se quedan afuera.
export class ActualizarPerfilDto extends PartialType(
  OmitType(RegistroDto, ['correo', 'nombreUsuario', 'contrasena'] as const),
) {}
