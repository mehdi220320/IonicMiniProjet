import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonBadge,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonSearchbar,
  IonItem,
  IonLabel,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  eyeOutline,
  trashOutline,
  personAddOutline,
  personRemoveOutline,
  closeOutline,
  chevronBackOutline,
  chevronForwardOutline,
  peopleOutline,
  shieldOutline,
  personOutline,
  homeOutline
} from 'ionicons/icons';

import { UserService } from "../../services/user-service";
import { User, UserRole } from '../../models/User';
import { BehaviorSubject, combineLatest, Observable, Subscription, map } from 'rxjs';
import {MenuComponent} from "../menu/menu.component";
import {FooterComponent} from "../footer/footer.component";

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.page.html',
  styleUrls: ['./list-users.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonBadge,
    IonContent,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonSearchbar,

    MenuComponent,
    FooterComponent
  ]
})
export class ListUsersPage implements OnInit, OnDestroy {
  private userService = inject(UserService);

  // Make UserRole enum available in template
  UserRole = UserRole;

  // User data
  users$: Observable<User[]> = this.userService.getAllUsers();
  filteredUsers$ = new BehaviorSubject<User[]>([]);

  // Search and pagination
  searchTerm = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  totalUsers = 0;

  // UI state
  expandedUserId: string | null = null;
  isUpdatingRole = false;

  // Subscriptions
  private subscription = new Subscription();

  constructor() {
    // Register all icons
    addIcons({
      eyeOutline,
      trashOutline,
      personAddOutline,
      personRemoveOutline,
      closeOutline,
      chevronBackOutline,
      chevronForwardOutline,
      peopleOutline,
      shieldOutline,
      personOutline,
      homeOutline
    });
  }

  // Paginated users observable
  get paginatedUsers$(): Observable<User[]> {
    return this.filteredUsers$.pipe(
      map(users => {
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        return users.slice(startIndex, startIndex + this.itemsPerPage);
      })
    );
  }

  ngOnInit() {
    // Combine users with search term
    const searchSub = combineLatest([
      this.users$,
      this.searchTerm$
    ]).pipe(
      map(([users, searchTerm]) => {
        const filtered = this.filterUsers(users, searchTerm);
        this.totalUsers = filtered.length;
        return filtered;
      })
    ).subscribe(filteredUsers => {
      this.filteredUsers$.next(filteredUsers);
      this.updatePagination(filteredUsers.length);
    });

    this.subscription.add(searchSub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  // Search functionality
  private searchTerm$ = new BehaviorSubject<string>('');

  onSearchChange(event: any) {
    this.searchTerm = event.detail.value || '';
    this.searchTerm$.next(this.searchTerm.toLowerCase());
    this.currentPage = 1; // Reset to first page on search
  }

  private filterUsers(users: User[], searchTerm: string): User[] {
    if (!searchTerm) return users;

    return users.filter(user =>
      user.username?.toLowerCase().includes(searchTerm) ||
      user.email?.toLowerCase().includes(searchTerm) ||
      user.role?.toLowerCase().includes(searchTerm)
    );
  }

  // Role management
  toggleUserRole(user: User) {
    this.expandedUserId = user.id!;
  }

  cancelRoleUpdate() {
    this.expandedUserId = null;
  }

  async confirmRoleUpdate(user: User) {
    this.isUpdatingRole = true;

    try {
      const newRole: UserRole = user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
      await this.userService.updateUserRole(user.id!, newRole).toPromise();

      // Show success message
      this.presentToast(`Role updated to ${this.getRoleDisplayName(newRole)}`, 'success');

    } catch (error) {
      console.error('Error updating user role:', error);
      this.presentToast('Failed to update role', 'danger');
    } finally {
      this.isUpdatingRole = false;
      this.expandedUserId = null;
    }
  }

  // User actions
  viewUserDetails(user: User) {
    // Navigate to user details page or show modal
    console.log('View user details:', user);
  }

  async confirmDelete(userId: string) {
    // Implement delete confirmation
    console.log('Delete user:', userId);
    // You can add a confirmation alert here
    // const alert = await this.alertController.create({
    //   header: 'Confirm Delete',
    //   message: 'Are you sure you want to delete this user?',
    //   buttons: [
    //     { text: 'Cancel', role: 'cancel' },
    //     { text: 'Delete', role: 'destructive', handler: () => this.deleteUser(userId) }
    //   ]
    // });
    // await alert.present();
  }

  // Role display helper
  getRoleDisplayName(role: UserRole): string {
    return role === UserRole.ADMIN ? 'Administrator' : 'User';
  }

  // Role color helper
  getRoleColor(role: UserRole): string {
    return role === UserRole.ADMIN ? 'danger' : 'primary';
  }

  // Role icon helper
  getRoleIcon(role: UserRole): string {
    return role === UserRole.ADMIN ? 'shield-outline' : 'person-outline';
  }

  // Role button color helper
  getRoleButtonColor(role: UserRole): string {
    return role === UserRole.ADMIN ? 'warning' : 'success';
  }

  // Role button icon helper
  getRoleButtonIcon(role: UserRole): string {
    return role === UserRole.ADMIN ? 'person-remove-outline' : 'person-add-outline';
  }

  // Role button text helper
  getRoleButtonText(role: UserRole): string {
    return role === UserRole.ADMIN ? 'Make User' : 'Make Admin';
  }

  // Pagination
  private updatePagination(totalItems: number) {
    this.totalPages = Math.ceil(totalItems / this.itemsPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = Math.max(1, this.totalPages);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }

  goToPage(page: number) {
    this.currentPage = page;
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  // Utility methods
  private async presentToast(message: string, color: 'success' | 'danger' = 'success') {
    // Implement toast notification
    console.log(`Toast: ${message} (${color})`);
    // You can use Ionic toast here:
    // const toast = await this.toastController.create({
    //   message,
    //   duration: 3000,
    //   color
    // });
    // await toast.present();
  }
}
