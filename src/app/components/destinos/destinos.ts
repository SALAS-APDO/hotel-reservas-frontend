import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-destinos',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './destinos.html',
  styleUrl: './destinos.css',
})
export class Destinos implements OnInit {
  hoteles: any[] = [];

  constructor(private hotelService: HotelService) { }

  ngOnInit(): void {
    this.hotelService.listarHoteles().subscribe({
      next: (data) => {
        this.hoteles = data;
      },
      error: (err) => console.error('Error al cargar hoteles:', err)
    });
  }

  obtenerImagenPorDefecto(nombre: string): string {
    const nombreLower = (nombre || '').toLowerCase();
    if (nombreLower.includes('andes')) {
      return 'assets/sede-andes.jpg';
    } else if (nombreLower.includes('luna')) {
      return 'assets/sede-luna.jpg';
    } else if (nombreLower.includes('sol')) {
      return 'assets/sede-sol.jpg';
    }
    return 'assets/fondo-1.jpg';
  }

  obtenerIcono(nombre: string): string {
    const nombreLower = (nombre || '').toLowerCase();
    if (nombreLower.includes('andes')) {
      return 'mountain';
    } else if (nombreLower.includes('luna')) {
      return 'moon';
    } else if (nombreLower.includes('sol')) {
      return 'sun';
    }
    return 'hotel';
  }

  obtenerTextoBadge(nombre: string, ciudad: string): string {
    const nombreLower = (nombre || '').toLowerCase();
    if (nombreLower.includes('andes')) {
      return 'Montaña';
    } else if (nombreLower.includes('luna')) {
      return 'Romance & Relax';
    } else if (nombreLower.includes('sol')) {
      return 'Sol & Piscina';
    }
    return ciudad || 'Exclusivo';
  }
}
