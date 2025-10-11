import { Component, OnInit } from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, Validators} from "@angular/forms";
import {Router} from "@angular/router";
import {AlertController, LoadingController} from "@ionic/angular";
import {AuthService} from "../services/auth-service";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone: false,
})
export class SignupPage implements OnInit {
  signupForm: FormGroup;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private authService: AuthService
  ) {
    this.signupForm = this.formBuilder.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
        terms: [false, [Validators.requiredTrue]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  ngOnInit() {}

  private passwordMatchValidator(control: AbstractControl) {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    return password && confirmPassword && password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  async onSignup() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      const loading = await this.loadingCtrl.create({ message: 'Creating your account...' });
      await loading.present();

      const { fullName, email, password } = this.signupForm.value;

      try {
        const user = await this.authService.register(fullName, email, password);
        console.log('Registered user:', user);
        await loading.dismiss();
        this.router.navigate(['/home']);
      } catch (error: any) {
        await loading.dismiss();
        this.showAlert('Signup Failed', error.message || 'Something went wrong');
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
      case 'auth/email-already-in-use':
        return 'This email is already registered.';
      case 'auth/invalid-email':
        return 'Invalid email format.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      default:
        return 'An unexpected error occurred.';
    }
  }

}
