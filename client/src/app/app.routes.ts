import { Routes } from '@angular/router';
import { SignInPage } from '../pages/sign-in/sign-in';
import { SignUpPage } from '../pages/sign-up/sign-up';
import { HomePage } from '../pages/home/home';
import { SessionsPage } from '../pages/sessions/sessions';
import { AuthGuard } from '../guards/auth.guard';

export const routes: Routes = [
  {
    title: 'Home',
    path: '',
    component: HomePage,
    canActivate: [AuthGuard],
  },
  {
    title: 'Sessions',
    path: 'sessions',
    component: SessionsPage,
    canActivate: [AuthGuard],
  },
  {
    title: 'Sign-In',
    path: 'sign-in',
    component: SignInPage,
  },
  {
    title: 'Sign-Up',
    path: 'sign-up',
    component: SignUpPage,
  },
];
