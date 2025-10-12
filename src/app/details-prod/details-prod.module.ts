import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetailsProdPageRoutingModule } from './details-prod-routing.module';

import { DetailsProdPage } from './details-prod.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetailsProdPageRoutingModule,
    DetailsProdPage
  ],
  declarations: []
})
export class DetailsProdPageModule {}
