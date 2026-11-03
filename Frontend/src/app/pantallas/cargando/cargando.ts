import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Auth } from '../../services/auth';
import { Modal } from '../../services/modal';

@Component({
  imports: [],
  selector: 'app-cargando',
  styleUrl: './cargando.css',
  templateUrl: './cargando.html',
})
export class Cargando {
  auth = inject(Auth);
  router = inject(Router);
  modal = inject(Modal);

  suscripcion?: Subscription;

  ngOnInit() {
    // Sin token no hay nada que validar: va directo al login, sin mostrar un error.
    if (!localStorage.getItem('token')) {
      this.router.navigateByUrl('/auth/login');
      return;
    }

    this.suscripcion = this.auth.autorizar().subscribe({
      next: () => this.router.navigateByUrl('/publicaciones'),
      error: (error) => {
        this.router.navigateByUrl('/auth/login');
        this.modal.errorHttp(error, 'Tu sesión terminó');
      },
    });
  }

  ngOnDestroy() {
    this.suscripcion?.unsubscribe();
  }
}
