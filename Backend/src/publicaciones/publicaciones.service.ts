import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Publicacion } from './entities/publicacion.entity.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { UsuariosService } from '../usuarios/usuarios.service.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

export const DATOS_AUTOR = 'nombre apellido nombreUsuario imagenUrl';

@Injectable()
export class PublicacionesService {
  constructor(
    @InjectModel(Publicacion.name) private publicacionModel: Model<Publicacion>,
    private usuariosService: UsuariosService,
    private cloudinaryService: CloudinaryService,
  ) {}

  async crear(datos: CrearPublicacionDto, usuarioId: string, imagen?: Express.Multer.File) {
    const autor = await this.usuariosService.buscarPorId(usuarioId);
    const publicacion = new this.publicacionModel({
      autor: autor._id,
      titulo: datos.titulo,
      mensaje: datos.mensaje,
    });
    if (imagen) publicacion.imagenUrl = (await this.cloudinaryService.subir(imagen, 'publicaciones')).url;

    await publicacion.save();
    return await publicacion.populate('autor', DATOS_AUTOR);
  }

  async listar(orden = 'fecha', autor?: string, offset = '0', limit = '15') {
    const desde = Number(offset);
    const cantidad = Number(limit);
    if (orden !== 'fecha' && orden !== 'meGusta') {
      throw new BadRequestException('El orden tiene que ser "fecha" o "meGusta"');
    }
    if (!Number.isInteger(desde) || desde < 0) {
      throw new BadRequestException('offset tiene que ser un número entero desde 0');
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 50) {
      throw new BadRequestException('limit tiene que ser un número entero entre 1 y 50');
    }
    if (autor && !isValidObjectId(autor)) throw new BadRequestException('El autor no es válido');

    const filtro = autor ? { activo: true, autor } : { activo: true };
    const publicaciones = await this.publicacionModel
      .find(filtro)
      // Con los mismos me gusta van primero las más nuevas, así las páginas no se mezclan.
      .sort(orden === 'meGusta' ? { cantidadMeGusta: -1, createdAt: -1 } : { createdAt: -1 })
      .skip(desde)
      .limit(cantidad)
      .populate('autor', DATOS_AUTOR);
    return { publicaciones, total: await this.publicacionModel.countDocuments(filtro) };
  }

  async buscar(id: string) {
    const publicacion = isValidObjectId(id)
      ? await this.publicacionModel.findOne({ _id: id, activo: true }).populate('autor', DATOS_AUTOR)
      : null;
    if (!publicacion) throw new NotFoundException('La historia no existe o fue eliminada');
    return publicacion;
  }

  async eliminar(id: string, usuarioId: string) {
    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    const publicacion = await this.buscar(id);
    if (!publicacion.autor._id.equals(usuario._id) && usuario.perfil !== 'administrador') {
      throw new ForbiddenException('Solo quien escribió la historia o un administrador puede eliminarla');
    }

    publicacion.activo = false;
    return await publicacion.save();
  }

  async darMeGusta(id: string, usuarioId: string) {
    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    await this.buscar(id);

    const resultado = await this.publicacionModel.updateOne(
      { _id: id, 'meGusta.usuario': { $ne: usuario._id } },
      { $push: { meGusta: { usuario: usuario._id, fecha: new Date() } }, $inc: { cantidadMeGusta: 1 } },
    );
    if (!resultado.modifiedCount) throw new ConflictException('Ya le diste me gusta a esta historia');
    return await this.buscar(id);
  }

  async quitarMeGusta(id: string, usuarioId: string) {
    const usuario = await this.usuariosService.buscarPorId(usuarioId);
    await this.buscar(id);

    const resultado = await this.publicacionModel.updateOne(
      { _id: id, 'meGusta.usuario': usuario._id },
      { $pull: { meGusta: { usuario: usuario._id } }, $inc: { cantidadMeGusta: -1 } },
    );
    if (!resultado.modifiedCount) throw new ConflictException('No le habías dado me gusta a esta historia');
    return await this.buscar(id);
  }
}
