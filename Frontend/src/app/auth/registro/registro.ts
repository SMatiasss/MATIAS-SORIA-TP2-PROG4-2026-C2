import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Modal } from '../../services/modal';
import { Campo } from '../../componentes/campo/campo';
import { CampoImagen } from '../../componentes/campo-imagen/campo-imagen';
import {
  coincideCon,
  contrasenaSegura,
  correoValido,
  DE_3_A_20,
  edadPermitida,
  fechaHaceAnios,
  imagenValida,
} from '../../validators/validadores';
import { ICrearUsuario } from '../../interfaces/Usuario';
import { Subscription } from 'rxjs';

@Component({
  imports: [ReactiveFormsModule, RouterLink, Campo, CampoImagen],
  selector: 'app-registro',
  templateUrl: './registro.html',
  host: { class: 'panel panel--ancho' },
})
export class Registro {
  formBuilder = inject(FormBuilder);
  auth = inject(Auth);
  router = inject(Router);
  modal = inject(Modal);

  enviando = signal(false);
  suscripcion?: Subscription;
  suscripcionContrasena: Subscription;
  fechaMaxima = fechaHaceAnios(13);
  fechaMinima = fechaHaceAnios(120);

  formulario = this.formBuilder.group({
    nombre: ['', [Validators.required, Validators.pattern(DE_3_A_20)]],
    apellido: ['', [Validators.required, Validators.pattern(DE_3_A_20)]],
    nombreUsuario: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9_.]+$/),
      ],
    ],
    fechaNacimiento: ['', [Validators.required, edadPermitida]],
    correo: ['', [Validators.required, correoValido]],
    contrasena: ['', [Validators.required, Validators.minLength(8), contrasenaSegura]],
    repetirContrasena: ['', [Validators.required, coincideCon('contrasena')]],
    descripcion: ['', [Validators.maxLength(200)]],
    imagen: new FormControl<File | null>(null, [imagenValida]),
  });

  constructor() {
    // valueChanges avisa cada vez que cambia la contraseña; updateValueAndValidity vuelve a validar "Repetir contraseña".
    this.suscripcionContrasena = this.formulario.controls.contrasena.valueChanges.subscribe(() =>
      this.formulario.controls.repetirContrasena.updateValueAndValidity(),
    );
  }

  registrar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.suscripcion = this.auth.registrar(this.formulario.value as ICrearUsuario).subscribe({
      next: (sesion) => {
        this.router.navigateByUrl('/publicaciones');
        this.modal.exito('Cuenta creada', `Listo, ${sesion.usuario.nombre}: ya sos parte del campamento.`);
      },
      error: (error) => {
        this.enviando.set(false);
        this.modal.errorHttp(error, 'No pudimos crear tu cuenta');
      },
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
    this.suscripcionContrasena.unsubscribe();
  }
}
