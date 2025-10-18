import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddProductPageRoutingModule } from './add-product-routing.module';

import { AddProductPage } from './add-product.page';
import {MenuComponent} from "../menu/menu.component";
import {FooterComponent} from "../footer/footer.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddProductPageRoutingModule,
    MenuComponent,
    FooterComponent
  ],
  declarations: [AddProductPage]
})
export class AddProductPageModule {}
