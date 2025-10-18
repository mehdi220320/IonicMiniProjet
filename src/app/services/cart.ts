import {inject, Injectable} from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Product } from '../models/Product';
import {BehaviorSubject} from "rxjs";
@Injectable({
  providedIn: 'root'
})
export class Cart {
  private CART_KEY = 'cart_items';
  private cart: Product[] = [];
  private storage= inject(Storage)
  private cartCount$ = new BehaviorSubject<number>(0);
  constructor() {
    this.init();
  }
  async init() {
    await this.storage.create();
    const saved = await this.storage.get(this.CART_KEY);
    this.cart = saved || [];
    this.cartCount$.next(this.cart.length);
  }

  getCartCount$() {
    return this.cartCount$.asObservable();
  }

  async getCart() {
    return this.cart;
  }

  async addToCart(product: Product) {
    const exists = this.cart.find(p => p.id === product.id);
    if (!exists) {
      this.cart.push(product);
      await this.storage.set(this.CART_KEY, this.cart);
      this.cartCount$.next(this.cart.length);
    }
  }

  async removeFromCart(id: string) {
    this.cart = this.cart.filter(p => p.id !== id);
    await this.storage.set(this.CART_KEY, this.cart);
    this.cartCount$.next(this.cart.length);
  }

  async clearCart() {
    this.cart = [];
    await this.storage.set(this.CART_KEY, this.cart);
    this.cartCount$.next(0);
  }
}
