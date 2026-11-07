import { Directive, ElementRef, inject, input } from '@angular/core';

// Si la imagen no carga (URL rota o borrada en Cloudinary), muestra la de respaldo: por defecto, el avatar.
@Directive({
  selector: 'img[appImagenRespaldo]',
  host: {
    '(error)': 'usarRespaldo()',
  },
})
export class ImagenRespaldo {
  el: ElementRef<HTMLImageElement> = inject(ElementRef);
  respaldo = input('/avatar.svg');

  usarRespaldo() {
    // Si también falla el respaldo no se vuelve a intentar: si no, quedaría en un bucle de errores.
    if (this.el.nativeElement.src.endsWith(this.respaldo())) return;
    this.el.nativeElement.src = this.respaldo();
  }
}
