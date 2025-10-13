import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetailsProdPage } from './details-prod.page';

const routes: Routes = [
  {
    path: '',
    component: DetailsProdPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetailsProdPageRoutingModule {}
