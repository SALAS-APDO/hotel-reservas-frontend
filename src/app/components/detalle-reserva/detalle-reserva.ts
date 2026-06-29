import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ReservaService } from '../../services/reserva'; // Conecta con el servicio del Paso 1

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

  // Montos calculados para mostrar en el resumen de la derecha
  subtotal: number = 0;
  igv: number = 0;
  total: number = 0;

  // Formulario vinculado con tu ReservaRequestDTO en Java
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

  constructor(private router: Router, private reservaService: ReservaService) {
    // Capturamos la habitación y fechas que viajan en el "maletero" del Router
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      this.habitacion = navigation.extras.state['habitacionSeleccionada'];
      this.busqueda = navigation.extras.state['datosBusqueda'];
    }
  }

  ngOnInit() {
    // Si entran aquí a la fuerza sin buscar nada, los mandamos al Home
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
    
    // Pasamos de milisegundos a días
    this.cantNoches = Math.max(1, Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24)));

    // Cálculos matemáticos de la tarifa
    this.total = this.habitacion.precioPorNoche * this.cantNoches;
    this.subtotal = Number((this.total / 1.18).toFixed(2));
    this.igv = Number((this.total - this.subtotal).toFixed(2));
  }

  confirmarReserva() {
    // Estructura exacta que espera recibir tu Spring Boot
    const dtoFinal = {
      ...this.formulario,
      idHabitacion: this.habitacion.idHabitacion,
      fechaEntrada: this.busqueda.fechaLlegada,
      fechaSalida: this.busqueda.fechaSalida,
      numAdultos: this.busqueda.adultos,
      numNinos: this.busqueda.ninos,
      idCliente: 7 // Tu id_cliente provisional para pruebas
    };

    this.reservaService.registrarReserva(dtoFinal).subscribe({
      next: (respuesta) => {
        alert("🎉 " + respuesta); // Saldrá "Reserva registrada con éxito"
        this.router.navigate(['/']);
      },
      error: (err) => {
        console.error("Error al guardar reserva:", err);
        alert("Hubo un error al procesar la reserva. Verifica los datos.");
      }
    });
  }
}