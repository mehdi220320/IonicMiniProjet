import {Component, inject} from '@angular/core';
import {AuthService} from "../services/auth-service";
import {Router} from "@angular/router";
import {User, UserRole} from "../models/User";
import {ProductService} from "../services/productService";
import {Product} from "../models/Product";
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonMenuButton,
  IonButton, IonBadge, IonSearchbar, IonChip, IonIcon, IonLabel, IonCard,
  IonCardContent, IonSpinner, IonMenu, IonAvatar, IonItem, IonList, IonMenuToggle
} from '@ionic/angular/standalone';
import {FormsModule} from "@angular/forms";
@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    // Angular modules
    FormsModule,

    // Ionic standalone components
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonMenuButton,
    IonButton,
    IonBadge,
    IonSearchbar,
    IonChip,
    IonIcon,
    IonLabel,
    IonCard,
    IonCardContent,
    IonSpinner,
    IonMenu,
    IonAvatar,
    IonItem,
    IonList,
    IonMenuToggle
  ]
})
export class HomePage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private productService = inject(ProductService);

  user: User | null = null;
  searchQuery: string = '';
  products: Product[] = [];

  ngOnInit() {
    this.loadUserData();
    this.loadProducts();
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
}
