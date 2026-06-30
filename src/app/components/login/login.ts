import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LoginRequestDTO } from '../../models/login-request.dto';
import { IconComponent } from '../icon/icon.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent],
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
  ) { }

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