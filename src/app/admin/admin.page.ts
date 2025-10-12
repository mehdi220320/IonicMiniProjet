import { Component, OnInit } from '@angular/core';
import {AuthService} from "../services/auth-service";
import {Router} from "@angular/router";
import {AlertController, MenuController, ToastController} from "@ionic/angular";
import {User, UserRole} from "../models/User";
interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'positive' | 'negative' | 'neutral';
  icon: string;
}

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: 'Delivered' | 'Pending' | 'Shipped' | 'Cancelled';
  statusColor: string;
}

interface CategoryStat {
  name: string;
  icon: string;
  color: string;
  percentage: number;
  value: number;
}
@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone:false,
})
export class AdminPage implements OnInit {

  admin: User | null = null;
  currentPage: string = 'dashboard';
  searchQuery: string = '';

  // Statistics
  stats: StatCard[] = [
    {
      label: 'Total Revenue',
      value: '$45,890',
      change: '12.5% from last month',
      changeType: 'positive',
      icon: 'trending-up'
    },
    {
      label: 'Total Orders',
      value: '1,247',
      change: '8.3% from last month',
      changeType: 'positive',
      icon: 'cart'
    },
    {
      label: 'Total Product',
      value: '384',
      change: 'No change',
      changeType: 'neutral',
      icon: 'cube'
    },
    {
      label: 'Total Users',
      value: '2,856',
      change: '15.2% from last month',
      changeType: 'positive',
      icon: 'people'
    }
  ];

  // Recent Orders
  recentOrders: Order[] = [
    {
      id: '#ORD-1247',
      customer: 'John Doe',
      product: 'Wireless Headphones',
      amount: '$79.99',
      status: 'Delivered',
      statusColor: 'success'
    },
    {
      id: '#ORD-1246',
      customer: 'Sarah Smith',
      product: 'Smart Watch Pro',
      amount: '$199.99',
      status: 'Pending',
      statusColor: 'warning'
    },
    {
      id: '#ORD-1245',
      customer: 'Mike Johnson',
      product: 'Designer Sunglasses',
      amount: '$129.99',
      status: 'Shipped',
      statusColor: 'primary'
    },
    {
      id: '#ORD-1244',
      customer: 'Emma Wilson',
      product: 'Running Shoes',
      amount: '$89.99',
      status: 'Delivered',
      statusColor: 'success'
    },
    {
      id: '#ORD-1243',
      customer: 'David Brown',
      product: 'Leather Backpack',
      amount: '$149.99',
      status: 'Cancelled',
      statusColor: 'danger'
    }
  ];

  // Category Statistics
  categoryStats: CategoryStat[] = [
    {
      name: 'Electronics',
      icon: 'laptop-outline',
      color: 'primary',
      percentage: 0.65,
      value: 65
    },
    {
      name: 'Fashion',
      icon: 'shirt-outline',
      color: 'secondary',
      percentage: 0.45,
      value: 45
    },
    {
      name: 'Home & Living',
      icon: 'home-outline',
      color: 'tertiary',
      percentage: 0.38,
      value: 38
    },
    {
      name: 'Sports',
      icon: 'basketball-outline',
      color: 'success',
      percentage: 0.28,
      value: 28
    },
    {
      name: 'Books',
      icon: 'book-outline',
      color: 'warning',
      percentage: 0.20,
      value: 20
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private menuCtrl: MenuController,
    private alertController: AlertController,
    private toastController: ToastController
  ) {}

  async ngOnInit() {
    //await this.loadAdminData();
    //await this.checkAdminRole();
  }

  async ionViewWillEnter() {
    await this.loadAdminData();
  }

  /**
   * Load admin user data
   */
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

  /**
   * Check if user has admin role
   */
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

  /**
   * Navigate to different pages
   */
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
      case 'settings':
        this.router.navigate(['/admin/settings']);
        break;
      default:
        break;
    }
  }

  /**
   * View order details
   */
  viewOrderDetails(order: Order) {
    console.log('Viewing order:', order);
    this.router.navigate(['/admin/order-details', order.id.replace('#ORD-', '')]);
  }

  /**
   * Logout with confirmation
   */
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

  /**
   * Search functionality (to be implemented)
   */
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

  /**
   * Refresh dashboard data
   */
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

  /**
   * Show toast notification
   */
  private async showToast(message: string, color: string = 'primary') {
    const toast = await this.toastController.create({
      message,
      duration: 2000,
      position: 'bottom',
      color
    });
    await toast.present();
  }

  /**
   * Show alert dialog
   */
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

  /**
   * Get stat card by index
   */
  getStatCard(index: number): StatCard {
    return this.stats[index];
  }

  /**
   * Get category stat by index
   */
  getCategoryStat(index: number): CategoryStat {
    return this.categoryStats[index];
  }

  /**
   * Format currency
   */
  formatCurrency(amount: string): string {
    return amount;
  }

  /**
   * Get status badge color
   */
  getStatusColor(status: string): string {
    const statusMap: { [key: string]: string } = {
      'Delivered': 'success',
      'Pending': 'warning',
      'Shipped': 'primary',
      'Cancelled': 'danger'
    };
    return statusMap[status] || 'medium';
  }

  /**
   * Open menu
   */
  async openMenu() {
    await this.menuCtrl.open();
  }

  /**
   * Close menu
   */
  async closeMenu() {
    await this.menuCtrl.close();
  }
}
