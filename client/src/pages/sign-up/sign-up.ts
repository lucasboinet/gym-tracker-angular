import { Component } from "@angular/core";
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { ButtonModule } from "primeng/button";
import { InputTextModule } from 'primeng/inputtext'
import { CardModule } from "primeng/card";
import { passwordMatchValidator } from "../../shared/validators/auth";

@Component({
  templateUrl: './sign-up.html',
  selector: 'sign-up-page',
  imports: [FormsModule, ButtonModule, InputTextModule, CardModule, ReactiveFormsModule],
})
export class SignUpPage {
  loading = false;
  registerForm: FormGroup;
  error = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
  ) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validator: passwordMatchValidator });
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
      },
      error: (err) => {
        this.error = err?.error?.message || 'An error occurred';
        this.loading = false;
      }
    })
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