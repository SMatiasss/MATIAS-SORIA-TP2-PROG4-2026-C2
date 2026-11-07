import { Pipe, PipeTransform } from '@angular/core';

// {{ 3 | plural: 'comentario' }} -> "3 comentarios". Si el plural no es agregar una "s", se pasa aparte.
@Pipe({
  name: 'plural',
})
export class PluralPipe implements PipeTransform {
  transform(cantidad: number, singular: string, plural: string = singular + 's'): string {
    return `${cantidad} ${cantidad === 1 ? singular : plural}`;
  }
}
