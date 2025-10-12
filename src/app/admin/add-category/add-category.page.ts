import {Component, inject, OnInit, ViewChild} from '@angular/core';
import {CategoryService} from "../../services/category-service";
import {Category} from "../../models/Category";
import {NgForm} from "@angular/forms";
import {AuthService} from "../../services/auth-service";
import {AlertController, MenuController, ToastController} from "@ionic/angular";
import {Router} from "@angular/router";
import {User, UserRole} from "../../models/User";
interface IconOption {
  value: string;
  label: string;
}
@Component({
  selector: 'app-add-category',
  templateUrl: './add-category.page.html',
  styleUrls: ['./add-category.page.scss'],
  standalone:false
})
export class AddCategoryPage implements OnInit {

  @ViewChild('categoryForm') categoryForm!: NgForm;

  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private menuCtrl = inject(MenuController);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);

  admin: User | null = null;
  currentPage: string = 'add-category';
  isSubmitting: boolean = false;
  categories: Category[] = [];
  editingCategoryId: string | null = null;

  category: Category = {
    name: '',
    icon: ''
  };

  availableIcons: IconOption[] = [
    { value: 'laptop-outline', label: 'Electronics' },
    { value: 'phone-portrait-outline', label: 'Mobile' },
    { value: 'desktop-outline', label: 'Computer' },
    { value: 'tv-outline', label: 'TV' },
    { value: 'shirt-outline', label: 'Fashion' },
    { value: 'bag-handle-outline', label: 'Bags' },
    { value: 'watch-outline', label: 'Watches' },
    { value: 'glasses-outline', label: 'Eyewear' },
    { value: 'home-outline', label: 'Home' },
    { value: 'bed-outline', label: 'Furniture' },
    { value: 'cafe-outline', label: 'Kitchen' },
    { value: 'bulb-outline', label: 'Lighting' },
    { value: 'book-outline', label: 'Books' },
    { value: 'library-outline', label: 'Library' },
    { value: 'newspaper-outline', label: 'Magazine' },
    { value: 'musical-notes-outline', label: 'Music' },
    { value: 'basketball-outline', label: 'Sports' },
    { value: 'football-outline', label: 'Football' },
    { value: 'bicycle-outline', label: 'Cycling' },
    { value: 'fitness-outline', label: 'Fitness' },
    { value: 'game-controller-outline', label: 'Gaming' },
    { value: 'gift-outline', label: 'Gifts' },
    { value: 'heart-outline', label: 'Beauty' },
    { value: 'medkit-outline', label: 'Health' },
    { value: 'nutrition-outline', label: 'Food' },
    { value: 'pizza-outline', label: 'Fast Food' },
    { value: 'restaurant-outline', label: 'Restaurant' },
    { value: 'car-outline', label: 'Automotive' },
    { value: 'construct-outline', label: 'Tools' },
    { value: 'hardware-chip-outline', label: 'Tech' },
    { value: 'flash-outline', label: 'Electronics' },
    { value: 'paw-outline', label: 'Pets' },
    { value: 'leaf-outline', label: 'Garden' },
    { value: 'flower-outline', label: 'Plants' },
    { value: 'camera-outline', label: 'Photography' },
    { value: 'color-palette-outline', label: 'Art' }
  ];

  ngOnInit(): void {
    this.loadCategories();
  }

  async ionViewWillEnter() {
    //await this.loadAdminData();
    await this.loadCategories();
  }


  async loadAdminData() {
    try {
      this.admin = await this.authService.getCurrentUser();

      if (!this.admin) {
        await this.showToast('Please login to access admin panel', 'warning');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      await this.showToast('Error loading user data', 'danger');
    }
  }

  async checkAdminRole() {
    const role = await this.authService.getCurrentUserRole();

    if (role !== UserRole.ADMIN) {
      await this.showAlert(
        'Access Denied',
        'You do not have permission to access this page.',
        () => this.router.navigate(['/home'])
      );
    }
  }


  loadCategories() {
    this.categoryService.getAllCategories().subscribe({
      next: (categories) => {
        this.categories = categories.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
      },
      error: (error) => {
        console.error('Error loading categories:', error);
        this.showToast('Error loading categories', 'danger');
      }
    });
  }


  selectIcon(iconValue: string) {
    this.category.icon = iconValue;
  }


  async onSubmit() {
    if (!this.category.name || !this.category.icon) {
      await this.showToast('Please fill all required fields', 'warning');
      return;
    }

    this.isSubmitting = true;

    try {
      if (this.editingCategoryId) {
        // Update existing category
        await this.updateExistingCategory();
      } else {
        // Create new category
        await this.createNewCategory();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      await this.showToast('Error saving category', 'danger');
    } finally {
      this.isSubmitting = false;
    }
  }

  private async createNewCategory() {
    this.categoryService.addCategory(this.category).subscribe({
      next: async () => {
        await this.showToast('Category created successfully!', 'success');
        this.resetForm();
        this.loadCategories();
      },
      error: async (error) => {
        console.error('Error creating category:', error);
        await this.showToast('Failed to create category', 'danger');
      }
    });
  }


  private async updateExistingCategory() {
    if (!this.editingCategoryId) return;

    const updateData: Partial<Category> = {
      name: this.category.name,
      icon: this.category.icon
    };

    this.categoryService.updateCategory(this.editingCategoryId, updateData).subscribe({
      next: async () => {
        await this.showToast('Category updated successfully!', 'success');
        this.resetForm();
        this.loadCategories();
        this.editingCategoryId = null;
      },
      error: async (error) => {
        console.error('Error updating category:', error);
        await this.showToast('Failed to update category', 'danger');
      }
    });
  }


  async editCategory(cat: Category) {
    this.editingCategoryId = cat.id || null;
    this.category = {
      name: cat.name,
      icon: cat.icon
    };

    // Scroll to top to show form
    const content = document.querySelector('ion-content');
    if (content) {
      await content.scrollToTop(500);
    }

    await this.showToast('Editing category', 'primary');
  }

  async deleteCategory(cat: Category) {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete the category "${cat.name}"? This action cannot be undone.`,
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
            this.performDelete(cat);
          }
        }
      ]
    });

    await alert.present();
  }


  private performDelete(cat: Category) {
    if (!cat.id) {
      this.showToast('Invalid category ID', 'danger');
      return;
    }

    this.categoryService.deleteCategory(cat.id).subscribe({
      next: async () => {
        await this.showToast('Category deleted successfully', 'success');
        this.loadCategories();

        // Reset form if we were editing this category
        if (this.editingCategoryId === cat.id) {
          this.resetForm();
        }
      },
      error: async (error) => {
        console.error('Error deleting category:', error);
        await this.showToast('Failed to delete category', 'danger');
      }
    });
  }

  resetForm() {
    this.category = {
      name: '',
      icon: ''
    };
    this.editingCategoryId = null;

    if (this.categoryForm) {
      this.categoryForm.resetForm();
    }
  }


  async navigateTo(page: string) {
    this.currentPage = page;
    await this.menuCtrl.close();

    switch (page) {
      case 'dashboard':
        this.router.navigate(['/admin/dashboard']);
        break;
      case 'products':
        this.router.navigate(['/admin/products']);
        break;
      case 'add-product':
        this.router.navigate(['/admin/add-product']);
        break;
      case 'categories':
        this.router.navigate(['/admin/categories']);
        break;
      case 'add-category':
        // Already on add-category page
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

  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  private async showAlert(header: string, message: string, onConfirm?: () => void) {
    const alert = await this.alertController.create({
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
    });

    await alert.present();
  }


}
