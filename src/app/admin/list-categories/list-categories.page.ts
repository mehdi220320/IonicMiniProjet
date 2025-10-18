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
  IonSelect,
  IonSelectOption,
  AlertController,
  IonCardHeader,
  IonCardTitle,
  IonMenuButton,
  IonButtons,
  IonBadge,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  add,
  createOutline,
  trashOutline,
  eyeOutline,
  closeOutline,
  saveOutline,
  laptopOutline,
  phonePortraitOutline,
  desktopOutline,
  tvOutline,
  shirtOutline,
  bagHandleOutline,
  watchOutline,
  glassesOutline,
  homeOutline,
  bedOutline,
  cafeOutline,
  bulbOutline,
  bookOutline,
  libraryOutline,
  newspaperOutline,
  musicalNotesOutline,
  basketballOutline,
  footballOutline,
  bicycleOutline,
  fitnessOutline,
  gameControllerOutline,
  giftOutline,
  heartOutline,
  medkitOutline,
  nutritionOutline,
  pizzaOutline,
  restaurantOutline,
  carOutline,
  constructOutline,
  hardwareChipOutline,
  flashOutline,
  pawOutline,
  leafOutline,
  flowerOutline,
  cameraOutline,
  colorPaletteOutline
} from 'ionicons/icons';
import { CategoryService } from '../../services/category-service';
import { Category } from '../../models/Category';
import { Observable, map } from 'rxjs';
import { Router } from '@angular/router';
import { MenuComponent } from '../menu/menu.component';
import { FooterComponent } from '../footer/footer.component';

interface IconOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-list-categories',
  templateUrl: './list-categories.page.html',
  styleUrls: ['./list-categories.page.scss'],
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
    IonSelect,
    IonSelectOption,
    IonBadge,
    MenuComponent,
    FooterComponent,
  ]
})
export class ListCategoriesPage implements OnInit {
  categoryService = inject(CategoryService);
  private router = inject(Router);
  private alertController = inject(AlertController);

  categories$!: Observable<Category[]>;
  filteredCategories$!: Observable<Category[]>;
  paginatedCategories$!: Observable<Category[]>;

  searchTerm: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 8;
  totalPages: number = 1;

  expandedCategoryId: string | null = null;
  editingCategory: Partial<Category> = {};

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

  constructor() {
    addIcons({
      add,
      createOutline,
      trashOutline,
      eyeOutline,
      closeOutline,
      saveOutline,
      laptopOutline,
      phonePortraitOutline,
      desktopOutline,
      tvOutline,
      shirtOutline,
      bagHandleOutline,
      watchOutline,
      glassesOutline,
      homeOutline,
      bedOutline,
      cafeOutline,
      bulbOutline,
      bookOutline,
      libraryOutline,
      newspaperOutline,
      musicalNotesOutline,
      basketballOutline,
      footballOutline,
      bicycleOutline,
      fitnessOutline,
      gameControllerOutline,
      giftOutline,
      heartOutline,
      medkitOutline,
      nutritionOutline,
      pizzaOutline,
      restaurantOutline,
      carOutline,
      constructOutline,
      hardwareChipOutline,
      flashOutline,
      pawOutline,
      leafOutline,
      flowerOutline,
      cameraOutline,
      colorPaletteOutline
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.categories$ = this.categoryService.getAllCategories();
    this.filteredCategories$ = this.categories$;
    this.updatePagination();
  }

  onSearchChange(event: any): void {
    this.searchTerm = event.detail.value?.toLowerCase() || '';
    this.currentPage = 1;

    if (this.searchTerm) {
      this.filteredCategories$ = this.categories$.pipe(
        map(categories =>
          categories.filter(c =>
            c.name?.toLowerCase().includes(this.searchTerm)
          )
        )
      );
    } else {
      this.filteredCategories$ = this.categories$;
    }

    this.updatePagination();
  }

  updatePagination(): void {
    this.paginatedCategories$ = this.filteredCategories$.pipe(
      map(categories => {
        this.totalPages = Math.ceil(categories.length / this.itemsPerPage);
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        return categories.slice(startIndex, endIndex);
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

  navigateToAddCategory(): void {
    this.router.navigate(['/admin/add-category']);
  }

  toggleEdit(category: Category): void {
    if (this.expandedCategoryId === category.id) {
      this.expandedCategoryId = null;
      this.editingCategory = {};
    } else {
      this.expandedCategoryId = category.id || null;
      this.editingCategory = { ...category };
    }
  }

  onIconChange(event: any): void {
    this.editingCategory.icon = event.detail.value;
  }

  async saveEdit(categoryId: string): Promise<void> {
    if (!categoryId) return;

    if (!this.editingCategory.name || !this.editingCategory.icon) {
      const alert = await this.alertController.create({
        header: 'Validation Error',
        message: 'Please fill all required fields.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    try {
      const updateData: Partial<Category> = {
        name: this.editingCategory.name,
        icon: this.editingCategory.icon
      };

      await this.categoryService.updateCategory(categoryId, updateData).toPromise();

      this.expandedCategoryId = null;
      this.editingCategory = {};

      const alert = await this.alertController.create({
        header: 'Success',
        message: 'Category updated successfully!',
        buttons: ['OK']
      });
      await alert.present();

      this.loadCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Failed to update category.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  cancelEdit(): void {
    this.expandedCategoryId = null;
    this.editingCategory = {};
  }

  async confirmDelete(categoryId: string, categoryName: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirm Delete',
      message: `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          role: 'destructive',
          handler: () => {
            this.deleteCategory(categoryId);
          }
        }
      ]
    });

    await alert.present();
  }

  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await this.categoryService.deleteCategory(categoryId).toPromise();

      const alert = await this.alertController.create({
        header: 'Success',
        message: 'Category deleted successfully!',
        buttons: ['OK']
      });
      await alert.present();

      this.loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'Failed to delete category.',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  getPageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getIconLabel(iconValue: string): string {
    const icon = this.availableIcons.find(i => i.value === iconValue);
    return icon ? icon.label : iconValue;
  }
}
