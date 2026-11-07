import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Va después de logueadoGuard: para entonces el usuario ya está en memoria.
export const adminGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  if (auth.usuario()?.perfil === 'administrador') {
    return true;
  }

  return router.navigateByUrl('/publicaciones');
};
