import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

// Con la sesión abierta no tiene sentido volver al inicio, al login ni al registro (por ejemplo, con "Atrás").
export const noLogueadoGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const auth = inject(Auth);

  if (auth.usuario() === null) {
    return true;
  }

  return router.navigateByUrl('/publicaciones');
};
