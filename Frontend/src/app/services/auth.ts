import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Modal } from './modal';
import IUsuario, { IActualizarPerfil, ICrearUsuario, ILogin, ISesion } from '../interfaces/Usuario';

@Service()
export class Auth {
  http = inject(HttpClient);
  router = inject(Router);
  modal = inject(Modal);

  usuario = signal<IUsuario | null>(null);
  temporizador = 0;

  registrar(datos: ICrearUsuario) {
    // Va como FormData y no como JSON porque puede llevar la foto de perfil.
    const formData = new FormData();
    formData.append('nombre', datos.nombre);
    formData.append('apellido', datos.apellido);
    formData.append('correo', datos.correo);
    formData.append('nombreUsuario', datos.nombreUsuario);
    formData.append('contrasena', datos.contrasena);
    formData.append('fechaNacimiento', datos.fechaNacimiento);
    formData.append('descripcion', datos.descripcion);
    if (datos.imagen) formData.append('imagen', datos.imagen);

    return this.http
      .post<ISesion>(`${environment.API_URL}/auth/registro`, formData)
      .pipe(tap((sesion) => this.guardarSesion(sesion)));
  }

  loguear(datos: ILogin) {
    return this.http
      .post<ISesion>(`${environment.API_URL}/auth/login`, datos)
      .pipe(tap((sesion) => this.guardarSesion(sesion)));
  }

  // Lo usa la pantalla de carga: el back valida el token guardado y devuelve el usuario.
  autorizar() {
    return this.http.post<IUsuario>(`${environment.API_URL}/auth/autorizar`, {}).pipe(
      tap((usuario) => {
        this.usuario.set(usuario);
        this.iniciarContador();
      }),
    );
  }

  refrescar() {
    this.http.post<{ token: string }>(`${environment.API_URL}/auth/refrescar`, {}).subscribe({
      next: (respuesta) => {
        this.guardarToken(respuesta.token);
        this.modal.exito('Sesión extendida', 'Tenés 15 minutos más en el campamento.');
      },
      error: (error) => this.modal.errorHttp(error, 'No pudimos extender tu sesión'),
    });
  }

  guardarSesion(sesion: ISesion) {
    this.usuario.set(sesion.usuario);
    this.guardarToken(sesion.token);
  }

  // Se anota cuándo llegó el token: así, si se recarga la página, el contador sigue desde ahí y no arranca de cero.
  guardarToken(token: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('tokenDesde', String(Date.now()));
    this.iniciarContador();
  }

  // El token vence a los 15 minutos: a los 10 de recibirlo (quedan 5) se pregunta si extender la sesión.
  iniciarContador() {
    clearTimeout(this.temporizador);
    const desde = Number(localStorage.getItem('tokenDesde'));
    this.temporizador = setTimeout(() => this.avisarVencimiento(), desde + 3 * 60 * 1000 - Date.now());
  }

  avisarVencimiento() {
    this.modal.confirmar(
      'Tu sesión está por vencer',
      'Te quedan 5 minutos de sesión. ¿Querés extenderla para seguir en el campamento?',
      'Extender sesión',
      () => this.refrescar(),
    );
  }

  actualizarPerfil(datos: IActualizarPerfil) {
    return this.http
      .patch<IUsuario>(`${environment.API_URL}/usuarios/${this.usuario()!._id}`, datos)
      .pipe(tap((usuario) => this.usuario.set(usuario)));
  }

  cerrarSesion(ruta = '/auth') {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenDesde');
    clearTimeout(this.temporizador);
    this.usuario.set(null);
    this.router.navigateByUrl(ruta);
  }
}
