import { IsString, Matches, MaxLength } from 'class-validator';

export class CrearPublicacionDto {
  @Matches(/\S/, { message: 'El título es obligatorio' })
  @MaxLength(60, { message: 'El título puede tener hasta 60 caracteres' })
  @IsString({ message: 'El título es obligatorio' })
  titulo: string;

  @Matches(/\S/, { message: 'El mensaje es obligatorio' })
  @MaxLength(400, { message: 'El mensaje puede tener hasta 400 caracteres' })
  @IsString({ message: 'El mensaje es obligatorio' })
  mensaje: string;
}
