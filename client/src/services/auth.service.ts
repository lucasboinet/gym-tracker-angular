import {
  HttpClient,
  HttpContext,
  HttpContextToken,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, Observable, Subject, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { LocalStorageService } from './storage.service';

/**
 * Defines a context token for storing the access token type.
 * The default value is "<access_token>".
 */
export const TOKEN_CONTEXT = new HttpContextToken<string>(() => '<access_token>');
/**
 * Enum representing the HTTP methods supported in the service.
 */
export enum HttpMethod {
  POST = 'post',
  GET = 'get',
  DELETE = 'delete',
  PUT = 'put',
}

export interface RequestConfig {
  path: string;
  body?: any;
  httpParams?: HttpParams;
  method?: HttpMethod;
  skipAuth?: boolean;
  headerResponse?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService implements HttpInterceptor {
  private apiUrl = environment.apiUrl; // Base API URL.
  private loginApiUrl = environment.apiUrl + '/auth/login'; // Login endpoint.
  private registerApiUrl = environment.apiUrl + '/auth/register'; // Registration endpoint.
  private logoutApiUrl = environment.apiUrl + '/auth/logout'; // Logout endpoint.
  private refreshApiUrl = environment.apiUrl + '/auth/token/refresh'; // Token refresh endpoint.
  private accessTokenKey = 'gym_tracker_access_token'; // Local storage key for access token.
  private refreshTokenKey = 'gym_tracker_refresh_token'; // Local storage key for refresh token.
  private refreshTokenInProgress = false; // Flag indicating if token refresh is ongoing.
  private tokenRefreshedSource = new Subject<boolean>(); // Observable source for token refresh status.
  private tokenRefreshed$ = this.tokenRefreshedSource; // Observable for token refresh events.
  private tokenExpiredObserver: (() => void)[] = []; // List of token expiration observers.

  private http = inject(HttpClient);
  private localStorage = inject(LocalStorageService);
  private router = inject(Router);

  public addTokenExpiredObserver(observer: () => void) {
    this.tokenExpiredObserver.push(observer);
  }

  calculateRequestHeader(req: HttpRequest<any>): HttpRequest<any> {
    let request = req.clone();
    if (req.context.has(TOKEN_CONTEXT)) {
      const typeOfAuthorization = req.context.get(TOKEN_CONTEXT);
      if (typeOfAuthorization == '<access_token>') {
        request = req.clone({
          headers: req.headers.set('authorization', `Bearer ${this.getAccessToken()}`),
        });
      } else if (typeOfAuthorization == '<refresh_token>') {
        request = req.clone({
          headers: req.headers.set('authorization', `Bearer ${this.getRefreshToken()}`),
        });
      }
    }
    return request;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const request = this.calculateRequestHeader(req);
    return next.handle(request).pipe(
      tap({
        next: (event: HttpEvent<any>) => console.debug('HTTP event', event.type),
      }),
      catchError((_error) => {
        return this.handleResponseError(_error, req, next);
      }),
    );
  }

  tryRefreshToken() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      return this.http
        .post<any>(`${this.refreshApiUrl}`, null, {
          context: new HttpContext().set(TOKEN_CONTEXT, '<refresh_token>'),
        })
        .pipe(
          tap((response: any) => {
            this.storeTokens(response.access_token, response.refresh_token);
            return EMPTY;
          }),
        );
    }

    return throwError(() => new Error('Session expired, please log in again.'));
  }

  refreshToken(): Observable<any> {
    if (this.refreshTokenInProgress) {
      return new Observable((observer) => {
        this.tokenRefreshed$.subscribe((refreshed) => {
          if (refreshed) {
            observer.next(true);
            observer.complete();
          } else {
            observer.error(new Error('Session expired, please log in again.'));
          }
        });
      });
    }

    if (!this.isLoggedIn()) {
      this.tokenRefreshedSource.next(false);
      this.clearTokens();
      return EMPTY;
    }

    this.refreshTokenInProgress = true;
    return this.tryRefreshToken().pipe(
      tap(() => {
        this.refreshTokenInProgress = false;
        this.tokenRefreshedSource.next(true);
      }),
      catchError(() => {
        this.tokenRefreshedSource.next(false);
        this.refreshTokenInProgress = false;
        this.clearTokens();
        return throwError(() => new Error('Session expired, please log in again.'));
      }),
    );
  }

  private handleResponseError(
    error: HttpErrorResponse,
    request?: HttpRequest<any>,
    next?: HttpHandler,
  ) {
    if (error.status === 401) {
      if (error.url?.includes('/auth/token/refresh')) {
        this.clearTokens();
        this.router.navigate(['/sign-in']);
      }

      return this.refreshToken().pipe(
        switchMap(() => {
          if (request !== undefined && next !== undefined) {
            const httpRequest = this.calculateRequestHeader(request);
            return next.handle(httpRequest);
          }
          return EMPTY;
        }),
      );
    } else {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
        errorMessage = `Error: ${error.error.message}`;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      return throwError(() => new Error(errorMessage));
    }
  }

  private tokenExpired(token: string) {
    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    return Math.floor(new Date().getTime() / 1000) >= expiry;
  }

  public isLoggedIn(): boolean {
    const token = this.localStorage.getItem(this.refreshTokenKey);
    if (token != undefined) {
      if (!this.tokenExpired(token)) {
        return true;
      } else {
        this.clearTokens();
        this.tokenExpiredObserver.forEach((observer) => {
          observer();
        });
      }
    }
    return false;
  }

  private storeTokens(accessToken: string, refreshToken: string) {
    this.localStorage.setItem(this.accessTokenKey, accessToken);
    this.localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  public getAccessToken(): string | null {
    return this.localStorage.getItem(this.accessTokenKey);
  }

  public getRefreshToken(): string | null {
    return this.localStorage.getItem(this.refreshTokenKey);
  }

  private clearTokens() {
    this.localStorage.removeItem(this.accessTokenKey);
    this.localStorage.removeItem(this.refreshTokenKey);
  }

  login(identifier: string, secret: string) {
    return this.request({
      method: HttpMethod.POST,
      path: this.loginApiUrl,
      skipAuth: true,
      body: { identifier, secret },
    }).pipe(
      tap((response: any) => {
        this.storeTokens(response.access_token, response.refresh_token);
        return response;
      }),
    );
  }

  register(email: string, password: string, confirmPassword: string) {
    return this.request({
      method: HttpMethod.POST,
      path: this.registerApiUrl,
      skipAuth: true,
      body: { email, password, confirmPassword },
    }).pipe(switchMap(() => this.login(email, password)));
  }

  logout(result: () => void) {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http
        .post(
          this.logoutApiUrl,
          { access_token: this.getAccessToken() ?? '' },
          { context: new HttpContext().set(TOKEN_CONTEXT, '<refresh_token>') },
        )
        .subscribe({
          next: () => {
            this.clearTokens();
            result();
          },
          error: () => {
            this.clearTokens();
            result();
          },
        });
    } else {
      this.clearTokens();
      result();
    }
  }

  request<T>(config: RequestConfig): Observable<T> {
    const urlParts: string[] = [config.path];
    let options = {};

    if (!config.skipAuth) {
      if (!this.isLoggedIn()) {
        return EMPTY;
      }

      options = {
        context: new HttpContext().set(TOKEN_CONTEXT, '<access_token>'),
      };
    }

    if (config.headerResponse) {
      Object.assign(options, { observe: 'response' });
    }

    if (config.httpParams) {
      Object.assign(options, { params: config.httpParams });
    }

    if (config.method == undefined) {
      config.method = HttpMethod.POST;
    }

    const mergePaths = (paths: string[]) =>
      new URL(paths.map((p) => p.replace(/^\/+|\/+$/g, '')).join('/'), this.apiUrl);
    let url = mergePaths(urlParts).href;

    if (!url.endsWith('/')) {
      url += '/';
    }

    if (config.body == undefined) {
      return this.http.request<T>(config.method, url, options);
    }

    if (config.body != undefined) {
      Object.assign(options, { body: config.body });
    }

    return this.http.request<T>(config.method, url, options);
  }
}
