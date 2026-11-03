import { Component, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { Estrella } from '../../componentes/estrella/estrella';
import { ContarHistoria } from '../../componentes/contar-historia/contar-historia';
import { PublicacionesService } from '../../services/publicaciones';
import { Modal } from '../../services/modal';
import IPublicacion from '../../interfaces/Publicacion';

@Component({
  imports: [Estrella, ContarHistoria],
  selector: 'app-publicaciones',
  styleUrl: './publicaciones.css',
  templateUrl: './publicaciones.html',
})
export class Publicaciones {
  servicio = inject(PublicacionesService);
  modal = inject(Modal);

  historias = signal<IPublicacion[]>([]);
  // cargando, listo o error
  estado = signal('cargando');
  orden = this.servicio.orden;
  pagina = this.servicio.pagina;
  contando = signal(false);
  porPagina = 15;
  suscripcion?: Subscription;

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    const offset = (this.pagina() - 1) * this.porPagina;
    this.suscripcion = this.servicio.listar(this.orden(), offset, this.porPagina).subscribe({
      next: (historias) => {
        this.historias.set(historias);
        this.estado.set('listo');
        this.animarEntrada();
      },
      error: (error) => {
        // Si falla, la página vuelve a la que se sigue viendo en pantalla.
        this.pagina.set(this.paginaVista());
        this.estado.set('error');
        this.fase.set('');
        this.modal.errorHttp(error, 'No pudimos traer las historias');
      },
    });
  }

  irA(pagina: number) {
    // Mientras dura la animación no se puede volver a cambiar de página.
    if (this.fase()) return;
    const haciaAtras = pagina < this.pagina();
    this.pagina.set(pagina);
    this.animarSalida(haciaAtras, () => this.cargar());
  }

  ordenar(orden: string) {
    if (orden === this.orden() || this.fase()) return;
    this.orden.set(orden);
    this.irA(1);
  }

  totalPaginas() {
    return Math.max(1, Math.ceil(this.servicio.total() / this.porPagina));
  }

  cambio(historia: IPublicacion) {
    this.historias.update((lista) => lista.map((h) => (h._id === historia._id ? historia : h)));
  }

  eliminar(historia: IPublicacion) {
    this.modal.confirmar(
      '¿Eliminar esta historia?',
      `"${historia.titulo}" va a dejar de aparecer en el cielo y en tu carpa.`,
      'Eliminar',
      () => {
        this.suscripcion = this.servicio.eliminar(historia._id).subscribe({
          next: () => {
            this.modal.exito('Historia eliminada', 'Tu historia ya no aparece en el cielo.');
            if (this.historias().length === 1 && this.pagina() > 1) this.pagina.update((p) => p - 1);
            this.cargar();
          },
          error: (error) => this.modal.errorHttp(error, 'No pudimos eliminar la historia'),
        });
      },
    );
  }

  contar(hoja: HTMLDialogElement) {
    this.contando.set(true);
    hoja.showModal();
  }

  alContar(hoja: HTMLDialogElement) {
    hoja.close();
    this.orden.set('fecha');
    this.irA(1);
  }

  ngOnDestroy() {
    clearTimeout(this.temporizador);
    this.suscripcion?.unsubscribe();
  }

  // ===== Visual: animación del cielo, posición de las estrellas y rueda. No cambia qué historias se piden. =====

  // La rueda gira al instante; las estrellas cambian cuando terminó la animación de salida.
  paginaVista = signal(this.pagina());
  // '' (quietas), 'sale' o 'entra'
  fase = signal('');
  atras = signal(false);
  temporizador = 0;

  animarSalida(haciaAtras: boolean, alTerminar: () => void) {
    this.atras.set(haciaAtras);
    this.fase.set('sale');
    this.temporizador = setTimeout(alTerminar, 420);
  }

  animarEntrada() {
    this.paginaVista.set(this.pagina());
    this.fase.set('entra');
    this.temporizador = setTimeout(() => this.fase.set(''), 540);
  }

  // El click en el fondo oscuro le llega al <dialog>: se cierra solo si cae fuera de la hoja.
  cerrarAlTocarFuera(evento: MouseEvent, hoja: HTMLDialogElement) {
    const caja = hoja.getBoundingClientRect();
    const fuera =
      evento.clientX < caja.left || evento.clientX > caja.right || evento.clientY < caja.top || evento.clientY > caja.bottom;
    if (fuera) hoja.close();
  }

  x(i: number) {
    return 10 + ((i + 0.5) * 80) / this.historias().length;
  }

  // Cinco alturas posibles; la página corre el dibujo para que cada página se vea distinta.
  y(i: number) {
    return 30 + ((i * 3 + this.paginaVista()) % 5) * 8;
  }

  // Números de la rueda: tres páginas antes y tres después de la actual, sin pasar de la última.
  numeros() {
    const lista = [];
    const ultima = Math.min(this.totalPaginas(), this.pagina() + 3);
    for (let n = Math.max(1, this.pagina() - 3); n <= ultima; n++) lista.push(n);
    return lista;
  }
}
