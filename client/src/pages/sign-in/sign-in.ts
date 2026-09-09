import { Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
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
export class SignInPage implements OnInit {
  loading = false;
  loginForm: FormGroup;
  error = '';

  fb = inject(FormBuilder);
  auth = inject(AuthService);
  userService = inject(UserService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  messageService = inject(MessageService);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  ngOnInit() {
    if (this.route.snapshot.queryParamMap.get('registered') === 'true') {
      this.messageService.add({
        severity: 'success',
        summary: 'Account created',
        detail: 'Your account was created. Please sign in.',
        life: 4000,
      });
    }
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
            this.showError('Could not load your account. Please sign in again.');
          },
        });
      },
      error: (err) => {
        this.showError(this.resolveError(err));
        this.loading = false;
      },
    });
  }

  private resolveError(err: unknown): string {
    const status = (err as { status?: number })?.status;
    const message = (err as { error?: { message?: string } })?.error?.message;

    if (message) {
      return message;
    }
    if (status === 401 || status === 403) {
      return 'Invalid email or password.';
    }
    if (status === 0) {
      return 'Cannot reach the server. Check your connection.';
    }
    return 'An error occurred. Please try again.';
  }

  private showError(detail: string) {
    this.error = detail;
    this.messageService.add({
      severity: 'error',
      summary: 'Sign in failed',
      detail,
      life: 5000,
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }
}
