import { Component, inject, input, signal } from '@angular/core';
import { DatePipe, Location } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Avatar } from '../../componentes/avatar/avatar';
import { MeGusta } from '../../componentes/me-gusta/me-gusta';
import { Comentario } from '../../componentes/comentario/comentario';
import { PublicacionesService } from '../../services/publicaciones';
import { Modal } from '../../services/modal';
import IPublicacion, { IComentario } from '../../interfaces/Publicacion';
import { Confirmar } from '../../directivas/confirmar';

// Comentarios que llegan en la primera carga y en cada "cargar más".
const POR_TANDA = 5;

@Component({
  imports: [Avatar, MeGusta, Comentario, DatePipe, RouterLink, ReactiveFormsModule, Confirmar],
  selector: 'app-publicacion',
  styleUrl: './publicacion.css',
  templateUrl: './publicacion.html',
})
export class Publicacion {
  // El id llega desde la ruta /publicaciones/:id (withComponentInputBinding)
  id = input<string>();
  servicio = inject(PublicacionesService);
  modal = inject(Modal);
  location = inject(Location);
  router = inject(Router);
  formBuilder = inject(FormBuilder);

  historia = signal<IPublicacion | null>(null);
  // cargando, listo, noExiste o error
  estado = signal('cargando');
  comentarios = signal<IComentario[]>([]);
  total = signal(0);
  cargandoComentarios = signal(false);
  // Si la carga falla, no se muestra "Todavía nadie comentó" (no sería cierto).
  comentariosCargados = signal(false);
  enviando = signal(false);
  suscripcion?: Subscription;

  formulario = this.formBuilder.group({
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
  });

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.estado.set('cargando');
    this.suscripcion = this.servicio.buscar(this.id() ?? '').subscribe({
      next: (historia) => {
        this.historia.set(historia);
        this.estado.set('listo');
        this.cargarComentarios();
      },
      error: (error) => {
        if (error.status === 404) {
          this.estado.set('noExiste');
          return;
        }
        this.estado.set('error');
        this.modal.errorHttp(error, 'No pudimos traer la historia');
      },
    });
  }

  // Trae la tanda siguiente y la suma al final, sin borrar los comentarios que ya se ven.
  cargarComentarios() {
    this.cargandoComentarios.set(true);
    this.suscripcion = this.servicio
      .comentarios(this.id() ?? '', this.comentarios().length, POR_TANDA)
      .subscribe({
        next: (respuesta) => {
          this.comentarios.update((lista) => [...lista, ...respuesta.comentarios]);
          this.total.set(respuesta.total);
          this.cargandoComentarios.set(false);
          this.comentariosCargados.set(true);
        },
        error: (error) => {
          this.cargandoComentarios.set(false);
          this.modal.errorHttp(error, 'No pudimos traer los comentarios');
        },
      });
  }

  comentar() {
    if (this.formulario.invalid) return;

    this.enviando.set(true);
    this.suscripcion = this.servicio.comentar(this.id() ?? '', this.formulario.value.mensaje ?? '').subscribe({
      next: (comentario) => {
        this.enviando.set(false);
        this.formulario.reset();
        this.comentarios.update((lista) => [comentario, ...lista]);
        this.total.update((total) => total + 1);
      },
      error: (error) => {
        this.enviando.set(false);
        this.modal.errorHttp(error, 'No pudimos publicar tu comentario');
      },
    });
  }

  cambio(comentario: IComentario) {
    this.comentarios.update((lista) => lista.map((c) => (c._id === comentario._id ? comentario : c)));
  }

  largo() {
    return this.formulario.value.mensaje?.length ?? 0;
  }

  volver() {
    this.location.back();
  }

  // La confirmación ya la pidió la directiva appConfirmar del botón.
  eliminar() {
    this.suscripcion = this.servicio.eliminar(this.id() ?? '').subscribe({
      next: () => {
        this.router.navigateByUrl('/publicaciones');
        this.modal.exito('Historia eliminada', 'La historia y sus comentarios ya no aparecen en el cielo.');
      },
      error: (error) => this.modal.errorHttp(error, 'No pudimos eliminar la historia'),
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }

  // ===== Visual: el libro baja (click en su borde o rueda sobre el fondo) para dejar ver la fogata. =====

  bajo = signal(false);
}
