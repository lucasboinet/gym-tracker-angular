import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { passwordMatchValidator } from '../../shared/validators/auth';

@Component({
  templateUrl: './sign-up.html',
  selector: 'sign-up-page',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class SignUpPage {
  loading = false;
  registerForm: FormGroup;
  error = '';

  fb = inject(FormBuilder);
  auth = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);

  constructor() {
    this.registerForm = this.fb.group(
      {
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validator: passwordMatchValidator },
    );
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password, confirmPassword } = this.registerForm.value;

    this.auth.register(email!, password!, confirmPassword!).subscribe({
      next: () => {
        this.auth.login(email!, password!).subscribe({
          next: () => {
            this.userService.loadUser().subscribe({
              next: () => this.router.navigate(['/']),
              error: () => console.error('Failed to load user after registration'),
            });
          },
          error: (err) => {
            this.error = err?.error?.message || 'An error occurred';
            this.loading = false;
          },
        });
      },
      error: (err) => {
        this.error = err?.error?.message || 'An error occurred';
        this.loading = false;
      },
    });
  }

  get email() {
    return this.registerForm.get('email');
  }

  get password() {
    return this.registerForm.get('password');
  }

  get confirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
}
