import {Component, inject, OnInit} from '@angular/core';
import {AuthService} from "../../services/auth-service";
import {User, UserRole} from "../../models/User";
import {Router, RouterModule} from "@angular/router";
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonAvatar,
  IonBadge,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonButton,
  IonMenuToggle, MenuController, AlertController, ToastController
} from '@ionic/angular/standalone';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonMenu,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonAvatar,
    IonBadge,
    IonList,
    IonItem,
    IonIcon,
    IonLabel,
    IonButton,
    IonMenuToggle,
    RouterModule
  ]
})
export class MenuComponent  implements OnInit {

  admin: User | null = null;
  currentPage: string = 'dashboard';
  searchQuery: string = '';

  private authService = inject(AuthService)
  private router= inject(Router)
  private menuCtrl= inject( MenuController)
  private alertController= inject( AlertController)
  private toastController= inject( ToastController)
  constructor(

  ) {}

  async ngOnInit() {
  //await this.loadAdminData();
  //await this.checkAdminRole();
  }

  async ionViewWillEnter() {
    await this.loadAdminData();
  }


  async loadAdminData() {
    try {
      this.admin = await this.authService.getCurrentUser();

      if (!this.admin) {
        //await this.showToast('Please login to access admin panel', 'warning');
        //this.router.navigate(['/login']);
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
        'You do not have permission to access the admin panel.',
        () => this.router.navigate(['/home'])
      );
    }
  }

  async navigateTo(page: string) {
    this.currentPage = page;
    await this.menuCtrl.close();

    switch (page) {
      case 'dashboard':
        // Already on dashboard, refresh data
        await this.loadAdminData();
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
        this.router.navigate(['/admin/add-category']);
        break;
      case 'users':
        this.router.navigate(['/admin/users']);
        break;
      case 'orders':
        this.router.navigate(['/admin/orders']);
        break;
      case 'home':
        this.router.navigate(['/home']);
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

  onSearch(event: any) {
    const query = event.target.value?.toLowerCase() || '';
    this.searchQuery = query;

    if (query.trim() === '') {
      // Reset to show all data
      console.log('Search cleared');
      return;
    }

    // Implement search logic here
    console.log('Searching for:', query);
  }


  async refreshDashboard(event?: any) {
    try {
      await this.loadAdminData();
      // Here you would typically fetch fresh data from your backend
      await this.showToast('Dashboard refreshed', 'success');

      if (event) {
        event.target.complete();
      }
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      await this.showToast('Error refreshing data', 'danger');

      if (event) {
        event.target.complete();
      }
    }
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


  formatCurrency(amount: string): string {
    return amount;
  }

  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Delivered': 'success',
      'Pending': 'warning',
      'Shipped': 'primary',
      'Cancelled': 'danger'
    };
    return statusMap[status] || 'medium';
  }


  async openMenu() {
    await this.menuCtrl.open();
  }


  async closeMenu() {
    await this.menuCtrl.close();
  }
}
