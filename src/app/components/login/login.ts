import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginRequestDTO } from '../../models/login-request.dto';
import { IconComponent } from '../icon/icon.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  credenciales: LoginRequestDTO = {
    correo: '',
    contrasena: ''
  };

  mostrarToast: boolean = false;
  mensajeToast: string = '';
  tipoToast: 'exito' | 'error' | 'advertencia' = 'exito';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  mostrarNotificacion(mensaje: string, tipo: 'exito' | 'error' | 'advertencia') {
    this.mensajeToast = mensaje;
    this.tipoToast = tipo;
    this.mostrarToast = true;

    setTimeout(() => {
      this.mostrarToast = false;
    }, 3000);
  }

  iniciarSesion(): void {
    if (!this.credenciales.correo || !this.credenciales.contrasena) {
      this.mostrarNotificacion('Por favor, ingresa tu correo y contraseña.', 'advertencia');
      return;
    }

    this.authService.login(this.credenciales).subscribe({
      next: (respuesta) => {
        if (respuesta === 'Login exitoso') {
          this.authService.setSession('ADMIN');
          this.mostrarNotificacion('¡Inicio de sesión correcto! Redirigiendo al Panel...', 'exito');

          setTimeout(() => {
            window.location.href = '/admin-dashboard';
          }, 1500);
        }
      },
      error: (err) => {
        console.error(err);
        this.mostrarNotificacion('Credenciales incorrectas. Inténtalo de nuevo.', 'error');
      }
    });
  }
}