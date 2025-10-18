import {Component, inject, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {AlertController, LoadingController} from "@ionic/angular";
import {Router} from "@angular/router";
import {AuthService} from "../services/auth-service";

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  standalone:false,
  styleUrls: ['./login.page.scss'],
})
export class LoginPage  {
  loginForm: FormGroup;
  isLoading = false;
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private loadingCtrl = inject(LoadingController);
  private alertCtrl = inject(AlertController);
  private authService = inject(AuthService);
  constructor(

  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }


  async onLogin() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({ message: 'Signing in...' });
      await loading.present();

      const { email, password } = this.loginForm.value;

      try {
        const user = await this.authService.login(email, password);
        console.log('Logged in user:', user);
        await loading.dismiss();

        if(await this.authService.getCurrentUserRole()==="ADMIN"){
          this.router.navigate(['/admin']);
        }else {
          this.router.navigate(['/tabs/home']);

        }
      } catch (error: any) {
        await loading.dismiss();
        this.showAlert('Login Failed', error.message || 'Invalid credentials');
      } finally {
        this.isLoading = false;
      }
    }
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  private getFirebaseError(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      default:
        return 'An error occurred. Please try again later.';
    }
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
