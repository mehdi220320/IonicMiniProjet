import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonIcon,
   NavController, IonButtons
} from '@ionic/angular/standalone';
import { Cart }  from  '../services/cart' ;
import { Product } from '../models/Product';
import {OrderService} from "../services/order-service";
import {AuthService} from "../services/auth-service";

@Component({
  selector: 'app-cart',
  standalone: true,
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    IonButton,
    IonIcon,
    IonButtons
  ]
})
export class CartPage implements OnInit {
  private cartService = inject(Cart);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private navCtrl = inject(NavController);

  cartItems: Product[] = [];
  total = 0;

  async ngOnInit() {
    await this.loadCart();
  }

  async loadCart() {
    this.cartItems = await this.cartService.getCart();
    this.calculateTotal();
  }
  goBack() {
    this.navCtrl.back();
  }
  calculateTotal() {
    this.total = this.cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
  }

  async removeItem(id: string) {
    await this.cartService.removeFromCart(id);
    await this.loadCart();
  }

  async confirmOrder() {
    const user = await this.authService.getCurrentUser();
    const userId = user ? user.id : 'guest';

    await this.orderService.createOrder(userId, this.cartItems, this.total);
    console.log(' save order');

    await this.cartService.clearCart();
    this.cartItems = [];
    this.total = 0;
  }
}
