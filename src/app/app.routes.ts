import { Routes } from '@angular/router';
import { MainLayoutComponent } from '@layouts/main-layout-component/main-layout-component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent, 
    children: [
      {
        path: '',
        loadChildren: () => import('@features/home/home.routes').then(m => m.ROUTES),
      },
      {
        path: 'cotizacion',
        loadChildren: () => import('@features/quote/quote.routes').then(m => m.ROUTES),
      },
    ],
  }, 
];
