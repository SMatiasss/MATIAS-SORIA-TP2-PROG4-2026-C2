import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import IPublicacion, { IComentario, ICrearPublicacion } from '../interfaces/Publicacion';
import { Auth } from './auth';

const API_PUBLICACIONES = `${environment.API_URL}/publicaciones`;

@Service()
export class PublicacionesService {
  http = inject(HttpClient);
  auth = inject(Auth);

  // Viven acá y no en la pantalla para que al volver de una historia el cielo siga en la misma página y orden.
  // fecha o meGusta
  orden = signal('fecha');
  pagina = signal(1);
  // Cantidad de historias del cielo, para saber cuántas páginas hay.
  total = signal(0);

  listar(orden: string, offset: number, limit: number, autor?: string) {
    const params: any = { orden, offset, limit };
    if (autor) params.autor = autor;
    return this.http.get<IPublicacion[]>(API_PUBLICACIONES, { params, observe: 'response' }).pipe(
      tap((respuesta) => {
        if (!autor) this.total.set(Number(respuesta.headers.get('X-Total-Count')));
      }),
      map((respuesta) => respuesta.body ?? []),
    );
  }

  buscar(id: string) {
    return this.http.get<IPublicacion>(`${API_PUBLICACIONES}/${id}`);
  }

  comentarios(id: string, offset: number, limit: number) {
    return this.http
      .get<IComentario[]>(`${API_PUBLICACIONES}/${id}/comentarios`, { params: { offset, limit }, observe: 'response' })
      .pipe(
        map((respuesta) => ({
          comentarios: respuesta.body ?? [],
          total: Number(respuesta.headers.get('X-Total-Count')),
        })),
      );
  }

  comentar(id: string, mensaje: string) {
    return this.http.post<IComentario>(`${API_PUBLICACIONES}/${id}/comentarios`, { mensaje });
  }

  editarComentario(comentario: IComentario, mensaje: string) {
    return this.http.put<IComentario>(
      `${API_PUBLICACIONES}/${comentario.publicacion}/comentarios/${comentario._id}`,
      { mensaje },
    );
  }

  crear(datos: ICrearPublicacion) {
    const formData = new FormData();
    formData.append('titulo', datos.titulo);
    formData.append('mensaje', datos.mensaje);
    if (datos.imagen) formData.append('imagen', datos.imagen);

    return this.http.post<IPublicacion>(API_PUBLICACIONES, formData);
  }

  eliminar(id: string) {
    return this.http.delete<IPublicacion>(`${API_PUBLICACIONES}/${id}`);
  }

  darMeGusta(id: string) {
    return this.http.post<IPublicacion>(`${API_PUBLICACIONES}/${id}/me-gusta`, {});
  }

  quitarMeGusta(id: string) {
    return this.http.delete<IPublicacion>(`${API_PUBLICACIONES}/${id}/me-gusta`);
  }

  dioMeGusta(historia: IPublicacion) {
    const usuario = this.auth.usuario();
    return !!usuario && historia.meGusta.some((meGusta) => meGusta.usuario === usuario._id);
  }

  esMia(historia: IPublicacion) {
    return historia.autor._id === this.auth.usuario()?._id;
  }

  imagen(historia: IPublicacion) {
    const url = historia.imagenUrl;
    if (!url) return null;
    return url.startsWith('/') ? environment.API_URL + url : url;
  }
}
