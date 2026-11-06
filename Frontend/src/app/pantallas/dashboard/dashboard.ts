import { Component, signal } from '@angular/core';

@Component({
  imports: [],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  // usuarios o estadisticas
  seccion = signal('usuarios');

  // ===== Visual: giro de la pizarra. =====

  girando = signal(false);

  girar(video: HTMLVideoElement) {
    this.girando.set(true);
    video.play();
  }

  // El último cuadro del video es igual al primero: al terminar, la pizarra queda quieta mostrando la otra cara.
  terminarGiro() {
    this.seccion.set(this.seccion() === 'usuarios' ? 'estadisticas' : 'usuarios');
    this.girando.set(false);
  }
}
