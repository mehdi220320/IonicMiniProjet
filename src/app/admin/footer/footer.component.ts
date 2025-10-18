import {Component, inject, OnInit} from '@angular/core';
import {Router} from '@angular/router';
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
    IonIcon
  ],
})
export class FooterComponent  implements OnInit {
  currentPage='/admin';
  router=inject(Router)
  ngOnInit(): void {
    this.currentPage=this.router.url
  }



}
