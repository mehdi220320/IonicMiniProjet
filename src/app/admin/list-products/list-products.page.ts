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
  IonSelect,
  IonSelectOption,
  AlertController,
  IonCardHeader,
  IonCardTitle,
  IonMenuButton,
  IonButtons,
  ActionSheetController, IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  createOutline,
  trashOutline,
  eyeOutline,
  closeOutline,
  saveOutline,
  cameraOutline,
  imagesOutline,
  imageOutline
} from 'ionicons/icons';
import { ProductService } from '../../services/productService';
import { CategoryService } from '../../services/category-service';
import { Product } from '../../models/Product';
import { Category } from '../../models/Category';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { FooterComponent } from '../footer/footer.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Filesystem } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

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
    IonSelect,
    IonSelectOption,
    MenuComponent,
    FooterComponent,
    IonBadge
  ]
})
export class ListProductsPage implements OnInit {
  productService = inject(ProductService);
  categoryService = inject(CategoryService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private actionSheetController = inject(ActionSheetController);

  products$!: Observable<Product[]>;
  filteredProducts$!: Observable<Product[]>;
  paginatedProducts$!: Observable<Product[]>;
  categories: Category[] = [];

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalPages: number = 1;

  expandedProductId: string | null = null;
  editingProduct: Partial<Product> = {};
  isUploadingImage: boolean = false;

  constructor() {
    addIcons({
      add,
      createOutline,
      trashOutline,
      eyeOutline,
      closeOutline,
      saveOutline,
      cameraOutline,
      imagesOutline,
      imageOutline
    });
  }

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  loadProducts(): void {
    this.products$ = this.productService.getAllProducts();
    this.filteredProducts$ = this.products$;
    this.updatePagination();
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.showToast('Error loading categories', 'danger');
      }
    });
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
            p.category?.name?.toLowerCase().includes(this.searchTerm)
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

  async presentImageOptions(): Promise<void> {
    const actionSheet = await this.actionSheetController.create({
      header: 'Update Product Image',
      buttons: [
        {
          text: 'Take Photo',
          icon: 'camera-outline',
          handler: () => {
            this.takePicture();
          }
        },
        {
          text: 'Choose from Gallery',
          icon: 'images-outline',
          handler: () => {
            this.pickFromGallery();
          }
        },
        {
          text: 'Cancel',
          icon: 'close-outline',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  async takePicture(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (image.webPath) {
        this.editingProduct.imageUri = image.webPath;
      }
    } catch (error: any) {
      console.error('Error taking picture:', error);
      if (error.message !== 'User cancelled photos app') {
        await this.showToast('Error taking picture', 'danger');
      }
    }
  }

  async pickFromGallery(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });

      if (image.webPath) {
        this.editingProduct.imageUri = image.webPath;
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      if (error.message !== 'User cancelled photos app') {
        await this.showToast('Error picking image', 'danger');
      }
    }
  }

  private async uploadToCloudinary(fileUri: string): Promise<string> {
    try {
      let blob: Blob;

      if (Capacitor.isNativePlatform() && fileUri.startsWith('file://')) {
        const base64Data = await this.readFileAsBase64(fileUri);
        blob = this.base64ToBlob(base64Data, 'image/jpeg');
      } else if (fileUri.startsWith('blob:') || fileUri.startsWith('http')) {
        const response = await fetch(fileUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        blob = await response.blob();
      } else {
        throw new Error(`Unsupported URI format: ${fileUri}`);
      }

      if (!blob || blob.size === 0) {
        throw new Error('Invalid or empty image file');
      }

      const formData = new FormData();
      formData.append('file', blob, 'image.jpg');
      formData.append('upload_preset', 'ionic_unsigned');

      const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dqqegvzt4/image/upload';

      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Cloudinary error response:', errorText);
        throw new Error(`Cloudinary upload failed: ${uploadResponse.status}`);
      }

      const data = await uploadResponse.json();

      if (data.secure_url) {
        return data.secure_url;
      } else if (data.url) {
        return data.url;
      } else {
        throw new Error('No URL returned from Cloudinary');
      }
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  private async readFileAsBase64(fileUri: string): Promise<string> {
    try {
      const path = fileUri.replace('file://', '');
      const result = await Filesystem.readFile({ path: path });
      return result.data as string;
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read image file');
    }
  }

  private base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }

  async saveEdit(productId: string): Promise<void> {
    if (!productId) return;

    try {
      this.isUploadingImage = true;

      let imageUrl = this.editingProduct.imageUri!;

      // Only upload if image was changed (doesn't start with http)
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = await this.uploadToCloudinary(imageUrl);
      }

      const updateData: Partial<Product> = {
        name: this.editingProduct.name,
        description: this.editingProduct.description,
        price: this.editingProduct.price,
        imageUri: imageUrl,
        category: this.editingProduct.category
      };

      await this.productService.updateProduct(productId, updateData).toPromise();

      this.expandedProductId = null;
      this.editingProduct = {};
      this.isUploadingImage = false;

      const alert = await this.alertController.create({
        header: 'Success',
        message: 'Product updated successfully!',
        buttons: ['OK']
      });
      await alert.present();

      // Reload products to show updated data
      this.loadProducts();
    } catch (error) {
      this.isUploadingImage = false;
      console.error('Error updating product:', error);
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

  onCategoryChange(event: any): void {
    const categoryId = event.detail.value;
    const selectedCategory = this.categories.find(c => c.id === categoryId);
    if (selectedCategory) {
      this.editingProduct.category = selectedCategory;
    }
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

      // Reload products
      this.loadProducts();
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

  private async showToast(message: string, color: string = 'primary'): Promise<void> {
    const alert = await this.alertController.create({
      message,
      buttons: ['OK']
    });
    await alert.present();
  }
}
