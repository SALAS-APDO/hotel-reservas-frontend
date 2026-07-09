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

  constructor(private hotelService: HotelService) { }

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

      // 🛏️ Habitaciones ocupadas: directamente del campo 'estado' de la BD
      this.habitacionesOcupadas = habs.filter((h: any) => h.estado === 'OCUPADA').length;

      this.hotelService.listarTodasLasReservas().subscribe(reservas => {
        const hoy = new Date();
        const mesActual = hoy.getMonth();
        const offset = hoy.getTimezoneOffset() * 60000;
        const fechaLocal = new Date(hoy.getTime() - offset);
        const fechaHoyStr = fechaLocal.toISOString().split('T')[0];

        let sumaHoy = 0;
        let sumaMes = 0;

        reservas.forEach((res: any) => {
          if (res.estado === 'PENDIENTE' || res.estado === 'CONFIRMADA' || res.estado === 'FINALIZADA') {

            const [anioStr, mesStr, diaStr] = res.fechaEntrada.split('-');
            const inicio = new Date(Number(anioStr), Number(mesStr) - 1, Number(diaStr));

            const [anioF, mesF, diaF] = res.fechaSalida.split('-');
            const fin = new Date(Number(anioF), Number(mesF) - 1, Number(diaF));

            const diffTiempo = Math.abs(fin.getTime() - inicio.getTime());
            const dias = Math.ceil(diffTiempo / (1000 * 60 * 60 * 24)) || 1;

            const numeroHab = res.numeroHabitacion || res.habitacionNum || res.idHabitacion;
            const habEncontrada = habs.find((h: any) =>
              h.numeroHabitacion === numeroHab || h.idHabitacion === numeroHab
            );
            const precioPorNoche = habEncontrada
              ? habEncontrada.precioPorNoche
              : (res.precioPorNoche || 0);
            const precioTotal = dias * precioPorNoche;

            // 💰 Recaudado HOY: reservas que hacen CHECK-IN hoy (pago en el ingreso)
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
          }
        });

        this.recaudadoHoy = sumaHoy;
        this.recaudadoMes = sumaMes;

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