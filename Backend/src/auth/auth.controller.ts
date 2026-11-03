import { Body, Controller, HttpCode, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service.js';
import { RegistroDto } from './dto/registro.dto.js';
import { LoginDto } from './dto/login.dto.js';
import { OPCIONES_IMAGEN } from '../cloudinary/opciones-imagen.js';
import { TokenGuard } from './token/token.guard.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('registro')
  @UseInterceptors(FileInterceptor('imagen', OPCIONES_IMAGEN))
  registro(@Body() registroDto: RegistroDto, @UploadedFile() imagen?: Express.Multer.File) {
    return this.authService.registro(registroDto, imagen);
  }

  @Post('login')
  @HttpCode(200)
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('autorizar')
  @HttpCode(200)
  @UseGuards(TokenGuard)
  autorizar(@Req() req: any) {
    return this.authService.autorizar(req.usuario.id);
  }

  @Post('refrescar')
  @HttpCode(200)
  @UseGuards(TokenGuard)
  refrescar(@Req() req: any) {
    return this.authService.refrescar(req.usuario);
  }
}
