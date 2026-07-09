import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva';
import { WhatsappService } from '../../services/whatsapp.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-detalle-reserva',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './detalle-reserva.html',
  styleUrl: './detalle-reserva.css'
})
export class DetalleReserva implements OnInit {
  habitacion: any = null;
  busqueda: any = null;
  cantNoches: number = 1;

  subtotal: number = 0;
  igv: number = 0;
  total: number = 0;

  formulario = {
    nombre: '',
    apellido: '',
    tipoDocumento: 'DNI',
    numeroDocumento: '',
    correo: '',
    telefono: '',
    tipoComprobante: 'BOLETA',
    rucEmpresa: ''
  };

  mostrarModalExito: boolean = false;
  whatsappUrl$!: Observable<string>;

  constructor(
    private router: Router,
    private reservaService: ReservaService,
    private whatsappService: WhatsappService
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.habitacion = navigation.extras.state['habitacionSeleccionada'];
      this.busqueda = navigation.extras.state['datosBusqueda'];
    }
  }

  ngOnInit() {
    this.whatsappUrl$ = this.whatsappService.obtenerUrlDinamica('Vengo de la página de confirmación de reserva y deseo realizar una consulta sobre mi proceso.');

    if (!this.habitacion || !this.busqueda) {
      this.router.navigate(['/']);
      return;
    }
    this.calcularPrecios();
  }

  calcularPrecios() {
    const entrada = new Date(this.busqueda.fechaLlegada);
    const salida = new Date(this.busqueda.fechaSalida);
    const diferenciaMs = salida.getTime() - entrada.getTime();

    this.cantNoches = Math.max(1, Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)));

    this.total = this.habitacion.precioPorNoche * this.cantNoches;
    this.subtotal = Number((this.total / 1.18).toFixed(2));
    this.igv = Number((this.total - this.subtotal).toFixed(2));
  }

  confirmarReserva() {
    console.log('Habitación recibida:', this.habitacion);

    const dtoFinal = {
      ...this.formulario,
      idHabitacion: this.habitacion.idHabitacion || this.habitacion.id,
      fechaEntrada: this.busqueda.fechaLlegada,
      fechaSalida: this.busqueda.fechaSalida,
      numAdultos: this.busqueda.adultos,
      numNinos: this.busqueda.ninos,
      idCliente: 8
    };

    console.log('DTO enviado:', dtoFinal);

    this.reservaService.registrarReserva(dtoFinal).subscribe({
      next: () => {
        this.mostrarModalExito = true;
      },
      error: (err) => {
        console.error('Error real:', err);
        alert("Hubo un error al procesar la reserva. Verifica los datos.");
      }
    });
  }

  cerrarModalExito() {
    this.mostrarModalExito = false;
    this.router.navigate(['/']);
  }
}