import { Directive, inject, input, output } from '@angular/core';
import { Modal } from '../services/modal';

// <button appConfirmar="¿Eliminar?" mensajeConfirmar="…" (confirmado)="eliminar()">: la acción solo corre si se acepta en el modal.
@Directive({
  selector: '[appConfirmar]',
  host: {
    '(click)': 'preguntar()',
  },
})
export class Confirmar {
  modal = inject(Modal);

  appConfirmar = input.required<string>();
  mensajeConfirmar = input('');
  botonConfirmar = input('Aceptar');
  confirmado = output();

  preguntar() {
    this.modal.confirmar(this.appConfirmar(), this.mensajeConfirmar(), this.botonConfirmar(), () =>
      this.confirmado.emit(),
    );
  }
}
