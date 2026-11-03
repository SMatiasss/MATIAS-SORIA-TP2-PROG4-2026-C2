import { Body, Controller, Get, Param, Post, Put, Query, Req, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { ComentariosService } from './comentarios.service.js';
import { ComentarioDto } from './dto/comentario.dto.js';
import { TokenGuard } from '../auth/token/token.guard.js';

@Controller('publicaciones')
@UseGuards(TokenGuard)
export class ComentariosController {
  constructor(private readonly comentariosService: ComentariosService) {}

  @Get(':id/comentarios')
  async listar(
    @Res({ passthrough: true }) response: Response,
    @Param('id') id: string,
    @Query('offset') offset?: string,
    @Query('limit') limit?: string,
  ) {
    const { comentarios, total } = await this.comentariosService.listar(id, offset, limit);
    // Igual que en las publicaciones: con el total el front sabe si quedan comentarios para "cargar más".
    response.set('X-Total-Count', String(total));
    return comentarios;
  }

  @Post(':id/comentarios')
  crear(@Req() req: any, @Param('id') id: string, @Body() comentarioDto: ComentarioDto) {
    return this.comentariosService.crear(id, req.usuario.id, comentarioDto.mensaje);
  }

  @Put(':id/comentarios/:comentarioId')
  editar(
    @Req() req: any,
    @Param('id') id: string,
    @Param('comentarioId') comentarioId: string,
    @Body() comentarioDto: ComentarioDto,
  ) {
    return this.comentariosService.editar(id, comentarioId, req.usuario.id, comentarioDto.mensaje);
  }
}
