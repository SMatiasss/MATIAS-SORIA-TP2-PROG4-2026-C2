import { IsIn } from 'class-validator';
import { RegistroDto } from '../../auth/dto/registro.dto.js';

// Alta desde el dashboard: los mismos datos que el registro, y además el administrador elige el perfil.
export class CrearUsuarioDto extends RegistroDto {
  @IsIn(['usuario', 'administrador'], { message: 'El perfil tiene que ser "usuario" o "administrador"' })
  perfil: string;
}
