import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../services/auth-service";
import {OrderService} from "../services/order-service";
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular/standalone';
import {DatePipe} from "@angular/common";
import {catchError, of} from "rxjs";
@Component({
  selector: 'app-orders',
  templateUrl: './orders.page.html',
  styleUrls: ['./orders.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    DatePipe,
  ]
})
export class OrdersPage {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  orders: any[] = [];
  isAdmin = false;

  async ngOnInit() {
    const user = await this.authService.getCurrentUser();

    console.log('[OrdersPage] raw user from AuthService:', user);

    if (!user) return;

    const uid = (user.id ?? user.id) as string;
    const role = (user.role ?? '').toString().trim().toUpperCase();
    this.isAdmin = role === 'ADMIN';

    console.log('[OrdersPage] computed:', { uid, role, isAdmin: this.isAdmin });

    this.orderService
      .getOrders(uid, this.isAdmin)
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
