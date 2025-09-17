import { HttpContextToken, HttpParams, HttpInterceptor, HttpClient, HttpRequest, HttpHandler, HttpEvent, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Observable, tap, catchError, finalize, EMPTY, throwError, switchMap } from 'rxjs';
import { environment } from "../environments/environment";
import { access } from 'fs';
import { LocalStorageService } from './storage.service';

/**
 * Defines a context token for storing the access token type.
 * The default value is "<access_token>".
 */
export const TOKEN_CONTEXT = new HttpContextToken<string>(() => "<access_token>");
/**
 * Enum representing the HTTP methods supported in the service.
 */
export enum HttpMethod {
  POST = "post",
  GET = "get",
  DELETE = "delete",
  PUT = "put",
}
/**
 * Interface defining the configuration for an HTTP request.
 */
export interface RequestConfig {
  path: string;                 // Endpoint path.
  formData?: FormData;          // Optional form data for the request.
  body?: any;                   // Optional request body.
  httpParams?: HttpParams;      // Optional HTTP parameters.
  method?: HttpMethod;          // HTTP method (default is POST).
  skipAuth?: boolean;           // Whether authentication should be skipped.
  headerResponse?: boolean;     // Whether to include headers in the response.
}
@Injectable({
  providedIn: 'root'
})
export class AuthService implements HttpInterceptor {
  private apiUrl = environment.apiUrl; // Base API URL.
  private loginApiUrl = environment.apiUrl + "/auth/login"; // Login endpoint.
  private registerApiUrl = environment.apiUrl + "/auth/register"; // Registration endpoint.
  private logoutApiUrl = environment.apiUrl + "/auth/logout"; // Logout endpoint.
  private refreshApiUrl = environment.apiUrl + "/auth/token/refresh"; // Token refresh endpoint.
  private accessTokenKey = 'gym_tracker_access_token'; // Local storage key for access token.
  private refreshTokenKey = 'gym_tracker_refresh_token'; // Local storage key for refresh token.
  private refreshTokenInProgress = false; // Flag indicating if token refresh is ongoing.
  private tokenRefreshedSource = new Subject<boolean>(); // Observable source for token refresh status.
  private tokenRefreshed$ = this.tokenRefreshedSource; // Observable for token refresh events.
  private tokenExpiredObserver: (() => void)[] = []; // List of token expiration observers.

  constructor(
    private http: HttpClient,
    private localStorage: LocalStorageService,
  ) {}

  /**
   * Registers an observer that gets notified when the token expires.
   */
  public addTokenExpiredObserver(observer: () => void) {
    this.tokenExpiredObserver.push(observer);
  }
  /**
   * Modifies the request header by adding the appropriate authorization token
   * based on the request context.
   */
  calculateRequestHeader(req: HttpRequest<any>) : HttpRequest<any> {
    let request = req.clone();
    if(req.context.has(TOKEN_CONTEXT)) {
      let typeOfAuthorization = req.context.get(TOKEN_CONTEXT);
      if (typeOfAuthorization == "<access_token>") {
        request = req.clone({
          headers: req.headers.set('authorization', `Bearer ${this.getAccessToken()}`)
        });
      } else if (typeOfAuthorization == "<refresh_token>") {
        request = req.clone({
          headers: req.headers.set('authorization', `Bearer ${this.getRefreshToken()}`)
        });
      }
    }
    return request;
  }
  /**
   * Intercepts outgoing HTTP requests, adding authentication headers
   * and handling potential errors.
   */
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let request = this.calculateRequestHeader(req);
    return next.handle(request).pipe(
      tap({
        next: (event: HttpEvent<any>) => {}
      }),
      catchError((_error) => {
        return this.handleResponseError(_error, req, next);
      }),
      finalize(() => { })
    );
  }
  /**
   * Attempts to refresh the authentication token.
   * If a refresh token is available, it sends a request to refresh the access token.
   */
  tryRefreshToken() {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      return this.http.post<any>(`${this.refreshApiUrl}`, null, {
        context: new HttpContext().set(TOKEN_CONTEXT, '<refresh_token>')
      }).pipe(
        tap((response: any) => {
          this.storeTokens(response.access_token, response.refresh_token);
          return EMPTY;
        })
      );
    } else {
      return throwError(() => new Error('No refresh token available, please log in again.'));
    }
  }
  /**
   * Manages the token refresh process.
   * Ensures that only one refresh request is in progress at a time.
   */
  refreshToken(): Observable<any> {
    if (this.refreshTokenInProgress) {
      console.log("Refresh token in progress");
      return new Observable(observer => {
        this.tokenRefreshed$.subscribe((refreshed) => {
          if(refreshed) {
            observer.next(true);
            observer.complete();
          } else {
            observer.error(new Error('Session expired, please log in again.'));
          }
        });
      });
    } else {
      if(!this.isLoggedIn()) {
        this.tokenRefreshedSource.next(false);
        this.clearTokens();
        return EMPTY;
      } else {
        this.refreshTokenInProgress = true;
        return this.tryRefreshToken().pipe(
          tap(() => {
            this.refreshTokenInProgress = false;
            this.tokenRefreshedSource.next(true);
          }),
          catchError((_err) => {
            this.tokenRefreshedSource.next(false);
            this.refreshTokenInProgress = false;
            this.clearTokens();
            return throwError(() => new Error('Session expired, please log in again.'));
          })
        );
      }
    }
  }
  /**
   * Handles HTTP response errors, particularly handling token expiration (401 errors).
   */
  private handleResponseError(error: HttpErrorResponse, request?: HttpRequest<any>, next?: HttpHandler) {
    if(error.status === 401) {
      return this.refreshToken().pipe(
        switchMap(() => {
          if(request !== undefined && next !== undefined) {
            let httpRequest = this.calculateRequestHeader(request);
            return next.handle(httpRequest);
          }
          return EMPTY;
        })
      );
    } else {
      let errorMessage = 'An unknown error occurred!';
      if (error.error instanceof ErrorEvent) {
        // Client-side error
        errorMessage = `Error: ${error.error.message}`;
      } else {
        // Server-side error
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
      return throwError(() => new Error(errorMessage));
    }
  }
  /**
   * Checks whether a given token has expired.
   */
  private tokenExpired(token: string) {
    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }
  /**
   * Checks if the user is currently logged in based on token validity.
   */
  public isLoggedIn(): boolean {
    const token = this.localStorage.getItem(this.refreshTokenKey)
    if(token != undefined) {
      if(!this.tokenExpired(token)) {
        return true;
      } else {
        this.clearTokens();
        this.tokenExpiredObserver.forEach(observer => {
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
  /**
   * Logs in the user by sending credentials and storing the received tokens.
   */
  login(identifier: string, secret: string) {
    return this.request({
      method: HttpMethod.POST,
      path: this.loginApiUrl,
      skipAuth: true,
      body: { identifier, secret}
    }).pipe(
      tap((response: any) => {
        this.storeTokens(response.access_token, response.refresh_token);
        return response;
      }),
    )
  }

  register(email: string, password: string, confirmPassword: string) {
    return this.request({
      method: HttpMethod.POST,
      path: this.registerApiUrl,
      skipAuth: true,
      body: { email, password, confirmPassword}
    }).pipe(
      switchMap(() => this.login(email, password)),
    )
  }

  /**
   * Logs out the user by invalidating tokens.
   */
  logout(result: () => void) {
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.http.post(
        this.logoutApiUrl, 
        { access_token: this.getAccessToken() ?? ""},
        { context: new HttpContext().set(TOKEN_CONTEXT, '<refresh_token>')}
      ).subscribe({
        next: () => {
          this.clearTokens();
          result();
        },
        error: () => {
          this.clearTokens();
          result();
        }
      });
    } else {
      this.clearTokens();
      result();
    }
  }
  /**
   * Sends a configurable HTTP request with optional authentication.
   */
  request<T>(config: RequestConfig) : Observable<T> {
    let urlParts : string[] = [config.path];
    let options = {};
    if(!config.skipAuth) {
      if(!this.isLoggedIn()) {
        return EMPTY;
      }
      options = {
        context: new HttpContext().set(TOKEN_CONTEXT, '<access_token>')
      }
    }
    if(config.headerResponse) {
      Object.assign(options, {observe: 'response'})
    }
    if(config.httpParams) {
      Object.assign(options, {params: config.httpParams})
    }
    if(config.method == undefined) {
      config.method = HttpMethod.POST;
    }
    let mergePaths = (paths: string[]) => new URL(paths.map(p => p.replace(/^\/+|\/+$/g, '')).join('/'), this.apiUrl);
    let url = mergePaths(urlParts).href;
    if(!url.endsWith("/")) {
      url += "/";
    }
    if (config.formData == undefined && config.body == undefined) {
      return this.http.request<T>(config.method, url, options);
    } else {
      if (config.body != undefined) {
        Object.assign(options, {body: config.body})
      } else if (config.formData != undefined) {
        Object.assign(options, {body: config.formData})
      }
      return this.http.request<T>(config.method, url, options);
    }
  }
}