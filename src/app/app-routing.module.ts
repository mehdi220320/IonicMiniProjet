import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import {AuthGuard} from "./guards/auth-guard";

const routes: Routes = [

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'signup',

    loadChildren: () => import('./signup/signup.module').then( m => m.SignupPageModule)
  },
  {
    path: 'admin',
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    loadChildren: () => import('./admin/admin.module').then( m => m.AdminPageModule)
  },
  {
    path: 'details-prod',
    canActivate: [AuthGuard],

    loadChildren: () => import('./details-prod/details-prod.module').then( m => m.DetailsProdPageModule)
  },
  {
    path: 'product/:id',
    canActivate: [AuthGuard],

    loadChildren: () =>
      import('./details-prod/details-prod.module').then(m => m.DetailsProdPageModule)
  },
  {
    path: 'unauthorized',
    loadChildren: () => import('./unauthorized/unauthorized.module').then( m => m.UnauthorizedPageModule)
  },
  {
    path: 'cart',
    canActivate: [AuthGuard],
    loadChildren: () => import('./cart/cart.module').then(m => m.CartPageModule)
  },
  {
    path: 'tabs',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./tabs/tabs.page').then(m => m.TabsPage),
    children: [
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./home/home.page').then(m => m.HomePage)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./orders/orders.page').then(m => m.OrdersPage)
      }
    ]
  }



];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
