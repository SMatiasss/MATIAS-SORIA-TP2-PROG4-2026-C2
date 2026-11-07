import { Directive, input } from '@angular/core';

// Atenúa y pasa a gris lo que corresponde a un usuario deshabilitado: [appInactivo]="!usuario.activo".
@Directive({
  selector: '[appInactivo]',
  host: {
    '[style.opacity]': 'appInactivo() ? 0.5 : null',
    '[style.filter]': "appInactivo() ? 'grayscale(1)' : null",
  },
})
export class Inactivo {
  appInactivo = input(false);
}
