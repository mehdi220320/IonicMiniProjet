import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth-service';
import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { User, UserRole } from '../models/User';
import { DashboardService } from '../services/dashboard-service'; //

@Component({
  selector: 'app-admin',
  templateUrl: './admin.page.html',
  styleUrls: ['./admin.page.scss'],
  standalone: false,
})
export class AdminPage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private alertController = inject(AlertController);
  private toastController = inject(ToastController);
  private dashboardService = inject(DashboardService);

  admin: User | null = null;

  totalRevenue: number = 0;
  totalOrders: number = 0;
  totalProducts: number = 0;
  totalUsers: number = 0;
  categoryStats: any[] = [];
  async ionViewWillEnter() {
    await this.loadAdminData();
    await this.loadDashboardStats();
  }

  async loadAdminData() {
    try {
      this.admin = await this.authService.getCurrentUser();

      if (!this.admin) {
        await this.showToast('Please login to access admin panel', 'warning');
        this.router.navigate(['/login']);
        return;
      }

      if (this.admin.role !== UserRole.ADMIN) {
        await this.showAlert(
          'Access Denied',
          'You are not authorized to access the admin dashboard.',
          () => this.router.navigate(['/home'])
        );
      }
    } catch (error) {
      console.error('Error loading admin data:', error);
      await this.showToast('Error loading user data', 'danger');
    }
  }

  async loadDashboardStats() {
    try {
      this.totalRevenue = await this.dashboardService.getTotalRevenue();
      this.totalOrders = await this.dashboardService.getTotalOrders();
      this.totalProducts = await this.dashboardService.getTotalProducts();
      this.totalUsers = await this.dashboardService.getTotalUsers();
      this.categoryStats = await this.dashboardService.getCategoryStats();
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      await this.showToast('Error loading stats', 'danger');
    }
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirm Logout',
      message: 'Are you sure you want to logout?',
      buttons: [
        { text: 'Cancel', role: 'cancel', cssClass: 'secondary' },
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
      buttons: [{ text: 'OK', handler: () => onConfirm && onConfirm() }]
    });
    await alert.present();
  }
}
