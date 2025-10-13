import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/auth-service';
import { UserRole } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {

    const isLoggedIn = await this.authService.isLoggedIn();
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }

    const userRole = await this.authService.getCurrentUserRole();


    const adminRoleRequired = route.data['role']? true : false;

    if (adminRoleRequired && userRole !== "ADMIN") {
      this.router.navigate(['/unauthorized']);
      return false;
    }
    return true;
  }
}
