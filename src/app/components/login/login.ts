import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; 
import { Router, RouterLink } from '@angular/router'; // 👈 1. Agregamos RouterLink aquí arriba
import { AuthService } from '../../services/auth.service'; 
import { LoginRequestDTO } from '../../models/login-request.dto';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink], // 👈 2. Metemos RouterLink aquí para que funcione el enlace del HTML
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  
  credenciales: LoginRequestDTO = {
    correo: '',
    contrasena: ''
  };

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  iniciarSesion(): void {
    if (!this.credenciales.correo || !this.credenciales.contrasena) {
      alert('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    this.authService.login(this.credenciales).subscribe({
      next: (respuesta) => {
        if (respuesta === 'Login exitoso') {
          this.authService.setSession('ADMIN'); 
          alert('¡Inicio de sesión correcto! Bienvenido.');
          
          window.location.href = '/admin-dashboard'; 
        }
      },
      error: (err) => {
        console.error(err);
        alert('Credenciales incorrectas. Inténtalo de nuevo.');
      }
    });
  }
}