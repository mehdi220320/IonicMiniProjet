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
import {CategoryService} from "../services/category-service";
import {Category} from "../models/Category";
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
  private categoryService = inject(CategoryService);

  user: User | null = null;
  products: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  cartCount$ = this.cartService.getCartCount$();

  searchQuery = '';
  selectedCategory: string | null = null;

  ngOnInit() {
    this.loadUserData();
    this.loadProducts();
    this.loadCategories();
  }

  ionViewWillEnter() {
    this.cartCount$ = this.cartService.getCartCount$();
  }

  async loadUserData() {
    this.user = await this.authService.getCurrentUser();
  }

  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (data) => {
        this.products = data;
        this.applyFilters();
      },
      error: (err) => console.error('Error loading products', err)
    });
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (cats) => (this.categories = cats),
      error: (err) => console.error(err),
    });
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value.toLowerCase();
    this.applyFilters();
  }

  selectCategory(category: Category) {
    this.selectedCategory =
      this.selectedCategory === category.name ? null : category.name;
    this.applyFilters();
  }

  applyFilters() {
    this.filteredProducts = this.products.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchQuery);
      const matchesCategory = this.selectedCategory
        ? p.category?.name === this.selectedCategory
        : true;
      return matchesSearch && matchesCategory;
    });
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  goToDetail(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  async addToCart(product: Product) {
    await this.cartService.addToCart(product);
  }
}
