import { Component, input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

const MENSAJES: any = {
  required: () => 'Este campo es obligatorio',
  email: () => 'Ingresá un correo válido, por ejemplo nombre@correo.com',
  minlength: (e: any) => `Tiene que tener al menos ${e.requiredLength} caracteres`,
  maxlength: (e: any) => `Puede tener hasta ${e.requiredLength} caracteres`,
  mayuscula: () => 'Incluí al menos una letra mayúscula',
  numero: () => 'Incluí al menos un número',
  coincidencia: () => 'Las contraseñas no coinciden',
  menorDe13: () => 'Tenés que tener al menos 13 años',
  mayorDe120: () => 'La fecha no puede ser de hace más de 120 años',
};

@Component({
  imports: [ReactiveFormsModule],
  selector: 'app-campo',
  styleUrl: './campo.css',
  templateUrl: './campo.html',
})
export class Campo {
  // No se llama "id" para no duplicar el atributo en el elemento host.
  idCampo = input.required<string>();
  etiqueta = input.required<string>();
  control = input.required<FormControl<string | null>>();
  tipo = input('text');
  autocompletar = input('off');
  placeholder = input('');
  min = input<string | null>(null);
  max = input<string | null>(null);
  multilinea = input(false);
  limite = input<number | null>(null);
  ayuda = input('');
  // Mensajes propios por tipo de error (ej. pattern), que pisan a los generales.
  mensajes = input<any>({});

  error() {
    const control = this.control();
    if (!control.touched || !control.errors) return '';

    const clave = Object.keys(control.errors)[0];
    const propio = this.mensajes()[clave];
    // Primero el mensaje propio del campo, si no el general de MENSAJES y si tampoco hay, uno genérico.
    return propio ?? MENSAJES[clave]?.(control.errors[clave]) ?? 'El valor ingresado no es válido';
  }

  largo() {
    return (this.control().value ?? '').length;
  }
}
