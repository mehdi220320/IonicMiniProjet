import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AdminPageRoutingModule } from './admin-routing.module';

import { AdminPage } from './admin.page';
import { MenuComponent } from './menu/menu.component';
import { FooterComponent } from './footer/footer.component';
import { ListProductsPage } from './list-products/list-products.page';
import { ListCategoriesPage } from './list-categories/list-categories.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AdminPageRoutingModule,
    MenuComponent,
    FooterComponent,
    ListProductsPage,
    ListCategoriesPage,
  ],
  declarations: [
    AdminPage
  ]
})
export class AdminPageModule {}
