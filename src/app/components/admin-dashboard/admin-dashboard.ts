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
  fechaHoy: string = new Date().toISOString().split('T')[0];

  mostrarModalEdicion: boolean = false;
  reservaEditando: any = {};

  mostrarModalNuevo: boolean = false;
  nuevaReserva: any = {};

  constructor(
    private hotelService: HotelService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarReservas();
    this.cargarHabitaciones();
  }

  get reservasFiltradas() {
    if (!this.filtroTexto) return this.reservas; 
    
    const texto = this.filtroTexto.toLowerCase();
    return this.reservas.filter(reserva => 
      (reserva.dni && reserva.dni.includes(texto)) ||
      (reserva.clienteNombre && reserva.clienteNombre.toLowerCase().includes(texto))
    );
  }

  cargarReservas() {
    this.hotelService.listarTodasLasReservas().subscribe({
      next: (data) => {
        this.reservas = data;
      },
      error: (err) => console.error("Error al cargar reservas:", err)
    });
  }

  cargarHabitaciones() {
    this.hotelService.listarHabitaciones().subscribe({
      next: (data) => {
        this.habitaciones = data;
      },
      error: (err) => console.error("Error al cargar habitaciones:", err)
    });
  }

  cerrarSesionAdmin() {
    this.authService.logout(); 
    this.router.navigate(['/login']); 
  }

  borrarReserva(id: number) {
    if (confirm('¿Estás seguro de eliminar esta reserva?')) {
      this.hotelService.eliminarReserva(id).subscribe(() => {
        this.cargarReservas(); 
      });
    }
  }

  confirmarReserva(reserva: any) {
    const dto = {
      fechaEntrada: reserva.fechaEntrada,
      fechaSalida: reserva.fechaSalida,
      estado: 'CONFIRMADA' 
    };

    this.hotelService.actualizarReserva(reserva.id, dto).subscribe({
      next: () => this.cargarReservas(),
      error: (err) => alert("Error al confirmar la reserva.")
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
      error: (err) => alert("Error al guardar la edición. Verifica las fechas.")
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
        alert("Hubo un error al registrar la reserva. Asegúrate de llenar todos los campos obligatorios y que las fechas sean correctas.");
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
    link.download = `Reporte_Inti_${fechaHoy}.csv`;
    
    link.click();
    window.URL.revokeObjectURL(url);
  }
}