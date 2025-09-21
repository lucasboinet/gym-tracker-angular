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

@Component({
  templateUrl: './sign-in.html',
  selector: 'sign-in-page',
  imports: [
    FormsModule,
    ButtonModule,
    InputTextModule,
    CardModule,
    ReactiveFormsModule,
    RouterLink,
  ],
})
export class SignInPage {
  loading = false;
  loginForm: FormGroup;
  error = '';

  fb = inject(FormBuilder);
  auth = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = '';

    const { email, password } = this.loginForm.value;

    this.auth.login(email!, password!).subscribe({
      next: () => {
        this.userService.loadUser().subscribe({
          next: () => this.router.navigate(['/']),
          error: () => {
            this.auth.logout(() => this.router.navigate(['/sign-in']));
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
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
