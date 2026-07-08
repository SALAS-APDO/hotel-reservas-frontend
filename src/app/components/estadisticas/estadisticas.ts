import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../services/hotel.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-estadisticas',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './estadisticas.html',
  styleUrls: ['./estadisticas.css']
})
export class EstadisticasComponent implements OnInit {
  recaudadoHoy: number = 0;
  recaudadoMes: number = 0;
  habitacionesOcupadas: number = 0;
  totalHabitaciones: number = 0; 
  
  metaDiaria: number = 2500; 
  metaMensual: number = 10000; 
  anioActual: number = new Date().getFullYear();

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

      this.hotelService.listarTodasLasReservas().subscribe(reservas => {
        // Obtenemos la fecha de hoy segura
        const fechaHoyStr = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().split('T')[0];
        
        const hoy = new Date();
        const mesActual = hoy.getMonth();

        let sumaHoy = 0;
        let sumaMes = 0;
        // Usamos Set para evitar contar la misma habitación dos veces
        const cuartosOcupados = new Set(); 

        reservas.forEach((res: any) => {
          if (res.estado === 'PENDIENTE' || res.estado === 'CONFIRMADA' || res.estado === 'FINALIZADA') {
            
            const [anioStr, mesStr, diaStr] = res.fechaEntrada.split('-');
            const inicio = new Date(Number(anioStr), Number(mesStr) - 1, Number(diaStr));
            
            const [anioF, mesF, diaF] = res.fechaSalida.split('-');
            const fin = new Date(Number(anioF), Number(mesF) - 1, Number(diaF));
            
            const diffTiempo = Math.abs(fin.getTime() - inicio.getTime());
            const dias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24)) || 1;
            
            const numeroHab = res.numeroHabitacion || res.habitacionNum;
            const habEncontrada = habs.find((h: any) => h.numeroHabitacion === numeroHab);
            const precioPorNoche = habEncontrada ? habEncontrada.precioPorNoche : 0;
            const precioTotal = dias * precioPorNoche;

            if (res.fechaEntrada === fechaHoyStr) { 
              sumaHoy += precioTotal; 
            }

            if (inicio.getFullYear() === this.anioActual) {
              const mesIndex = inicio.getMonth(); 
              this.ventasPorMes[mesIndex].total += precioTotal; 
              
              if (mesIndex === mesActual) { 
                sumaMes += precioTotal; 
              } 
            }

            // Un cuarto está ocupado si la fecha de hoy es mayor o igual a la entrada y menor a la salida.
            if (res.estado !== 'FINALIZADA' && res.estado !== 'CANCELADA') {
              if (fechaHoyStr >= res.fechaEntrada && fechaHoyStr < res.fechaSalida) { 
                cuartosOcupados.add(numeroHab); 
              }
            }
          }
        });

        this.recaudadoHoy = sumaHoy;
        this.recaudadoMes = sumaMes;
        this.habitacionesOcupadas = cuartosOcupados.size; // Extraemos la cantidad de habitaciones únicas

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
    });
  }

  get porcentajeMetaDiaria(): number {
    if (this.metaDiaria === 0) return 0;
    const porcentaje = (this.recaudadoHoy / this.metaDiaria) * 100;
    return porcentaje > 100 ? 100 : porcentaje; 
  }
}