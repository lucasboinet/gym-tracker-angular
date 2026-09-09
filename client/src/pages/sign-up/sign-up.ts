import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { AuthService } from '../../services/auth.service';
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
  router = inject(Router);
  messageService = inject(MessageService);

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
        this.loading = false;
        this.router.navigate(['/sign-in'], { queryParams: { registered: 'true' } });
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
    if (status === 409) {
      return 'An account with this email already exists.';
    }
    if (status === 400 || status === 422) {
      return 'Some details are invalid. Please check the form.';
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
      summary: 'Sign up failed',
      detail,
      life: 5000,
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
