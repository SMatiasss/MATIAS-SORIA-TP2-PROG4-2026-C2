import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { UsuariosService } from './usuarios.service.js';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto.js';
import { CrearUsuarioDto } from './dto/crear-usuario.dto.js';
import { TokenGuard } from '../auth/token/token.guard.js';
import { AdminGuard } from '../auth/admin/admin.guard.js';
import { OPCIONES_IMAGEN } from '../cloudinary/opciones-imagen.js';

@Controller('usuarios')
@UseGuards(TokenGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  @UseGuards(AdminGuard)
  async listar(
    @Res({ passthrough: true }) response: Response,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const { usuarios, total } = await this.usuariosService.listar(offset, limit);
    // Igual que en las publicaciones: con el total el front sabe cuántas páginas hay.
    response.set('X-Total-Count', String(total));
    return usuarios;
  }

  // Alta desde el dashboard: a diferencia del registro, el administrador elige el perfil y no se devuelve un token.
  @Post()
  @UseGuards(AdminGuard)
  @UseInterceptors(FileInterceptor('imagen', OPCIONES_IMAGEN))
  crear(@Body() crearUsuarioDto: CrearUsuarioDto, @UploadedFile() imagen?: Express.Multer.File) {
    return this.usuariosService.crear(crearUsuarioDto, imagen);
  }

  @Patch(':id')
  actualizar(@Req() req: any, @Param('id') id: string, @Body() datos: ActualizarPerfilDto) {
    return this.usuariosService.actualizar(id, req.usuario.id, datos);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  deshabilitar(@Param('id') id: string) {
    return this.usuariosService.cambiarActivo(id, false);
  }

  @Post(':id/habilitar')
  @HttpCode(200)
  @UseGuards(AdminGuard)
  habilitar(@Param('id') id: string) {
    return this.usuariosService.cambiarActivo(id, true);
  }
}
