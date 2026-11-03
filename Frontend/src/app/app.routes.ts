import { Routes } from '@angular/router';
import { logueadoGuard } from './guards/logueado-guard';
import { noLogueadoGuard } from './guards/no-logueado-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    title: 'Cargando · YuruCamp',
    loadComponent: () => import('./pantallas/cargando/cargando').then((m) => m.Cargando),
  },
  {
    path: 'auth',
    canActivate: [noLogueadoGuard],
    loadComponent: () => import('./auth/inicio/inicio').then((m) => m.Inicio),
    loadChildren: () => import('./auth/auth.routes'),
  },
  {
    path: 'publicaciones',
    title: 'Publicaciones · YuruCamp',
    canActivate: [logueadoGuard],
    loadComponent: () => import('./pantallas/publicaciones/publicaciones').then((m) => m.Publicaciones),
  },
  {
    path: 'publicaciones/:id',
    title: 'Historia · YuruCamp',
    canActivate: [logueadoGuard],
    loadComponent: () => import('./pantallas/publicacion/publicacion').then((m) => m.Publicacion),
  },
  {
    path: 'mi-perfil',
    title: 'Mi carpa · YuruCamp',
    canActivate: [logueadoGuard],
    loadComponent: () => import('./pantallas/mi-perfil/mi-perfil').then((m) => m.MiPerfil),
  },
  { path: '**', redirectTo: '' },
];
