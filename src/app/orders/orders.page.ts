import {Component, inject} from '@angular/core';
import {AuthService} from "../services/auth-service";
import {OrderService} from "../services/order-service";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonIcon,
  IonBadge,
  IonButton,
  IonMenuButton,
  IonMenu,
  IonMenuToggle,
  IonLabel,
  IonItem,
  IonAvatar,
  IonList,

} from '@ionic/angular/standalone';
import {AsyncPipe, DatePipe, DecimalPipe} from "@angular/common";
import {catchError, of} from "rxjs";
import {addIcons} from 'ionicons';

import {
  receiptOutline,
  documentTextOutline,
  calendarOutline,
  timeOutline,
  cubeOutline,
  eyeOutline
} from 'ionicons/icons';
import {Cart} from "../services/cart";
import {Router, RouterLink} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {User} from "../models/User";
@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  imports: [
    FormsModule,

    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonMenu,
    IonMenuToggle,
    IonButton,
    IonBadge,
    IonIcon,
    IonLabel,

    IonAvatar,
    IonList,
    IonItem,
    RouterLink,
    AsyncPipe,
    DatePipe

  ]
})
export class OrdersPage {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private cartService = inject(Cart);
  private router = inject(Router);
  user: User | null = null;

  cartCount$ = this.cartService.getCartCount$();
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
    this.user = await this.authService.getCurrentUser();

    if (!this.user) return;

    const uid = (this.user.id ?? this.user.id) as string;


    this.orderService
      .getOrdersById(uid)
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

  ionViewWillEnter() {
    this.cartCount$ = this.cartService.getCartCount$();
  }
  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
