import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { Avatar } from '../../componentes/avatar/avatar';
import { EntradaDiario } from '../../componentes/entrada-diario/entrada-diario';
import { PublicacionesService } from '../../services/publicaciones';
import { Auth } from '../../services/auth';
import { Modal } from '../../services/modal';
import { DE_3_A_20, edadPermitida, fechaHaceAnios } from '../../validators/validadores';
import IPublicacion from '../../interfaces/Publicacion';
import { IActualizarPerfil } from '../../interfaces/Usuario';

@Component({
  imports: [Avatar, EntradaDiario, RouterLink, DatePipe, ReactiveFormsModule],
  selector: 'app-mi-perfil',
  styleUrl: './mi-perfil.css',
  templateUrl: './mi-perfil.html',
})
export class MiPerfil {
  auth = inject(Auth);
  servicio = inject(PublicacionesService);
  modal = inject(Modal);
  formBuilder = inject(FormBuilder);

  historias = signal<IPublicacion[]>([]);
  cargadas = signal(false);
  editando = signal(false);
  enviando = signal(false);
  fechaMaxima = fechaHaceAnios(13);
  fechaMinima = fechaHaceAnios(120);
  suscripcion?: Subscription;
  suscripcionPerfil?: Subscription;

  formulario = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.pattern(DE_3_A_20)]],
    apellido: ['', [Validators.required, Validators.pattern(DE_3_A_20)]],
    fechaNacimiento: ['', [Validators.required, edadPermitida]],
    descripcion: ['', [Validators.maxLength(200)]],
  });

  ngOnInit() {
    const usuario = this.auth.usuario();
    if (!usuario) return;

    this.suscripcion = this.servicio.listar('fecha', 0, 3, usuario._id).subscribe({
      next: (historias) => {
        this.historias.set(historias);
        this.cargadas.set(true);
      },
      error: (error) => this.modal.errorHttp(error, 'No pudimos traer tus historias'),
    });
  }

  editar() {
    const perfil = this.auth.usuario();
    if (!perfil) return;

    this.formulario.setValue({
      nombre: perfil.nombre,
      apellido: perfil.apellido,
      // "en-CA" en UTC da AAAA-MM-DD, el mismo formato que necesita <input type="date">.
      fechaNacimiento: new Date(perfil.fechaNacimiento).toLocaleDateString('en-CA', { timeZone: 'UTC' }),
      descripcion: perfil.descripcion,
    });
    this.editando.set(true);
  }

  cancelar() {
    this.editando.set(false);
  }

  guardar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.suscripcionPerfil = this.auth.actualizarPerfil(this.formulario.value as IActualizarPerfil).subscribe({
      next: () => {
        this.enviando.set(false);
        this.editando.set(false);
        this.modal.exito('Perfil actualizado', 'Tus datos se guardaron correctamente.');
      },
      error: (error) => {
        this.enviando.set(false);
        this.modal.errorHttp(error, 'No pudimos actualizar tu perfil');
      },
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
    this.suscripcionPerfil?.unsubscribe();
  }
}
