import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { Comentario } from './entities/comentario.entity.js';

// Los días se cuentan en hora de Argentina: en UTC, un comentario de las 22 h caería en el día siguiente.
const ZONA = 'America/Argentina/Buenos_Aires';
const diaEnArgentina = (fecha: Date) => fecha.toLocaleDateString('en-CA', { timeZone: ZONA });

// Cada estadística devuelve una lista de { etiqueta, cantidad }: el front arma cualquier gráfico con esa forma.
@Injectable()
export class EstadisticasService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
  ) {}

  async publicacionesPorUsuario(desde?: string, hasta?: string) {
    const publicaciones: any[] = await this.publicacionModel
      .find({ activo: true, createdAt: this.lapso(desde, hasta) })
      .populate('autor', 'nombreUsuario');

    const conteo: any = {};
    for (const publicacion of publicaciones) {
      const nombre = publicacion.autor.nombreUsuario;
      conteo[nombre] = (conteo[nombre] ?? 0) + 1;
    }
    return this.ordenar(Object.keys(conteo).map((nombre) => ({ etiqueta: nombre, cantidad: conteo[nombre] })));
  }

  // Un valor por día del lapso, también los días sin comentarios, para que la línea no salte.
  async comentariosPorDia(desde?: string, hasta?: string) {
    const lapso = this.lapso(desde, hasta);
    const comentarios = await this.comentariosVisibles(lapso);

    const dias: any[] = [];
    for (const dia = new Date(lapso.$gte); dia < lapso.$lt; dia.setUTCDate(dia.getUTCDate() + 1)) {
      const etiqueta = diaEnArgentina(dia);
      const cantidad = comentarios.filter((c) => diaEnArgentina(c.createdAt) === etiqueta).length;
      dias.push({ etiqueta, cantidad });
    }
    return dias;
  }

  async comentariosPorPublicacion(desde?: string, hasta?: string) {
    const comentarios = await this.comentariosVisibles(this.lapso(desde, hasta));

    // Se cuenta por id y no por título: dos historias pueden llamarse igual.
    const conteo: any = {};
    for (const comentario of comentarios) {
      const id = comentario.publicacion._id.toString();
      conteo[id] = conteo[id] ?? { etiqueta: comentario.publicacion.titulo, cantidad: 0 };
      conteo[id].cantidad++;
    }
    return this.ordenar(Object.values(conteo));
  }

  // Los comentarios de una historia dada de baja ya no están disponibles, así que no cuentan.
  async comentariosVisibles(lapso: any) {
    const comentarios: any[] = await this.comentarioModel
      .find({ createdAt: lapso })
      .populate('publicacion', 'titulo activo');
    return comentarios.filter((c) => c.publicacion?.activo);
  }

  // "desde" y "hasta" llegan como AAAA-MM-DD; cada día empieza a la medianoche de Argentina (UTC-3, sin horario de verano) y "hasta" se incluye completo.
  lapso(desde?: string, hasta?: string) {
    const inicio = new Date(`${desde}T00:00:00-03:00`);
    const fin = new Date(`${hasta}T00:00:00-03:00`);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) {
      throw new BadRequestException('Las fechas "desde" y "hasta" son obligatorias y tienen que ser válidas');
    }
    if (inicio > fin) {
      throw new BadRequestException('La fecha "desde" no puede ser posterior a "hasta"');
    }
    fin.setUTCDate(fin.getUTCDate() + 1);
    return { $gte: inicio, $lt: fin };
  }

  ordenar(lista: any[]) {
    return lista.sort((a, b) => b.cantidad - a.cantidad);
  }
}
