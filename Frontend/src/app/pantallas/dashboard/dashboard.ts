import { Component, signal } from '@angular/core';
import { PanelUsuarios } from '../../componentes/panel-usuarios/panel-usuarios';
import { PanelEstadisticas } from '../../componentes/panel-estadisticas/panel-estadisticas';

// En el video la pizarra recién empieza a moverse a los 0.375 s: se arranca desde ahí para que responda enseguida al clic.
// El CSS salta lo mismo con un animation-delay negativo.
const INICIO_GIRO = 0.375;

@Component({
  imports: [PanelUsuarios, PanelEstadisticas],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  // usuarios o estadisticas
  seccion = signal('usuarios');

  cambiarSeccion() {
    this.seccion.set(this.seccion() === 'usuarios' ? 'estadisticas' : 'usuarios');
  }

  // ===== Visual: giro de la pizarra. =====

  girando = signal(false);
  // El video siempre gira para el mismo lado: se cuentan las vueltas para que el CSS siga ese sentido y no vuelva para atrás.
  giros = signal(0);

  girar(video: HTMLVideoElement) {
    this.girando.set(true);
    this.cambiarSeccion();
    video.currentTime = INICIO_GIRO;
    video.play();
  }

  // El último cuadro del video es igual al primero: al terminar, la pizarra queda quieta mostrando la otra cara.
  terminarGiro() {
    this.giros.update((giros) => giros + 1);
    this.girando.set(false);
  }
}
