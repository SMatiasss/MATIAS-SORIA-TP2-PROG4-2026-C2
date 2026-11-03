import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Usuario } from './entities/usuario.entity.js';
import { RegistroDto } from '../auth/dto/registro.dto.js';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto.js';
import { CloudinaryService } from '../cloudinary/cloudinary.service.js';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectModel(Usuario.name) private usuarioModel: Model<Usuario>,
    private cloudinaryService: CloudinaryService,
  ) {}

  async crear(datos: RegistroDto, imagen?: Express.Multer.File) {
    const correo = datos.correo.trim().toLowerCase();
    const nombreUsuario = datos.nombreUsuario.trim().toLowerCase();

    const existentes = await this.usuarioModel.find({ $or: [{ correo }, { nombreUsuario }] });
    const repetidos: string[] = [];
    if (existentes.some((u) => u.correo === correo)) repetidos.push('El correo ya está registrado');
    if (existentes.some((u) => u.nombreUsuario === nombreUsuario)) repetidos.push('El nombre de usuario ya está en uso');
    if (repetidos.length) throw new ConflictException(repetidos.join('. '));

    const usuario = new this.usuarioModel(datos);
    let imagenId: string | null = null;
    if (imagen) {
      const subida = await this.cloudinaryService.subir(imagen, 'perfiles');
      usuario.imagenUrl = subida.url;
      imagenId = subida.id;
    }

    try {
      return await usuario.save();
    } catch (error) {
      // Si ocurre un error que cause que el usuario no se guarde, la imagen se borra para que no quede sola en Cloudinary.
      if (imagenId) await this.cloudinaryService.borrar(imagenId);
      throw error;
    }
  }

  async buscarPorId(id: string) {
    const usuario = isValidObjectId(id) ? await this.usuarioModel.findById(id) : null;
    if (!usuario) throw new NotFoundException('El usuario no existe');
    return usuario;
  }

  buscarParaLogin(usuario: string) {
    const valor = usuario.trim().toLowerCase();
    const filtro = valor.includes('@') ? { correo: valor } : { nombreUsuario: valor };
    return this.usuarioModel.findOne(filtro).select('+contrasena');
  }

  async actualizar(id: string, quienEdita: string, datos: ActualizarPerfilDto) {
    const usuario = await this.buscarPorId(id);
    if (!usuario._id.equals(quienEdita)) {
      throw new ForbiddenException('Solo podés editar tu propio perfil');
    }

    Object.assign(usuario, datos);
    return await usuario.save();
  }
}
