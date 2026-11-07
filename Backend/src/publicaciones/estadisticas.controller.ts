import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticasService } from './estadisticas.service.js';
import { TokenGuard } from '../auth/token/token.guard.js';
import { AdminGuard } from '../auth/admin/admin.guard.js';

@Controller('estadisticas')
@UseGuards(TokenGuard, AdminGuard)
export class EstadisticasController {
  constructor(private readonly estadisticasService: EstadisticasService) {}

  @Get('publicaciones-por-usuario')
  publicacionesPorUsuario(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.estadisticasService.publicacionesPorUsuario(desde, hasta);
  }

  @Get('comentarios-por-dia')
  comentariosPorDia(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.estadisticasService.comentariosPorDia(desde, hasta);
  }

  @Get('comentarios-por-publicacion')
  comentariosPorPublicacion(@Query('desde') desde?: string, @Query('hasta') hasta?: string) {
    return this.estadisticasService.comentariosPorPublicacion(desde, hasta);
  }
}
