import {Component, inject, OnInit} from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonFooter, IonToolbar, IonButton, IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone:true,
  imports: [
    IonFooter,
    IonToolbar,
    IonButton,
    IonIcon,
    RouterModule
  ],
})
export class FooterComponent  implements OnInit {
  ngOnInit(): void {
  }



}
