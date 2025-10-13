import { Component, OnInit } from '@angular/core';
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
export class UnauthorizedPage implements OnInit {
  constructor(private router: Router) {
    addIcons({ lockClosedOutline, arrowBackOutline, homeOutline });
  }

  goBack() {
    this.router.navigate(['/home']);
  }

  goToHome() {
    this.router.navigate(['/login']);
  }

  ngOnInit(): void {
  }

}
