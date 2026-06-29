import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; 
import { AuthService } from '../../services/auth.service'; 

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isLogged = false;
  isAdmin = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // Escuchamos el estado de login
    this.authService.isLoggedIn().subscribe(state => {
      this.isLogged = state;
      // Actualizamos el rol inmediatamente cuando cambia el estado de login
      this.actualizarEstadoAdmin();
    });
  }

  // Método auxiliar para no repetir código
  private actualizarEstadoAdmin(): void {
    this.isAdmin = this.authService.esAdministrador();
  }

  cerrarSesion(): void {
    this.authService.logout();
    this.isAdmin = false;
    this.router.navigate(['/']);
  }
}