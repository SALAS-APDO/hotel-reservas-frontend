import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../services/hotel.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // Asegúrate de tener enlazado tu CSS aquí
})
export class HomeComponent implements OnInit {
  hoteles: any[] = [];
  busqueda = { hotelId: '', fechaLlegada: '', fechaSalida: '', adultos: 2, ninos: 0 };
  
  habitacionesDisponibles: any[] = [];
  
  // ✨ NUEVA VARIABLE: Para guardar el nombre del hotel seleccionado
  nombreHotelSeleccionado: string = ""; 

  haBuscado: boolean = false;

  // ✨ AQUÍ DEFINIMOS LA VARIABLE PARA EL BLOQUEO
  fechaMinima: string = "";

  constructor(private hotelService: HotelService, private router: Router) {}

  ngOnInit() {
    // ✨ ESTO CALCULA EL DÍA DE HOY AUTOMÁTICAMENTE
    this.fechaMinima = new Date().toISOString().split('T')[0];

    this.hotelService.listarHoteles().subscribe({
      next: (data) => {
        this.hoteles = data;
      },
      error: (err) => console.error("Error al traer hoteles:", err)
    });
  }

  buscarReserva() {
    // 1. Candado de seguridad: Evitar fechas pasadas (usando la variable fechaMinima)
    if (this.busqueda.fechaLlegada < this.fechaMinima) {
      alert("¡No puedes seleccionar una fecha pasada!");
      return;
    }

    // 2. Candado de seguridad: Evitar salida antes o igual a la llegada
    if (this.busqueda.fechaSalida <= this.busqueda.fechaLlegada) {
      alert("La fecha de salida debe ser posterior a la de llegada.");
      return;
    }

    // 3. Validación de campos obligatorios
    if (!this.busqueda.hotelId || !this.busqueda.fechaLlegada || !this.busqueda.fechaSalida) {
      alert("Por favor, completa todos los campos antes de buscar.");
      return;
    }

    // 4. Capturar el nombre del hotel para el título dinámico
    const hotelEncontrado = this.hoteles.find(h => h.idHotel == this.busqueda.hotelId);
    this.nombreHotelSeleccionado = hotelEncontrado ? hotelEncontrado.nombre : "nuestro hotel";

    // 5. Llamada al servicio
    this.hotelService.buscarHabitaciones(
      this.busqueda.hotelId, 
      this.busqueda.fechaLlegada, 
      this.busqueda.fechaSalida,
      this.busqueda.adultos,
      this.busqueda.ninos
    ).subscribe({
      next: (data) => {
        this.habitacionesDisponibles = data;
        this.haBuscado = true; 
        console.log("Habitaciones recibidas:", data);
      },
      error: (err) => {
        console.error("Error al buscar:", err);
        alert("Hubo un error al buscar. Revisa la consola.");
      }
    });
  }

  irADetalle(habitacion: any) {
    // Viajamos a la nueva ruta y nos llevamos el objeto de la habitación y de la búsqueda entera
    this.router.navigate(['/detalle-reserva'], {
      state: {
        habitacionSeleccionada: habitacion,
        datosBusqueda: this.busqueda
      }
    });
  }
}