import { Component, inject, input, output, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { PublicacionesService } from '../../services/publicaciones';
import { Modal } from '../../services/modal';
import IPublicacion from '../../interfaces/Publicacion';

@Component({
  selector: 'app-me-gusta',
  styleUrl: './me-gusta.css',
  templateUrl: './me-gusta.html',
})
export class MeGusta {
  servicio = inject(PublicacionesService);
  modal = inject(Modal);

  historia = input.required<IPublicacion>();
  cambio = output<IPublicacion>();

  enviando = signal(false);
  suscripcion?: Subscription;

  alternar() {
    const historia = this.historia();
    const pedido = this.servicio.dioMeGusta(historia)
      ? this.servicio.quitarMeGusta(historia._id)
      : this.servicio.darMeGusta(historia._id);

    this.enviando.set(true);
    this.suscripcion = pedido.subscribe({
      next: (actualizada) => {
        this.enviando.set(false);
        this.cambio.emit(actualizada);
      },
      error: (error) => {
        this.enviando.set(false);
        this.modal.errorHttp(error, 'No pudimos actualizar el me gusta');
      },
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }

  // ===== Visual: en la historia abierta va sobre el papel, en tinta y con el texto "me gusta". =====

  papel = input(false);
}
