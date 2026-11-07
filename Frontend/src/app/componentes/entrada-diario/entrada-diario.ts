import { Component, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { PublicacionesService } from '../../services/publicaciones';
import { Modal } from '../../services/modal';
import IPublicacion, { IComentario } from '../../interfaces/Publicacion';
import { TextoCortoPipe } from '../../pipes/texto-corto-pipe';
import { PluralPipe } from '../../pipes/plural-pipe';

@Component({
  imports: [RouterLink, DatePipe, TextoCortoPipe, PluralPipe],
  selector: 'app-entrada-diario',
  styleUrl: './entrada-diario.css',
  templateUrl: './entrada-diario.html',
})
export class EntradaDiario {
  servicio = inject(PublicacionesService);
  modal = inject(Modal);
  historia = input.required<IPublicacion>();

  comentarios = signal<IComentario[]>([]);
  total = signal(0);
  cargados = signal(false);
  suscripcion?: Subscription;

  // Cada entrada reserva un renglón: muestra el último comentario y cuántos más tiene.
  ngOnInit() {
    this.suscripcion = this.servicio.comentarios(this.historia()._id, 0, 1).subscribe({
      next: (respuesta) => {
        this.comentarios.set(respuesta.comentarios);
        this.total.set(respuesta.total);
        this.cargados.set(true);
      },
      error: (error) => this.modal.errorHttp(error, 'No pudimos traer los comentarios'),
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }

  // ===== Visual: la entrada grande lleva la foto debajo del título; las chicas, al costado. =====

  grande = input(false);
}
