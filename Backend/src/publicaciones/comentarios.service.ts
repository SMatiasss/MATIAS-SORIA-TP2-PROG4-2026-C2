import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Comentario } from './entities/comentario.entity.js';
import { DATOS_AUTOR, PublicacionesService } from './publicaciones.service.js';

@Injectable()
export class ComentariosService {
  constructor(
    @InjectModel(Comentario.name) private comentarioModel: Model<Comentario>,
    private publicacionesService: PublicacionesService,
  ) {}

  async listar(id: string, offset = '0', limit = '10') {
    const desde = Number(offset);
    const cantidad = Number(limit);
    if (!Number.isInteger(desde) || desde < 0) {
      throw new BadRequestException('offset tiene que ser un número entero desde 0');
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 50) {
      throw new BadRequestException('limit tiene que ser un número entero entre 1 y 50');
    }
    const publicacion = await this.publicacionesService.buscar(id);
    const filtro = { publicacion: publicacion._id };

    const comentarios = await this.comentarioModel
      .find(filtro)
      .sort({ createdAt: -1 })
      .skip(desde)
      .limit(cantidad)
      .populate('autor', DATOS_AUTOR);
    return { comentarios, total: await this.comentarioModel.countDocuments(filtro) };
  }

  async crear(id: string, usuarioId: string, mensaje: string) {
    const publicacion = await this.publicacionesService.buscar(id);
    const comentario = new this.comentarioModel({ publicacion: publicacion._id, autor: usuarioId, mensaje });

    await comentario.save();
    return await comentario.populate('autor', DATOS_AUTOR);
  }

  async editar(id: string, comentarioId: string, usuarioId: string, mensaje: string) {
    const publicacion = await this.publicacionesService.buscar(id);
    const comentario = isValidObjectId(comentarioId)
      ? await this.comentarioModel.findOne({ _id: comentarioId, publicacion: publicacion._id })
      : null;
    if (!comentario) throw new NotFoundException('El comentario no existe');
    if (!comentario.autor.equals(usuarioId)) {
      throw new ForbiddenException('Solo quien escribió el comentario puede editarlo');
    }

    comentario.mensaje = mensaje;
    comentario.modificado = true;
    await comentario.save();
    return await comentario.populate('autor', DATOS_AUTOR);
  }
}
