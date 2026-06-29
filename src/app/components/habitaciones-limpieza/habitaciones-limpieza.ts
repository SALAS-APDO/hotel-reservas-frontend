import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../services/hotel.service'; 

@Component({
  selector: 'app-habitaciones-limpieza',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './habitaciones-limpieza.html',
  styleUrls: ['./habitaciones-limpieza.css']
})
export class HabitacionesLimpieza implements OnInit {
  
  habitaciones: any[] = []; // 👈 Aquí guardaremos la lista de tu base de datos

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.cargarHabitaciones();
  }

  cargarHabitaciones() {
    this.hotelService.listarHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data;
        console.log("Carga exitosa de habitaciones:", data); // 👈 Lo imprimimos para verificar
      },
      error: (err) => console.error("Error al cargar las habitaciones:", err)
    });
  }

  // 👇 NUEVA FUNCIÓN PARA CAMBIAR EL ESTADO 👇
  cambiarEstado(hab: any, event: any) {
    const nuevoEstado = event.target.value;
    
    // Armamos el DTO exactamente como lo espera tu backend en Java
    const datosActualizados = {
      numeroHabitacion: hab.numeroHabitacion,
      tipoHabitacion: hab.tipoHabitacion,
      capacidadMaxima: hab.capacidadMaxima,
      precioPorNoche: hab.precioPorNoche,
      estado: nuevoEstado
    };

    // Llamamos al servicio para guardar en la base de datos
    this.hotelService.actualizarHabitacion(hab.idHabitacion, datosActualizados).subscribe({
      next: (resp) => {
        // Magia: Actualizamos el estado en la tarjeta sin recargar la página
        hab.estado = nuevoEstado;
        console.log(`Habitación ${hab.numeroHabitacion} actualizada a ${nuevoEstado}`);
      },
      error: (err) => {
        console.error("Error al actualizar el estado:", err);
        // Si falla, recargamos la lista para volver al estado real de la BD
        this.cargarHabitaciones();
      }
    });
  }
}
