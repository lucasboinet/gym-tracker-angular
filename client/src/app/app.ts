import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-root',
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthService, multi: true }
  ],
  imports: [
    RouterOutlet, 
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  
}
