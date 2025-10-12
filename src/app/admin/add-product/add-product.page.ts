import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {NgForm} from "@angular/forms";
import {ProductService} from "../../services/productService";
import {CategoryService} from "../../services/category-service";
import {AuthService} from "../../services/auth-service";
import {AlertController, MenuController, ToastController} from "@ionic/angular";
import {Router} from "@angular/router";
import {User, UserRole} from "../../models/User";
import {Product} from "../../models/Product";
import {Category} from "../../models/Category";
import {Camera, CameraResultType, CameraSource} from "@capacitor/camera";

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.page.html',
  styleUrls: ['./add-product.page.scss'],
  standalone:false
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
  //  this.loadAdminData();
    this.loadCategories();
    this.loadProducts();
   // this.checkAdminRole();
  }

  ionViewWillEnter() {
  //  this.loadAdminData();
    this.loadCategories();
    this.loadProducts();
  }

  /**
   * Load admin user data
   */
  loadAdminData() {
    this.authService.getCurrentUser().then(user => {
      this.admin = user;
      if (!this.admin) {
        this.showToast('Please login to access admin panel', 'warning');
        this.router.navigate(['/login']);
      }
    }).catch(error => {
      console.error('Error loading admin data:', error);
      this.showToast('Error loading user data', 'danger');
    });
  }

  /**
   * Check if user has admin role
   */
  checkAdminRole() {
    this.authService.getCurrentUserRole().then(role => {
      if (role !== UserRole.ADMIN) {
        this.showAlert(
          'Access Denied',
          'You do not have permission to access this page.',
          () => this.router.navigate(['/home'])
        );
      }
    });
  }

  /**
   * Load all categories
   */
  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showToast('Error loading categories', 'danger');
      }
    });
  }

  /**
   * Load all products
   */
  loadProducts() {
    this.productService.getAllProducts().subscribe({
      next: (products) => {
        this.products = products.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.showToast('Error loading products', 'danger');
      }
    });
  }

  /**
   * Take picture with camera
   */
  takePicture() {
    Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera
    }).then(image => {
      this.product.imageUri = image.webPath || '';
    }).catch(error => {
      console.error('Error taking picture:', error);
      if (error.message !== 'User cancelled photos app') {
        this.showToast('Error taking picture', 'danger');
      }
    });
  }

  /**
   * Pick image from gallery
   */
  pickFromGallery() {
    Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Photos
    }).then(image => {
      this.product.imageUri = image.webPath || '';
    }).catch(error => {
      console.error('Error picking image:', error);
      if (error.message !== 'User cancelled photos app') {
        this.showToast('Error picking image', 'danger');
      }
    });
  }

  /**
   * Remove selected image
   */
  removeImage() {
    this.product.imageUri = '';
  }

  /**
   * Handle category change
   */
  onCategoryChange() {
    const selectedCategory = this.categories.find(cat => cat.id === this.selectedCategoryId);
    if (selectedCategory) {
      this.product.category = selectedCategory;
    }
  }

  /**
   * Submit form to create or update product
   */
  onSubmit() {
    if (!this.validateForm()) {
      this.showToast('Please fill all required fields', 'warning');
      return;
    }

    this.isSubmitting = true;

    if (this.editingProductId) {
      this.updateExistingProduct();
    } else {
      this.createNewProduct();
    }
  }

  /**
   * Validate form
   */
  private validateForm(): boolean {
    return !!(
      this.product.name &&
      this.product.description &&
      this.product.imageUri &&
      this.product.price &&
      this.product.price > 0 &&
      this.product.category
    );
  }

  /**
   * Create new product
   */
  private createNewProduct() {
    const newProduct: Product = {
      name: this.product.name!,
      description: this.product.description!,
      price: this.product.price!,
      imageUri: this.product.imageUri!,
      category: this.product.category!,
      createdAt: new Date()
    };

    this.productService.addProduct(newProduct).subscribe({
      next: () => {
        this.showToast('Product created successfully!', 'success');
        this.resetForm();
        this.loadProducts();
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error creating product:', error);
        this.showToast('Failed to create product', 'danger');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Update existing product
   */
  private updateExistingProduct() {
    if (!this.editingProductId) return;

    const updateData: Partial<Product> = {
      name: this.product.name!,
      description: this.product.description!,
      price: this.product.price!,
      imageUri: this.product.imageUri!,
      category: this.product.category!
    };

    this.productService.updateProduct(this.editingProductId, updateData).subscribe({
      next: () => {
        this.showToast('Product updated successfully!', 'success');
        this.resetForm();
        this.loadProducts();
        this.editingProductId = null;
        this.isSubmitting = false;
      },
      error: (error) => {
        console.error('Error updating product:', error);
        this.showToast('Failed to update product', 'danger');
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Edit product
   */
  editProduct(prod: Product) {
    this.editingProductId = prod.id || null;
    this.product = {
      name: prod.name,
      description: prod.description,
      price: prod.price,
      imageUri: prod.imageUri,
      category: prod.category
    };
    this.selectedCategoryId = prod.category.id || '';

    // Scroll to top
    const content = document.querySelector('ion-content');
    if (content) {
      content.scrollToTop(500);
    }

    this.showToast('Editing product', 'primary');
  }

  /**
   * Delete product with confirmation
   */
  deleteProduct(prod: Product) {
    this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${prod.name}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Delete',
          cssClass: 'danger',
          handler: () => {
            this.performDelete(prod);
          }
        }
      ]
    }).then(alert => alert.present());
  }

  /**
   * Perform product deletion
   */
  private performDelete(prod: Product) {
    if (!prod.id) {
      this.showToast('Invalid product ID', 'danger');
      return;
    }

    this.productService.deleteProduct(prod.id).subscribe({
      next: () => {
        this.showToast('Product deleted successfully', 'success');
        this.loadProducts();

        if (this.editingProductId === prod.id) {
          this.resetForm();
        }
      },
      error: (error) => {
        console.error('Error deleting product:', error);
        this.showToast('Failed to delete product', 'danger');
      }
    });
  }

  /**
   * Reset form to initial state
   */
  resetForm() {
    this.product = {
      name: '',
      description: '',
      price: 0,
      imageUri: '',
      category: undefined
    };
    this.selectedCategoryId = '';
    this.editingProductId = null;

    if (this.productForm) {
      this.productForm.resetForm();
    }
  }

  /**
   * Navigate to different pages
   */
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

  /**
   * Logout with confirmation
   */
  logout() {
    this.alertController.create({
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
          handler: () => {
            this.authService.logout().then(() => {
              this.showToast('Logged out successfully', 'success');
              this.router.navigate(['/login']);
            }).catch(error => {
              console.error('Logout error:', error);
              this.showToast('Error logging out', 'danger');
            });
          }
        }
      ]
    }).then(alert => alert.present());
  }

  /**
   * Show toast notification
   */
  private showToast(message: string, color: string = 'primary') {
    this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    }).then(toast => toast.present());
  }

  /**
   * Show alert dialog
   */
  private showAlert(header: string, message: string, onConfirm?: () => void) {
    this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            if (onConfirm) {
              onConfirm();
            }
          }
        }
      ]
    }).then(alert => alert.present());
  }

}
