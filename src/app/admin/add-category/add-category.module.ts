import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AddCategoryPageRoutingModule } from './add-category-routing.module';

import { AddCategoryPage } from './add-category.page';
import {MenuComponent} from "../menu/menu.component";
import {FooterComponent} from "../footer/footer.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AddCategoryPageRoutingModule,
    MenuComponent,
    FooterComponent
  ],
  declarations: [AddCategoryPage]
})
export class AddCategoryPageModule {}
