import {Component, inject} from '@angular/core';
import {AuthService} from "../services/auth-service";
import {Router, RouterLink} from "@angular/router";
import {User, UserRole} from "../models/User";
import {ProductService} from "../services/productService";
import {Product} from "../models/Product";
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonButton, IonBadge, IonSearchbar, IonChip, IonIcon, IonLabel, IonCard,
  IonCardContent, IonSpinner, IonMenu, IonAvatar, IonItem, IonList, IonMenuToggle
} from '@ionic/angular/standalone';
import {FormsModule} from "@angular/forms";
import {Cart} from "../services/cart";
import {AsyncPipe, DecimalPipe} from "@angular/common";
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
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
    IonSearchbar,
    IonChip,
    IonIcon,
    IonLabel,
    IonCard,
    IonCardContent,
    IonSpinner,
    IonAvatar,
    IonList,
    IonItem,
    RouterLink,
    AsyncPipe,
    DecimalPipe

  ]
})
export class HomePage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private productService = inject(ProductService);
  private cartService = inject(Cart);

  cartCount = 0;
  user: User | null = null;
  searchQuery: string = '';
  products: Product[] = [];
  cartCount$ = this.cartService.getCartCount$();
  ngOnInit() {
    this.loadUserData();
    this.loadProducts();
   }
  ionViewWillEnter() {
    this.cartCount$ = this.cartService.getCartCount$();
  }
  async loadUserData() {
    try {
      this.user = await this.authService.getCurrentUser();
    } catch (e) {
      console.log('Error loading user data:', e);

    }
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Products loaded:', this.products);
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (e) {
      console.log('Logout error:', e);
    }
  }

  goToDetail(productId: string) {
    console.log('Navigating to product:', productId);
    this.router.navigate(['/product', productId]);
  }


  async addToCart(product: Product) {
    await this.cartService.addToCart(product);
  }
}
