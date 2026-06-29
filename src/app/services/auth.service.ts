import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { LoginRequestDTO } from '../models/login-request.dto';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  // Estado reactivo para login y rol de administrador
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());
  private adminStatus = new BehaviorSubject<boolean>(this.isAdminSession());

  constructor(private http: HttpClient) { }

  private hasToken(): boolean {
    return localStorage.getItem('isAdminLogged') === 'true';
  }

  private isAdminSession(): boolean {
    return localStorage.getItem('userRole') === 'ADMIN';
  }

  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  // Nuevo método para que el Navbar sepa si debe mostrar el botón
  esAdministrador(): boolean {
    return this.adminStatus.value;
  }

  login(credenciales: LoginRequestDTO): Observable<string> {
    return this.http.post(this.apiUrl + '/login', credenciales, { responseType: 'text' });
  }

  // Actualizado para guardar también el rol
  setSession(role: string): void {
    localStorage.setItem('isAdminLogged', 'true');
    localStorage.setItem('userRole', role); // Guardamos el rol (ej: 'ADMIN')
    
    this.loggedIn.next(true);
    this.adminStatus.next(role === 'ADMIN');
  }

  logout(): void {
    localStorage.removeItem('isAdminLogged');
    localStorage.removeItem('userRole'); // Limpiamos el rol
    
    this.loggedIn.next(false);
    this.adminStatus.next(false);
  }
}