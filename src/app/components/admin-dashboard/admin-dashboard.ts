import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; 
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { AuthService } from '../../services/auth.service'; 
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboard implements OnInit {
  reservas: any[] = []; 
  habitaciones: any[] = [];
  filtroTexto: string = '';
  fechaHoy: string = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().split('T')[0];
  vistaActual: 'ACTIVAS' | 'HISTORIAL' = 'ACTIVAS';
  mostrarModalEdicion: boolean = false;
  reservaEditando: any = {};
  mostrarModalNuevo: boolean = false;
  nuevaReserva: any = {};
  mostrarModalConfirmacion: boolean = false;
  reservaIdAEliminar: number = 0;

  constructor(
    private hotelService: HotelService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarReservas();
    this.cargarHabitaciones();
  }

  cambiarVista(vista: 'ACTIVAS' | 'HISTORIAL') {
    this.vistaActual = vista;
  }

  get reservasFiltradas() {
    let listaBase = this.reservas.filter(reserva => {
      if (this.vistaActual === 'ACTIVAS') {
        return reserva.estado !== 'FINALIZADA';
      } else {
        return reserva.estado === 'FINALIZADA';
      }
    });

    if (!this.filtroTexto) return listaBase; 
    
    const texto = this.filtroTexto.toLowerCase();
    return listaBase.filter(reserva => 
      (reserva.dni && reserva.dni.includes(texto)) ||
      (reserva.clienteNombre && reserva.clienteNombre.toLowerCase().includes(texto))
    );
  }

  cargarReservas() {
    this.hotelService.listarTodasLasReservas().subscribe({
      next: (data) => {
        this.reservas = data;
      },
      error: (err) => console.error(err)
    });
  }

  cargarHabitaciones() {
    this.hotelService.listarHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data;
      },
      error: (err) => console.error(err)
    });
  }

  cerrarSesionAdmin() {
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }

  abrirModalConfirmacion(id: number) {
    this.reservaIdAEliminar = id;
    this.mostrarModalConfirmacion = true;
  }

  cerrarModalConfirmacion() {
    this.mostrarModalConfirmacion = false;
    this.reservaIdAEliminar = 0;
  }

  borrarReserva() {
    this.hotelService.eliminarReserva(this.reservaIdAEliminar).subscribe(() => {
      this.cargarReservas(); 
      this.cerrarModalConfirmacion();
    });
  }

  confirmarReserva(reserva: any) {
    const dto = {
      fechaEntrada: reserva.fechaEntrada,
      fechaSalida: reserva.fechaSalida,
      estado: 'CONFIRMADA' 
    };

    this.hotelService.actualizarReserva(reserva.id, dto).subscribe({
      next: () => this.cargarReservas(),
      error: (err) => alert("Error")
    });
  }

  abrirModalEditar(reserva: any) {
    this.reservaEditando = { ...reserva }; 
    this.mostrarModalEdicion = true;
  }

  cerrarModal() {
    this.mostrarModalEdicion = false;
  }

  guardarEdicion() {
    const dto = {
      fechaEntrada: this.reservaEditando.fechaEntrada,
      fechaSalida: this.reservaEditando.fechaSalida,
      estado: this.reservaEditando.estado
    };

    this.hotelService.actualizarReserva(this.reservaEditando.id, dto).subscribe({
      next: () => {
        this.cargarReservas();
        this.cerrarModal();
      },
      error: (err) => alert("Error")
    });
  }

  abrirModalNuevo() {
    this.nuevaReserva = {
      tipoDocumento: 'DNI',
      tipoComprobante: 'BOLETA',
      numAdultos: 1,
      numNinos: 0,
      fechaEntrada: this.fechaHoy,
      fechaSalida: '',
      idCliente: 0 
    };
    this.mostrarModalNuevo = true;
  }

  cerrarModalNuevo() {
    this.mostrarModalNuevo = false;
  }

  guardarNuevaReserva() {
    this.hotelService.registrarReserva(this.nuevaReserva).subscribe({
      next: (mensaje) => {
        this.cargarReservas(); 
        this.cerrarModalNuevo(); 
      },
      error: (err) => {
        alert("Error");
      }
    });
  }

  descargarReporteExcel() {
    let csv = 'ID;Cliente;DNI;Sede;Habitacion;Fecha Ingreso;Fecha Salida;Estado\n';

    this.reservasFiltradas.forEach((res: any) => {
      const id = res.id || '';
      const cliente = res.clienteNombre || '';
      const dni = res.dni || '';
      const sede = res.nombreSede || '';
      const habitacion = res.numeroHabitacion || '';
      const ingreso = res.fechaEntrada || '';
      const salida = res.fechaSalida || '';
      const estado = res.estado || '';

      csv += `#${id};${cliente};${dni};${sede};${habitacion};${ingreso};${salida};${estado}\n`;
    });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fechaHoy = new Date().toISOString().split('T')[0];
    link.download = `Reporte_UPN_${fechaHoy}.csv`;
    
    link.click();
    window.URL.revokeObjectURL(url);
  }
  obtenerSede(numeroHabitacion: string): string {
    if (!numeroHabitacion) return '';
    const primerDigito = numeroHabitacion.match(/\d/); 
    if (primerDigito) {
      if (primerDigito[0] === '1') return 'Sede Los Olivos';
      if (primerDigito[0] === '2') return 'Sede Breña';
      if (primerDigito[0] === '3') return 'Sede Comas';
    }
    return 'Sede UPN';
  }

  // CON ESTO COMPAÑEROS VERIFICAMOS SI LA HABITACION CHOCA CON LAS FECHAS DEL ADMIN
  estaHabitacionOcupada(numeroHabitacion: string): boolean {
    if (!this.nuevaReserva.fechaEntrada || !this.nuevaReserva.fechaSalida) return false;

    // Buscamos todas las reservas de esa habitación
    const reservasHab = this.reservas.filter(r => 
      r.numeroHabitacion === numeroHabitacion && r.estado !== 'FINALIZADA' && r.estado !== 'CANCELADA'
    );

    // Cruzamos las fechas
    for (const res of reservasHab) {
      if (this.nuevaReserva.fechaEntrada < res.fechaSalida && this.nuevaReserva.fechaSalida > res.fechaEntrada) {
        return true; // ¡Hay choque de fechas!
      }
    }
    return false; // Está libre para las fechas elegidas
  }
}