import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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
import { PublicacionesService } from './publicaciones.service.js';
import { CrearPublicacionDto } from './dto/crear-publicacion.dto.js';
import { OPCIONES_IMAGEN } from '../cloudinary/opciones-imagen.js';
import { TokenGuard } from '../auth/token/token.guard.js';

@Controller('publicaciones')
@UseGuards(TokenGuard)
export class PublicacionesController {
  constructor(private readonly publicacionesService: PublicacionesService) {}

  @Post()
  @UseInterceptors(FileInterceptor('imagen', OPCIONES_IMAGEN))
  crear(
    @Req() req: any,
    @Body() crearPublicacionDto: CrearPublicacionDto,
    @UploadedFile() imagen?: Express.Multer.File,
  ) {
    return this.publicacionesService.crear(crearPublicacionDto, req.usuario.id, imagen);
  }

  @Get()
  async listar(
    @Res({ passthrough: true }) response: Response,
    @Query('orden') orden?: string,
    @Query('autor') autor?: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const { publicaciones, total } = await this.publicacionesService.listar(orden, autor, offset, limit);
    // El total va en un header para que la respuesta siga siendo la lista, y el front sepa cuántas páginas hay.
    response.set('X-Total-Count', String(total));
    return publicaciones;
  }

  @Get(':id')
  buscar(@Param('id') id: string) {
    return this.publicacionesService.buscar(id);
  }

  @Delete(':id')
  eliminar(@Req() req: any, @Param('id') id: string) {
    return this.publicacionesService.eliminar(id, req.usuario.id);
  }

  @Post(':id/me-gusta')
  darMeGusta(@Req() req: any, @Param('id') id: string) {
    return this.publicacionesService.darMeGusta(id, req.usuario.id);
  }

  @Delete(':id/me-gusta')
  quitarMeGusta(@Req() req: any, @Param('id') id: string) {
    return this.publicacionesService.quitarMeGusta(id, req.usuario.id);
  }
}
