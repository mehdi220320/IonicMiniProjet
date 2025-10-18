import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonCardContent,
  IonCard,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  AlertController, IonCardHeader, IonCardTitle, IonMenuButton, IonButtons,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  createOutline,
  trashOutline,
  eyeOutline,
  closeOutline,
  saveOutline
} from 'ionicons/icons';
import { ProductService } from '../../services/productService';
import { Product } from '../../models/Product';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import {MenuComponent} from "../menu/menu.component";
import {FooterComponent} from "../footer/footer.component";

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.page.html',
  styleUrls: ['./list-products.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonCardContent,
    IonHeader,
    IonMenuButton,
    IonToolbar,
    IonTitle,
    IonContent,
    IonSearchbar,
    IonButton,
    IonButtons,
    IonIcon,
    IonCard,
    IonItem,
    IonLabel,
    IonInput,
    IonCardHeader,
    IonCardTitle,
    IonTextarea,
    MenuComponent,
    FooterComponent,
    FooterComponent
  ]
})
export class ListProductsPage implements OnInit {
  productService = inject(ProductService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  products$!: Observable<Product[]>;
  filteredProducts$!: Observable<Product[]>;
  paginatedProducts$!: Observable<Product[]>;

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  expandedProductId: string | null = null;
  editingProduct: Partial<Product> = {};

  constructor() {
    addIcons({
      add,
      createOutline,
      trashOutline,
      eyeOutline,
      closeOutline,
      saveOutline
    });
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.products$ = this.productService.getAllProducts();
    this.filteredProducts$ = this.products$;
    this.updatePagination();
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.currentPage = 1;

    if (this.searchTerm) {
      this.filteredProducts$ = this.products$.pipe(
        map(products =>
          products.filter(p =>
            p.name?.toLowerCase().includes(this.searchTerm) ||
            p.description?.toLowerCase().includes(this.searchTerm) ||
            p.category?.name.toLowerCase().includes(this.searchTerm)
          )
        )
      );
    } else {
      this.filteredProducts$ = this.products$;
    }

    this.updatePagination();
  }

  updatePagination(): void {
    this.paginatedProducts$ = this.filteredProducts$.pipe(
      map(products => {
        this.totalPages = Math.ceil(products.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return products.slice(startIndex, endIndex);
      })
    );
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.updatePagination();
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/admin/add-product']);
  }

  toggleEdit(product: Product): void {
    if (this.expandedProductId === product.id) {
      this.expandedProductId = null;
      this.editingProduct = {};
    } else {
      this.expandedProductId = product.id || null;
      this.editingProduct = { ...product };
    }
  }

  async saveEdit(productId: string): Promise<void> {
    if (!productId) return;

    try {
      await this.productService.updateProduct(productId, this.editingProduct).toPromise();
      this.expandedProductId = null;
      this.editingProduct = {};

      const alert = await this.alertController.create({
        header: 'Success',
        message: 'Product updated successfully!',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Failed to update product.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  cancelEdit(): void {
    this.expandedProductId = null;
    this.editingProduct = {};
  }

  async confirmDelete(productId: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: 'Are you sure you want to delete this product? This action cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteProduct(productId);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteProduct(productId: string): Promise<void> {
    try {
      await this.productService.deleteProduct(productId).toPromise();

      const alert = await this.alertController.create({
        header: 'Success',
        message: 'Product deleted successfully!',
        buttons: ['OK']
      });
      await alert.present();
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Failed to delete product.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
