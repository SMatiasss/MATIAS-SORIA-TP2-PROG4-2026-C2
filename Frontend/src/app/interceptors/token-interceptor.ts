import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { Auth } from '../services/auth';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(Auth);

  const clon = req.clone({
    headers: req.headers.set('Authorization', 'Bearer ' + localStorage.getItem('token')),
  });

  return next(clon).pipe(
    tap({
      // Token vencido o inválido: se cierra la sesión y se vuelve al login. El modal lo muestra quien hizo el pedido.
      error: (error) => {
        if (error.status === 401) auth.cerrarSesion('/auth/login');
      },
    }),
  );
};
