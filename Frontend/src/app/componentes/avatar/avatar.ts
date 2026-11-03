import { Component, computed, input, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

const AVATAR_POR_DEFECTO = '/avatar.svg';

@Component({
  selector: 'app-avatar',
  styleUrl: './avatar.css',
  templateUrl: './avatar.html',
  // Le pasa el tamaño al CSS del avatar como la variable --tamano.
  host: { '[style.--tamano.px]': 'tamano()' },
})
export class Avatar {
  imagenUrl = input<string | null>(null);

  // Se guarda la URL que falló: si cambia, se vuelve a intentar con la nueva.
  urlFallida = signal<string | null>(null);

  rutaImagen = computed(() => {
    const url = this.imagenUrl();
    if (!url || url === this.urlFallida()) return AVATAR_POR_DEFECTO;
    return url.startsWith('/') ? environment.API_URL + url : url;
  });

  alFallar() {
    this.urlFallida.set(this.imagenUrl());
  }

  // ===== Visual: tamaño en px (el host lo pasa al CSS como --tamano). =====

  tamano = input(48);
}
