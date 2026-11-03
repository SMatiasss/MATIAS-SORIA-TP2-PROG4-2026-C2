import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterOutlet],
  selector: 'app-inicio',
  styleUrl: './inicio.css',
  templateUrl: './inicio.html',
})
export class Inicio {
  router = inject(Router);

  irAlLogin() {
    this.router.navigateByUrl('/auth/login');
  }

  ngOnDestroy() {
    clearTimeout(this.temporizador);
  }

  // ===== Visual: la carpa se infla al tocarla y se desinfla al cerrar el login o el registro. =====

  // desinflado, inflando, armado o desinflando
  fase = signal('desinflado');
  conPanel = signal(false);
  cuadros = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  temporizador = 0;

  vivo() {
    return this.fase() === 'inflando' || this.fase() === 'armado';
  }

  // Los tiempos esperan a que terminen las animaciones del CSS (--dur y --des).
  inflar() {
    this.fase.set('inflando');
    this.temporizador = setTimeout(() => this.irAlLogin(), 1250);
  }

  desinflar() {
    clearTimeout(this.temporizador);
    this.fase.set('desinflando');
    this.temporizador = setTimeout(() => this.fase.set('desinflado'), 780);
  }

  abrirPanel() {
    clearTimeout(this.temporizador);
    this.fase.set('armado');
    this.conPanel.set(true);
  }

  cerrarPanel() {
    this.conPanel.set(false);
    this.desinflar();
  }
}
