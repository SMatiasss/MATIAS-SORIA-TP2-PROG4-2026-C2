import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsNotEmpty({ message: 'El usuario o el correo es obligatorio' })
  @IsString({ message: 'El usuario o el correo es obligatorio' })
  usuario: string;

  @IsNotEmpty({ message: 'La contraseña es obligatoria' })
  @IsString({ message: 'La contraseña es obligatoria' })
  contrasena: string;
}
