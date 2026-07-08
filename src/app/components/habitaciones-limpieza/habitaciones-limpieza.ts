import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; //  IMPORTANTE para el buscador
import { HotelService } from '../../services/hotel.service'; 
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-habitaciones-limpieza',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent], //  Agregamos FormsModule aquí
  templateUrl: './habitaciones-limpieza.html',
  styleUrls: ['./habitaciones-limpieza.css']
})
export class HabitacionesLimpieza implements OnInit {
  
  habitaciones: any[] = []; 
  reservas: any[] = []; //  Guardamos las reservas para cruzarlas
  filtroTexto: string = ''; // Variable para la barra de búsqueda

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    // Primero cargamos todas las reservas. Cuando termina, cargamos las habitaciones para cruzarlas
    this.hotelService.listarTodasLasReservas().subscribe({
      next: (res) => {
        this.reservas = res;
        this.cargarHabitaciones();
      },
      error: (err) => console.error("Error al cargar reservas:", err)
    });
  }

  cargarHabitaciones() {
    this.hotelService.listarHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data;
        this.automatizarEstados(); //  Llamamos a la magia apenas llegan los datos
      },
      error: (err) => console.error("Error al cargar las habitaciones:", err)
    });
  }

  //  LA MAGIA DE LA AUTOMATIZACIÓN 
  automatizarEstados() {
    const ahora = new Date();
    const hoy = new Date(ahora.getTime() - (ahora.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
    const horaActual = ahora.getHours(); 

    this.habitaciones.forEach(hab => {
      let tieneSalidaHoy = false;
      let tieneEntradaHoy = false;
      let estaEnMedio = false;

      // Filtramos las reservas activas
      const reservasActivas = this.reservas.filter(r => 
        r.numeroHabitacion === hab.numeroHabitacion && r.estado !== 'FINALIZADA' && r.estado !== 'CANCELADA'
      );

      for (const res of reservasActivas) {
        if (hoy > res.fechaEntrada && hoy < res.fechaSalida) { estaEnMedio = true; }
        if (hoy === res.fechaEntrada) { tieneEntradaHoy = true; }
        if (hoy === res.fechaSalida) { tieneSalidaHoy = true; }
      }

      let estadoFinal = 'DISPONIBLE';

      if (estaEnMedio) {
        estadoFinal = 'OCUPADA';
      } else if (tieneSalidaHoy && tieneEntradaHoy) {
        if (horaActual < 11) estadoFinal = 'OCUPADA';
        else if (horaActual >= 11 && horaActual < 14) estadoFinal = 'LIMPIEZA';
        else estadoFinal = 'OCUPADA';
      } else if (tieneSalidaHoy) {
        if (horaActual < 11) estadoFinal = 'OCUPADA';
        else if (horaActual >= 11 && horaActual < 14) estadoFinal = 'LIMPIEZA';
        else estadoFinal = 'DISPONIBLE';
      } else if (tieneEntradaHoy) {
        // CORRECCIÓN: Si hay una entrada hoy, se marca como OCUPADA todo el día 
        // para que el admin no la venda por error en la mañana.
        estadoFinal = 'OCUPADA'; 
      }

      hab.estado = estadoFinal;
    });
  }

  //  FUNCIÓN DEL BUSCADOR EN VIVO 
  get habitacionesFiltradas() {
    if (!this.filtroTexto) return this.habitaciones;
    
    const texto = this.filtroTexto.toLowerCase();
    return this.habitaciones.filter(hab => 
      hab.numeroHabitacion.toLowerCase().includes(texto) ||
      hab.tipoHabitacion.toLowerCase().includes(texto)
    );
  }
}

  