import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // 👈 Herramientas de rutas
import { AuthService } from '../../services/auth.service'; // 👈 Tu servicio para cerrar sesión
import { IconComponent } from '../../components/icon/icon.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  templateUrl: './admin-layout.html', // (Ojo: verifica si tu archivo termina en .html o .component.html)
  styleUrls: ['./admin-layout.css']   // (Ojo: igual aquí con el .css)
})
export class AdminLayout {

  sidebarOpen: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  cerrarSesionAdmin() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
