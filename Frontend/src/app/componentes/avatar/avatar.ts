import { Component, computed, input } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ImagenRespaldo } from '../../directivas/imagen-respaldo';

const AVATAR_POR_DEFECTO = '/avatar.svg';

@Component({
  imports: [ImagenRespaldo],
  selector: 'app-avatar',
  styleUrl: './avatar.css',
  templateUrl: './avatar.html',
  // Le pasa el tamaño al CSS del avatar como la variable --tamano.
  host: { '[style.--tamano.px]': 'tamano()' },
})
export class Avatar {
  imagenUrl = input<string | null>(null);

  rutaImagen = computed(() => {
    const url = this.imagenUrl();
    if (!url) return AVATAR_POR_DEFECTO;
    return url.startsWith('/') ? environment.API_URL + url : url;
  });

  // ===== Visual: tamaño en px (el host lo pasa al CSS como --tamano). =====

  tamano = input(48);
}
