import { Component, OnInit } from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import {
 IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [
    RouterOutlet,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    RouterLink,
  ]
})
export class TabsPage {




}
