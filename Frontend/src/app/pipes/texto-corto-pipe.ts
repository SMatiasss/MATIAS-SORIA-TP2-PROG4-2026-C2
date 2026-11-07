import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'textoCorto',
})
export class TextoCortoPipe implements PipeTransform {
  transform(texto: string, largoMaximo: number = 60): string {
    if (texto.length > largoMaximo) {
      return texto.slice(0, largoMaximo).trimEnd() + '…';
    }
    return texto;
  }
}
