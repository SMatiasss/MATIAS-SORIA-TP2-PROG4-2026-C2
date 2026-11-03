import { Routes } from '@angular/router';

const authRoutes: Routes = [
  // En /auth no se abre ningún formulario: queda solo la escena con la carpa.
  { path: '', title: 'Inicio · YuruCamp', children: [] },
  {
    path: 'login',
    title: 'Acampar · YuruCamp',
    loadComponent: () => import('./login/login').then((m) => m.Login),
  },
  {
    path: 'registro',
    title: 'Sumarme al campamento · YuruCamp',
    loadComponent: () => import('./registro/registro').then((m) => m.Registro),
  },
];

export default authRoutes;
