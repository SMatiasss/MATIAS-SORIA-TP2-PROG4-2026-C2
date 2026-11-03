import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const logueadoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  if (auth.usuario() !== null) {
    return true;
  }

  // Sin usuario en memoria (por ejemplo, al recargar) pasa por la pantalla de carga, que valida el token.
  return router.navigateByUrl('/');
};
