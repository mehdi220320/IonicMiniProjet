import {Component, inject, OnInit} from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonSpinner,
  IonChip,
  IonLabel, NavController
} from '@ionic/angular/standalone';
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../services/productService";
import {Product} from "../models/Product";
import {Cart} from "../services/cart";
import {OrderService} from "../services/order-service";
import {AuthService} from "../services/auth-service";
@Component({
  selector: 'app-details-prod',
  templateUrl: './details-prod.page.html',
  styleUrls: ['./details-prod.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonSpinner,
    IonChip,
    IonLabel
  ]
})
export class DetailsProdPage {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private authService = inject(AuthService);

  private navCtrl = inject(NavController);
  private cartService = inject(Cart);
  private orderService = inject(OrderService);
  product: any;
  userRating = 0;
  stars = [1, 2, 3, 4, 5];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.productService.getProductById(id).subscribe({
        next: (data) => {
          this.product = data;
          console.log('Loaded product:', this.product);
        },
        error: (err) => console.error('Error loading product:', err)
      });
    }
  }
  goBack() {
    this.navCtrl.back();
  }
  async addToCart(product: Product) {
    await this.cartService.addToCart(product);
    this.goBack();
  }
  async rate(star: number) {
    const user = await this.authService.getCurrentUser();
    if (!user) {
      console.log('User must be logged in to rate');
      return;
    }

    this.userRating = star;
    await this.productService.rateProduct(this.product.id!, user.id, star);
  }
}
