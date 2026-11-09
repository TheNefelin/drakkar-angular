import { Routes } from '@angular/router';
import { MainLayout } from '@layouts/main-layout/main-layout';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout, 
    children: [
      {
        path: '',
        loadChildren: () => import('@features/home/home.routes').then(m => m.ROUTES),
      },
      {
        path: 'cotizacion',
        loadChildren: () => import('@features/cotizacion/cotizacion.routes').then(m => m.ROUTES),
      },
    ],
  }, 
];
