import {Component, inject} from '@angular/core';
import {AuthService} from "../services/auth-service";
import {Router} from "@angular/router";
import {User, UserRole} from "../models/User";

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  private authService = inject(AuthService);
  private router = inject(Router);

  user: User | null = null;
  searchQuery: string = '';

  ngOnInit() {
    this.loadUserData();
  }

  async loadUserData() {
    try {
      // Get user data from your auth service
      // Replace this with your actual method to get user data
      this.user = await this.authService.getCurrentUser();

      // If your auth service stores user differently, adjust accordingly:
      // this.user = this.authService.currentUser;
      // or
      // this.authService.user$.subscribe(user => this.user = user);
    } catch (e) {
      console.log('Error loading user data:', e);
      // Set default or guest user if needed
      this.user = {
        id: 'guest',
        username: 'Guest User',
        email: 'guest@example.com',
        role: UserRole.USER
      };
    }
  }

  async logout() {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (e) {
      console.log('Logout error:', e);
    }
  }
}
