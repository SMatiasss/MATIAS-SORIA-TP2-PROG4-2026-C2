import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';

class MeGusta {
  usuario: Types.ObjectId;
  fecha: Date;
}

// Schema.Types.ObjectId y no Types.ObjectId: con este último el campo queda "Mixed" y los filtros por id no funcionan.
@Schema({ collection: 'publicaciones', timestamps: true, versionKey: false })
export class Publicacion {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true })
  autor: Types.ObjectId;

  @Prop({ required: true, trim: true })
  titulo: string;

  @Prop({ required: true, trim: true })
  mensaje: string;

  @Prop({ type: String, default: null })
  imagenUrl: string | null;

  @Prop({
    type: [{ usuario: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' }, fecha: Date }],
    default: [],
  })
  meGusta: MeGusta[];

  @Prop({ default: 0 })
  cantidadMeGusta: number;

  @Prop({ default: true })
  activo: boolean;
}

export const PublicacionSchema = SchemaFactory.createForClass(Publicacion);
