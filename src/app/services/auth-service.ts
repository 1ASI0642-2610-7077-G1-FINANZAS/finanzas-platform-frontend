import {inject, Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient} from '@angular/common/http';
import {AuthRequest} from '../model/auth-request';
import {AuthResponse} from '../model/auth-response';
import {map, Observable} from 'rxjs';
import {Router} from '@angular/router';
import {RegisterRequest} from '../model/register-request';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private url = environment.apiUrl
  private http: HttpClient = inject(HttpClient);
  private router = inject(Router);
  constructor() { }

  login(credentials: AuthRequest): Observable<any> {
    return this.http.post<AuthResponse>(this.url + '/api/auth/login', credentials)
      .pipe(
        map(resp => {
          localStorage.setItem('token',resp.token);
          localStorage.setItem('rol',JSON.stringify(resp.rol));
          return resp;
        })
      )
  }

  register(credentials: RegisterRequest): Observable<any> {
    return this.http.post(this.url + '/api/auth/register', credentials
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    localStorage.removeItem('userId');
    this.router.navigateByUrl('/QCSFINANCE/authenticate');
  }

  getToken() : string | null {
    return localStorage.getItem('token');
  }

  getRoles(): string[] {
    const stored = localStorage.getItem('roles');
    return stored ? JSON.parse(stored) : [];
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }


}
