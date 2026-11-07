import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import IDato from '../interfaces/Dato';

@Service()
export class EstadisticasService {
  http = inject(HttpClient);

  // ruta: publicaciones-por-usuario, comentarios-por-dia o comentarios-por-publicacion. Fechas en AAAA-MM-DD.
  traer(ruta: string, desde: string, hasta: string) {
    return this.http.get<IDato[]>(`${environment.API_URL}/estadisticas/${ruta}`, { params: { desde, hasta } });
  }
}
