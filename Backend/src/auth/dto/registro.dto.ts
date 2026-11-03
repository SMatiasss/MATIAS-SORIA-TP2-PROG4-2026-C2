import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxDate,
  MaxLength,
  MinDate,
  MinLength,
} from 'class-validator';

// Sin contar los espacios de los bordes: así "   " no pasa y Mongo no recibe un nombre vacío.
const DE_3_A_20 = /^\s*\S.{1,18}\S\s*$/;

const haceAnios = (anios: number) => {
  const fecha = new Date();
  fecha.setFullYear(fecha.getFullYear() - anios);
  return fecha;
};

export class RegistroDto {
  @Matches(DE_3_A_20, { message: 'El nombre debe tener entre 3 y 20 caracteres' })
  @IsString({ message: 'El nombre es obligatorio' })
  nombre: string;

  @Matches(DE_3_A_20, { message: 'El apellido debe tener entre 3 y 20 caracteres' })
  @IsString({ message: 'El apellido es obligatorio' })
  apellido: string;

  @IsEmail({}, { message: 'El correo no es válido' })
  correo: string;

  @Matches(/^[A-Za-z0-9_.]+$/, {
    message: 'El nombre de usuario solo puede tener letras, números, "_" y "."',
  })
  @MaxLength(20, { message: 'El nombre de usuario debe tener entre 3 y 20 caracteres' })
  @MinLength(3, { message: 'El nombre de usuario debe tener entre 3 y 20 caracteres' })
  @IsString({ message: 'El nombre de usuario es obligatorio' })
  nombreUsuario: string;

  @Matches(/^(?=.*[A-Z])(?=.*\d).{8,}$/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  @IsString({ message: 'La contraseña es obligatoria' })
  contrasena: string;

  @MinDate(() => haceAnios(120), { message: 'La fecha de nacimiento no puede ser de hace más de 120 años' })
  @MaxDate(() => haceAnios(13), { message: 'Tenés que tener al menos 13 años' })
  @IsDate({ message: 'La fecha de nacimiento no es válida' })
  @Type(() => Date)
  fechaNacimiento: Date;

  @MaxLength(200, { message: 'La descripción puede tener hasta 200 caracteres' })
  @IsString({ message: 'La descripción no es válida' })
  @IsOptional()
  descripcion?: string;
}
