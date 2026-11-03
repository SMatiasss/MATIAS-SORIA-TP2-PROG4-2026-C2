import { Component, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Avatar } from '../avatar/avatar';
import { PublicacionesService } from '../../services/publicaciones';
import { Auth } from '../../services/auth';
import { Modal } from '../../services/modal';
import { IComentario } from '../../interfaces/Publicacion';

@Component({
  imports: [Avatar, DatePipe, ReactiveFormsModule],
  selector: 'app-comentario',
  styleUrl: './comentario.css',
  templateUrl: './comentario.html',
})
export class Comentario {
  formBuilder = inject(FormBuilder);
  servicio = inject(PublicacionesService);
  auth = inject(Auth);
  modal = inject(Modal);

  comentario = input.required<IComentario>();
  cambio = output<IComentario>();

  editando = signal(false);
  enviando = signal(false);
  suscripcion?: Subscription;

  formulario = this.formBuilder.group({
    mensaje: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(200)]],
  });

  esMio() {
    return this.comentario().autor._id === this.auth.usuario()?._id;
  }

  largo() {
    return this.formulario.value.mensaje?.length ?? 0;
  }

  editar() {
    this.formulario.setValue({ mensaje: this.comentario().mensaje });
    this.editando.set(true);
  }

  guardar() {
    const mensaje = this.formulario.value.mensaje?.trim() ?? '';
    if (this.formulario.invalid) return;
    // Sin cambios no se manda nada, así no queda marcado como editado.
    if (mensaje === this.comentario().mensaje) {
      this.editando.set(false);
      return;
    }

    this.enviando.set(true);
    this.suscripcion = this.servicio.editarComentario(this.comentario(), mensaje).subscribe({
      next: (comentario) => {
        this.enviando.set(false);
        this.editando.set(false);
        this.cambio.emit(comentario);
      },
      error: (error) => {
        this.enviando.set(false);
        this.modal.errorHttp(error, 'No pudimos guardar el comentario');
      },
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }
}
