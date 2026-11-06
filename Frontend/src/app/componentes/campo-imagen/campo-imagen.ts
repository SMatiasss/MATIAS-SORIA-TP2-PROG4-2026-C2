import { Component, input, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Avatar } from '../avatar/avatar';

@Component({
  imports: [Avatar],
  selector: 'app-campo-imagen',
  styleUrl: './campo-imagen.css',
  templateUrl: './campo-imagen.html',
})
export class CampoImagen {
  idCampo = input.required<string>();
  etiqueta = input.required<string>();
  control = input.required<FormControl<File | null>>();

  cargarImagen(evento: InputEvent) {
    const elemento = evento.target as HTMLInputElement;
    if (elemento.files) {
      this.control().setValue(elemento.files[0] ?? null);
      this.control().markAsTouched();
    }

    this.mostrarVistaPrevia();
  }

  error() {
    const control = this.control();
    if (control.hasError('tipoImagen')) return 'La imagen tiene que ser PNG, JPG o WEBP';
    if (control.hasError('pesoImagen')) return 'La imagen puede pesar hasta 1 MB';
    return '';
  }

  ngOnDestroy() {
    this.liberarVistaPrevia();
  }

  // ===== Visual: vista previa de la foto elegida, antes de subirla. =====

  // Foto de perfil: la vista previa es el avatar redondo; si no, un recuadro de foto
  perfil = input(false);
  vistaPrevia = signal<string | null>(null);

  mostrarVistaPrevia() {
    this.liberarVistaPrevia();
    const archivo = this.control().value;
    if (archivo && this.control().valid) {
      // createObjectURL crea una URL temporal que apunta a la foto elegida, para mostrarla antes de subirla.
      this.vistaPrevia.set(URL.createObjectURL(archivo));
    }
  }

  liberarVistaPrevia() {
    const url = this.vistaPrevia();
    // revokeObjectURL borra esa URL temporal para que la foto anterior no siga ocupando memoria.
    if (url) URL.revokeObjectURL(url);
    this.vistaPrevia.set(null);
  }
}
