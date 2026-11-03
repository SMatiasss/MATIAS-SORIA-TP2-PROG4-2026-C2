import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MeGusta } from '../me-gusta/me-gusta';
import { PublicacionesService } from '../../services/publicaciones';
import IPublicacion from '../../interfaces/Publicacion';

@Component({
  imports: [RouterLink, MeGusta],
  selector: 'app-estrella',
  styleUrl: './estrella.css',
  templateUrl: './estrella.html',
  host: { '[style.--k]': 'brillo()' },
})
export class Estrella {
  servicio = inject(PublicacionesService);
  historia = input.required<IPublicacion>();
  cambio = output<IPublicacion>();
  eliminar = output<IPublicacion>();

  // ===== Visual: brillo de la estrella (el host lo pasa al CSS como --k). =====

  // De 0 a 1 según los me gusta: con 15 o más la estrella brilla al máximo.
  brillo() {
    return Math.min(1, this.historia().cantidadMeGusta / 15);
  }
}
