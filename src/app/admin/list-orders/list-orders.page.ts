import {Component, inject, OnInit} from '@angular/core';
import {OrderService} from "../../services/order-service";
import {catchError, of} from "rxjs";
import {MenuComponent} from "../menu/menu.component";
import {FooterComponent} from "../footer/footer.component";
import {
  IonButtons,
  IonButton,
  IonContent,
  IonHeader, IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonTitle,
  IonToolbar, IonBadge
} from "@ionic/angular/standalone";
import {DatePipe} from "@angular/common";
import {addIcons} from "ionicons";
import {
  calendarOutline,
  cubeOutline,
  documentTextOutline,
  eyeOutline,
  receiptOutline,
  timeOutline
} from "ionicons/icons";

@Component({
  selector: 'app-list-orders',
  templateUrl: './list-orders.page.html',
  styleUrls: ['./list-orders.page.scss'],
  standalone:true,
  imports:[
    MenuComponent,
    FooterComponent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    DatePipe,
    IonMenuButton,
    IonIcon,
    IonButtons,
    IonBadge,
    IonButton
  ]
})
export class ListOrdersPage implements OnInit {
  private orderService = inject(OrderService);
  orders: any[] = [];
  constructor() {
    addIcons({
      'receipt-outline': receiptOutline,
      'document-text-outline': documentTextOutline,
      'calendar-outline': calendarOutline,
      'time-outline': timeOutline,
      'cube-outline': cubeOutline,
      'eye-outline': eyeOutline
    });
  }
  async ngOnInit() {

    this.orderService
      .getOrders()
      .pipe(
        catchError(err => {
          console.error('[OrdersPage] getOrders error:', err);
          return of([] as any[]);
        })
      )
      .subscribe((orders) => {
        console.log('[OrdersPage] orders received:', orders?.length ?? 0);
        this.orders = orders ?? [];
      });
  }

}
