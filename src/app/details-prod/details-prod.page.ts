import {Component, inject, OnInit} from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonChip,
  IonLabel
} from '@ionic/angular/standalone';
import {ActivatedRoute} from "@angular/router";
import {ProductService} from "../services/productService";
import {Product} from "../models/Product";
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
    IonBackButton,
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

  product: Product | undefined;

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
}
