import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import IUsuario, { IAltaUsuario } from '../interfaces/Usuario';

const API_USUARIOS = `${environment.API_URL}/usuarios`;

// Rutas del dashboard de usuarios: el back solo las acepta con el token de un administrador.
@Service()
export class UsuariosService {
  http = inject(HttpClient);

  listar(offset: number, limit: number) {
    return this.http.get<IUsuario[]>(API_USUARIOS, { params: { offset, limit }, observe: 'response' }).pipe(
      map((respuesta) => ({
        usuarios: respuesta.body ?? [],
        total: Number(respuesta.headers.get('X-Total-Count')),
      })),
    );
  }

  // No usa auth.registrar(): ese guarda la sesión del usuario nuevo y el administrador quedaría logueado como él.
  crear(datos: IAltaUsuario) {
    const formData = new FormData();
    formData.append('nombre', datos.nombre);
    formData.append('apellido', datos.apellido);
    formData.append('correo', datos.correo);
    formData.append('nombreUsuario', datos.nombreUsuario);
    formData.append('contrasena', datos.contrasena);
    formData.append('fechaNacimiento', datos.fechaNacimiento);
    formData.append('descripcion', datos.descripcion);
    formData.append('perfil', datos.perfil);
    if (datos.imagen) formData.append('imagen', datos.imagen);

    return this.http.post<IUsuario>(API_USUARIOS, formData);
  }

  deshabilitar(id: string) {
    return this.http.delete<IUsuario>(`${API_USUARIOS}/${id}`);
  }

  habilitar(id: string) {
    return this.http.post<IUsuario>(`${API_USUARIOS}/${id}/habilitar`, {});
  }
}
