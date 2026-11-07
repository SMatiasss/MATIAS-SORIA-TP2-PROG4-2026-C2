import { Pipe, PipeTransform } from '@angular/core';

// "2026-11-06T20:40:05Z" -> "hace 3 horas". Pasado un mes ya conviene la fecha.
@Pipe({
  name: 'tiempoRelativo',
})
export class TiempoRelativoPipe implements PipeTransform {
  transform(fecha: string): string {
    const minutos = Math.floor((Date.now() - Date.parse(fecha)) / 60000);
    if (minutos < 1) return 'recién';
    if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;

    const horas = Math.floor(minutos / 60);
    if (horas < 24) return `hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;

    const dias = Math.floor(horas / 24);
    if (dias < 30) return `hace ${dias} ${dias === 1 ? 'día' : 'días'}`;

    return new Date(fecha).toLocaleDateString('es-AR');
  }
}
