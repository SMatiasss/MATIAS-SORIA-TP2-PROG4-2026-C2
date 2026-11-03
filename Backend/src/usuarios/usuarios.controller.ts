import { Body, Controller, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { ActualizarPerfilDto } from './dto/actualizar-perfil.dto.js';
import { TokenGuard } from '../auth/token/token.guard.js';

@Controller('usuarios')
@UseGuards(TokenGuard)
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Patch(':id')
  actualizar(@Req() req: any, @Param('id') id: string, @Body() datos: ActualizarPerfilDto) {
    return this.usuariosService.actualizar(id, req.usuario.id, datos);
  }
}
