import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { Modal } from '../../services/modal';
import { Campo } from '../../componentes/campo/campo';
import { contrasenaSegura } from '../../validators/validadores';
import { ILogin } from '../../interfaces/Usuario';
import { Subscription } from 'rxjs';

@Component({
  imports: [ReactiveFormsModule, RouterLink, Campo],
  selector: 'app-login',
  templateUrl: './login.html',
  host: { class: 'panel' },
})
export class Login {
  formBuilder = inject(FormBuilder);
  auth = inject(Auth);
  router = inject(Router);
  modal = inject(Modal);

  enviando = signal(false);
  suscripcion?: Subscription;

  formulario = this.formBuilder.group({
    usuario: ['', [Validators.required]],
    contrasena: ['', [Validators.required, Validators.minLength(8), contrasenaSegura]],
  });

  entrar() {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.enviando.set(true);
    this.suscripcion = this.auth.loguear(this.formulario.value as ILogin).subscribe({
      next: () => this.router.navigateByUrl('/publicaciones'),
      error: (error) => {
        this.enviando.set(false);
        this.modal.errorHttp(error, 'No pudimos iniciar sesión');
      },
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }
}
