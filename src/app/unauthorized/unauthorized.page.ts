import {Component, inject, OnInit} from '@angular/core';
import {arrowBackOutline, homeOutline, lockClosedOutline} from "ionicons/icons";
import {
  IonContent,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent
} from '@ionic/angular/standalone';
import {addIcons} from "ionicons";
import {Router} from "@angular/router";

@Component({
  selector: 'app-unauthorized',
  templateUrl: './unauthorized.page.html',
  styleUrls: ['./unauthorized.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    IonCard,
    IonCardContent
  ],

})
export class UnauthorizedPage  {
  private router= inject(Router)
  constructor() {
    addIcons({ lockClosedOutline, arrowBackOutline, homeOutline });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToHome() {
    this.router.navigate(['/login']);
  }


}
