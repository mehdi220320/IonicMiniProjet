import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListUsersPageRoutingModule } from './list-users-routing.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListUsersPageRoutingModule,

  ],
  declarations: []
})
export class ListUsersPageModule {}
