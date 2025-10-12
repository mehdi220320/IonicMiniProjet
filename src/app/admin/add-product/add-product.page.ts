import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NgForm } from "@angular/forms";
import { ProductService } from "../../services/productService";
import { CategoryService } from "../../services/category-service";
import { AuthService } from "../../services/auth-service";
import { AlertController, MenuController, ToastController } from "@ionic/angular";
import { Router } from "@angular/router";
import { User, UserRole } from "../../models/User";
import { Product } from "../../models/Product";
import { Category } from "../../models/Category";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
  standalone: false
})
export class AddProductPage implements OnInit {

  @ViewChild('productForm') productForm!: NgForm;

  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  admin: User | null = null;
  currentPage: string = 'add-product';
  isSubmitting: boolean = false;
  products: Product[] = [];
  categories: Category[] = [];
  selectedCategoryId: string = '';
  editingProductId: string | null = null;

  product: Partial<Product> = {
    name: '',
    description: '',
    price: 0,
    imageUri: '',
    category: undefined
  };

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  ionViewWillEnter() {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => this.showToast('Error loading categories', 'danger')
    });
  }


  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => this.products = products.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      }),
      error: (err) => this.showToast('Error loading products', 'danger')
    });
  }


  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      this.product.imageUri = image.webPath || '';
    } catch (error: any) {
      console.error('Error taking picture:', error);
      if (error.message !== 'User cancelled photos app') {
        this.showToast('Error taking picture', 'danger');
      }
    }
  }

  async pickFromGallery() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos
      });
      this.product.imageUri = image.webPath || '';
    } catch (error: any) {
      console.error('Error picking image:', error);
      if (error.message !== 'User cancelled photos app') {
        this.showToast('Error picking image', 'danger');
      }
    }
  }

  private async uploadToCloudinary(fileUri: string): Promise<string> {
    try {
      let blob: Blob;

      // Handle different URI types based on platform
      if (Capacitor.isNativePlatform() && fileUri.startsWith('file://')) {
        // For native mobile (iOS/Android) - convert file:// to blob
        const base64Data = await this.readFileAsBase64(fileUri);
        blob = this.base64ToBlob(base64Data, 'image/jpeg');
      } else if (fileUri.startsWith('blob:') || fileUri.startsWith('http')) {
        // For web or already accessible URIs
        const response = await fetch(fileUri);
        if (!response.ok) {
          throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        blob = await response.blob();
      } else {
        throw new Error(`Unsupported URI format: ${fileUri}`);
      }

      // Verify blob
      if (!blob || blob.size === 0) {
        throw new Error('Invalid or empty image file');
      }

      console.log('Blob created:', { size: blob.size, type: blob.type });

      // Create FormData
      const formData = new FormData();
      formData.append('file', blob, 'image.jpg'); // Add filename
      // Replace with your actual upload preset name from Cloudinary dashboard
      // To find it: Cloudinary Console → Settings → Upload → Upload presets
      formData.append('upload_preset', 'ionic_unsigned');

      // Optional: Add more parameters
      // formData.append('folder', 'products');
      // formData.append('public_id', `product_${Date.now()}`);
      // formData.append('tags', 'product,ionic');

      const cloudinaryUrl = 'https://api.cloudinary.com/v1_1/dqqegvzt4/image/upload';

      console.log('Uploading to Cloudinary...');

      const uploadResponse = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary
      });

      console.log('Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('Cloudinary error response:', errorText);
        throw new Error(`Cloudinary upload failed: ${uploadResponse.status} - ${errorText}`);
      }

      const data = await uploadResponse.json();
      console.log('Cloudinary response:', data);

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

  /**
   * Helper: Read file as base64 for native platforms
   */
  private async readFileAsBase64(fileUri: string): Promise<string> {
    try {
      // Remove file:// prefix if present
      const path = fileUri.replace('file://', '');

      const result = await Filesystem.readFile({
        path: path
      });

      return result.data as string;
    } catch (error) {
      console.error('Error reading file:', error);
      throw new Error('Failed to read image file');
    }
  }

  /**
   * Helper: Convert base64 to Blob
   */
  private base64ToBlob(base64: string, mimeType: string = 'image/jpeg'): Blob {
    // Remove data URL prefix if present
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;

    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
  /**
   * Submit form
   */
  async onSubmit() {
    if (!this.validateForm()) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    this.isSubmitting = true;
    if (this.editingProductId) {
      await this.updateExistingProduct();
    } else {
      await this.createNewProduct();
    }
    this.isSubmitting = false;
  }

  private validateForm(): boolean {
    return !!(
      this.product.name &&
      this.product.description &&
      this.product.imageUri &&
      this.product.price && this.product.price > 0 &&
      this.product.category
    );
  }

  private async createNewProduct() {
    try {
      const imageUrl = await this.uploadToCloudinary(this.product.imageUri!);

      const newProduct: Product = {
        name: this.product.name!,
        description: this.product.description!,
        price: this.product.price!,
        imageUri: imageUrl,
        category: this.product.category!,
        createdAt: new Date()
      };

      this.productService.addProduct(newProduct).subscribe({
        next: () => {
          this.showToast('Product created successfully!', 'success');
          this.resetForm();
          this.loadProducts();
        },
        error: (err) => this.showToast('Failed to create product', 'danger')
      });
    } catch (err) {
      this.showToast('Failed to upload image', 'danger');
    }
  }

  private async updateExistingProduct() {
    if (!this.editingProductId) return;

    try {
      let imageUrl = this.product.imageUri!;
      if (!imageUrl.startsWith('http')) {
        imageUrl = await this.uploadToCloudinary(imageUrl);
      }

      const updateData: Partial<Product> = {
        name: this.product.name!,
        description: this.product.description!,
        price: this.product.price!,
        imageUri: imageUrl,
        category: this.product.category!
      };

      this.productService.updateProduct(this.editingProductId, updateData).subscribe({
        next: () => {
          this.showToast('Product updated successfully!', 'success');
          this.resetForm();
          this.loadProducts();
          this.editingProductId = null;
        },
        error: (err) => this.showToast('Failed to update product', 'danger')
      });
    } catch (err) {
      this.showToast('Failed to upload image', 'danger');
    }
  }

  /**
   * Remove image
   */
  removeImage() {
    this.product.imageUri = '';
  }

  /**
   * Handle category selection
   */
  onCategoryChange() {
    const selected = this.categories.find(c => c.id === this.selectedCategoryId);
    if (selected) this.product.category = selected;
  }

  /**
   * Edit product
   */
  editProduct(prod: Product) {
    this.editingProductId = prod.id || null;
    this.product = { ...prod };
    this.selectedCategoryId = prod.category?.id || '';
    const content = document.querySelector('ion-content');
    if (content) content.scrollToTop(500);
    this.showToast('Editing product', 'primary');
  }

  /**
   * Delete product
   */
  deleteProduct(prod: Product) {
    this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${prod.name}"?`,
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
        {
          text: 'Delete', cssClass: 'danger', handler: () => this.performDelete(prod)
        }
      ]
    }).then(alert => alert.present());
  }

  private performDelete(prod: Product) {
    if (!prod.id) return this.showToast('Invalid product ID', 'danger');

    this.productService.deleteProduct(prod.id).subscribe({
      next: () => {
        this.showToast('Product deleted successfully', 'success');
        this.loadProducts();
        if (this.editingProductId === prod.id) this.resetForm();
      },
      error: (err) => this.showToast('Failed to delete product', 'danger')
    });
  }

  /**
   * Reset form
   */
  resetForm() {
    this.product = { name: '', description: '', price: 0, imageUri: '', category: undefined };
    this.selectedCategoryId = '';
    this.editingProductId = null;
    if (this.productForm) this.productForm.resetForm();
  }

  /**
   * Toast helper
   */
  private showToast(message: string, color: string = 'primary') {
    this.toastController.create({ message, duration: 2000, position: 'bottom', color })
      .then(toast => toast.present());
  }
  navigateTo(page: string) {
    this.currentPage = page;
    this.menuCtrl.close();

    switch (page) {
      case 'dashboard':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'products':
        this.router.navigate(['/admin/products']);
        break;
      case 'add-product':
        // Already on add-product page
        break;
      case 'categories':
        this.router.navigate(['/admin/categories']);
        break;
      case 'add-category':
        this.router.navigate(['/admin/add-category']);
        break;
      case 'users':
        this.router.navigate(['/admin/users']);
        break;
      case 'orders':
        this.router.navigate(['/admin/orders']);
        break;
      case 'settings':
        this.router.navigate(['/admin/settings']);
        break;
      default:
        break;
    }
  }
  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Logout',
          handler: async () => {
            try {
              await this.authService.logout();
              await this.showToast('Logged out successfully', 'success');
              this.router.navigate(['/login']);
            } catch (error) {
              console.error('Logout error:', error);
              await this.showToast('Error logging out', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }


}
