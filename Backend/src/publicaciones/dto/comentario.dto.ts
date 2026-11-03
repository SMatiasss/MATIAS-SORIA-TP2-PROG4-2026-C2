import { IsString, Matches, MaxLength } from 'class-validator';

export class ComentarioDto {
  @Matches(/\S/, { message: 'El comentario no puede estar vacío' })
  @MaxLength(200, { message: 'El comentario puede tener hasta 200 caracteres' })
  @IsString({ message: 'El comentario no puede estar vacío' })
  mensaje: string;
}
