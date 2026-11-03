import { Component, effect, ElementRef, inject, viewChild } from '@angular/core';
import { Modal as ModalService } from '../../services/modal';

@Component({
  selector: 'app-modal',
  styleUrl: './modal.css',
  templateUrl: './modal.html',
})
export class Modal {
  servicio = inject(ModalService);
  private dialogo = viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    effect(() => {
      const dialogo = this.dialogo().nativeElement;
      if (this.servicio.estado()) {
        if (!dialogo.open) dialogo.showModal();
      } else if (dialogo.open) {
        dialogo.close();
      }
    });
  }

  // El evento close llega un momento después de cerrar: si para entonces ya se abrió otro mensaje, no se lo cierra.
  alCerrar() {
    if (!this.dialogo().nativeElement.open) this.servicio.cerrar();
  }

  lista(mensaje: string | string[]) {
    return Array.isArray(mensaje) ? mensaje : null;
  }
}
