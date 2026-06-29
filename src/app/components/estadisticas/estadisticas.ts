import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../services/hotel.service';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './estadisticas.html',
  styleUrls: ['./estadisticas.css']
})
export class EstadisticasComponent implements OnInit {
  // Variables de Hoy y Mes
  recaudadoHoy: number = 0;
  recaudadoMes: number = 0;
  habitacionesOcupadas: number = 0;
  totalHabitaciones: number = 0; 
  
  // Metas (Lógica de Retail)
  metaDiaria: number = 2500; 
  metaMensual: number = 10000; // Meta de venta por mes para evaluar el color
  anioActual: number = new Date().getFullYear();

  // Historial Anual
  ventasPorMes: any[] = [];
  
  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.inicializarMeses();
    this.cargarDatos();
  }

  inicializarMeses() {
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    this.ventasPorMes = nombresMeses.map(nombre => ({ nombre: nombre, total: 0, estado: 'pendiente' }));
  }

  cargarDatos() {
    this.hotelService.listarHabitaciones().subscribe(habs => {
      this.totalHabitaciones = habs.length;
    });

    this.hotelService.listarTodasLasReservas().subscribe(reservas => {
      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const offset = hoy.getTimezoneOffset() * 60000;
      const fechaLocal = new Date(hoy.getTime() - offset);
      const fechaHoyStr = fechaLocal.toISOString().split('T')[0];

      let sumaHoy = 0;
      let sumaMes = 0;
      let ocupadas = 0;

      reservas.forEach((res: any) => {
        if (res.estado === 'PENDIENTE' || res.estado === 'CONFIRMADA') {
          
          // Solución infalible para zonas horarias: cortamos el texto YYYY-MM-DD
          const [anioStr, mesStr, diaStr] = res.fechaEntrada.split('-');
          const inicio = new Date(Number(anioStr), Number(mesStr) - 1, Number(diaStr));
          
          const fin = new Date(res.fechaSalida);
          const diffTiempo = Math.abs(fin.getTime() - inicio.getTime());
          const dias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24)) || 1;
          const precioTotal = dias * (res.habitacion?.precioPorNoche || 0);

          // Lógica Diaria
          if (res.fechaEntrada === fechaHoyStr) { sumaHoy += precioTotal; }

          // Lógica Mensual y Anual
          if (inicio.getFullYear() === this.anioActual) {
            const mesIndex = inicio.getMonth(); // 0 a 11
            this.ventasPorMes[mesIndex].total += precioTotal; // Sumamos al mes correspondiente
            
            if (mesIndex === mesActual) { sumaMes += precioTotal; } // Sumamos al "Acumulado del Mes"
          }

          // Habitaciones Ocupadas Hoy
          if (fechaLocal >= inicio && fechaLocal <= fin) { ocupadas++; }
        }
      });

      this.recaudadoHoy = sumaHoy;
      this.recaudadoMes = sumaMes;
      this.habitacionesOcupadas = ocupadas;

      // Evaluar los colores de los meses (Rojo, Verde o Gris si aún no llega)
      this.ventasPorMes.forEach((mes, index) => {
        if (index > mesActual && mes.total === 0) {
          mes.estado = 'futuro';
        } else if (mes.total >= this.metaMensual) {
          mes.estado = 'alcanzado';
        } else {
          mes.estado = 'bajo';
        }
      });
    });
  }

  get porcentajeMetaDiaria(): number {
    if (this.metaDiaria === 0) return 0;
    const porcentaje = (this.recaudadoHoy / this.metaDiaria) * 100;
    return porcentaje > 100 ? 100 : porcentaje; 
  }
}