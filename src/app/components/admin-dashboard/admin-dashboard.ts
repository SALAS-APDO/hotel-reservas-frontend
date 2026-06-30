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
  habitaciones: any[] = []; // 👈 Lista de habitaciones para el desplegable de nueva reserva
  filtroTexto: string = '';
  fechaHoy: string = new Date().toISOString().split('T')[0];

  // 🌟 VARIABLES PARA EL MODAL DE EDICIÓN
  mostrarModalEdicion: boolean = false;
  reservaEditando: any = {};

  // 🌟 VARIABLES PARA EL MODAL DE NUEVA RESERVA
  mostrarModalNuevo: boolean = false;
  nuevaReserva: any = {};

  constructor(
    private hotelService: HotelService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarReservas();
    this.cargarHabitaciones(); // Cargamos las habitaciones al iniciar
  }

  get reservasFiltradas() {
    if (!this.filtroTexto) return this.reservas; 
    
    const texto = this.filtroTexto.toLowerCase();
    return this.reservas.filter(reserva => 
      (reserva.cliente?.numeroDocumento && reserva.cliente.numeroDocumento.includes(texto)) ||
      (reserva.cliente?.apellido && reserva.cliente.apellido.toLowerCase().includes(texto))
    );
  }

  cargarReservas() {
    this.hotelService.listarTodasLasReservas().subscribe({
      next: (data) => {
        this.reservas = data;
        console.log("Reservas cargadas para el admin:", data);
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
      nombre: reserva.cliente?.nombre,
      apellido: reserva.cliente?.apellido,
      tipoDocumento: reserva.cliente?.tipoDocumento,
      numeroDocumento: reserva.cliente?.numeroDocumento,
      correo: reserva.cliente?.correo,
      telefono: reserva.cliente?.telefono,
      idCliente: reserva.cliente?.idCliente || 0, 
      idHabitacion: reserva.habitacion?.idHabitacion,
      fechaEntrada: reserva.fechaEntrada,
      fechaSalida: reserva.fechaSalida,
      numAdultos: reserva.numAdultos,
      numNinos: reserva.numNinos,
      tipoComprobante: reserva.tipoComprobante,
      rucEmpresa: reserva.rucEmpresa,
      estado: 'CONFIRMADA' 
    };

    this.hotelService.actualizarReserva(reserva.idReserva, dto).subscribe({
      next: () => this.cargarReservas(),
      error: (err) => console.error("Error al confirmar la reserva:", err)
    });
  }

  // ✏️ LÓGICA DEL LÁPIZ DE EDICIÓN
  abrirModalEditar(reserva: any) {
    this.reservaEditando = { ...reserva }; 
    this.mostrarModalEdicion = true;
  }

  cerrarModal() {
    this.mostrarModalEdicion = false;
  }

  guardarEdicion() {
    const dto = {
      nombre: this.reservaEditando.cliente?.nombre,
      apellido: this.reservaEditando.cliente?.apellido,
      tipoDocumento: this.reservaEditando.cliente?.tipoDocumento,
      numeroDocumento: this.reservaEditando.cliente?.numeroDocumento,
      correo: this.reservaEditando.cliente?.correo,
      telefono: this.reservaEditando.cliente?.telefono,
      idCliente: this.reservaEditando.cliente?.idCliente || 0,
      idHabitacion: this.reservaEditando.habitacion?.idHabitacion,
      numAdultos: this.reservaEditando.numAdultos,
      numNinos: this.reservaEditando.numNinos,
      tipoComprobante: this.reservaEditando.tipoComprobante,
      rucEmpresa: this.reservaEditando.rucEmpresa,
      estado: this.reservaEditando.estado,
      fechaEntrada: this.reservaEditando.fechaEntrada,
      fechaSalida: this.reservaEditando.fechaSalida
    };

    this.hotelService.actualizarReserva(this.reservaEditando.idReserva, dto).subscribe({
      next: () => {
        this.cargarReservas();
        this.cerrarModal();
      },
      error: (err) => alert("Error al guardar la edición. Verifica las fechas.")
    });
  }

  // ➕ LÓGICA DE NUEVA RESERVA MANUAL
  abrirModalNuevo() {
    // Inicializamos el objeto con valores por defecto obligatorios para que no rompa las validaciones
    this.nuevaReserva = {
      tipoDocumento: 'DNI',
      tipoComprobante: 'BOLETA',
      numAdultos: 1,
      numNinos: 0,
      fechaEntrada: this.fechaHoy,
      fechaSalida: '',
      idCliente: 0 // Enviamos 0 porque el DTO en Java pide un ID obligatorio, pero tu Service creará o buscará al cliente por su DNI
    };
    this.mostrarModalNuevo = true;
  }

  cerrarModalNuevo() {
    this.mostrarModalNuevo = false;
  }

  guardarNuevaReserva() {
    this.hotelService.registrarReserva(this.nuevaReserva).subscribe({
      next: (mensaje) => {
        console.log(mensaje);
        this.cargarReservas(); // Recargamos la tabla principal
        this.cerrarModalNuevo(); // Cerramos la ventana
      },
      error: (err) => {
        console.error("Error al registrar reserva manual:", err);
        alert("Hubo un error al registrar la reserva. Asegúrate de llenar todos los campos obligatorios y que las fechas sean correctas.");
      }
    });
  }
  // ✨ FUNCIÓN PARA DESCARGAR REPORTE EN EXCEL (CSV)
  descargarReporteExcel() {
    // 1. Usamos punto y coma (;) para que el Excel lo separe en columnas perfectas
    let csv = 'ID;Cliente;DNI;Habitacion;Fecha Ingreso;Fecha Salida;Estado\n';

    // 2. Recorremos tu arreglo de reservas (Asegúrate de que la variable sea this.reservas o this.reservasFiltradas)
    this.reservas.forEach((res: any) => {
      // 3. Usamos los nombres EXACTOS de tu base de datos y tu HTML
      const id = res.idReserva || '';
      const cliente = `${res.cliente?.nombre || ''} ${res.cliente?.apellido || ''}`;
      const dni = res.cliente?.numeroDocumento || '';
      const habitacion = res.habitacion?.numeroHabitacion || '';
      const ingreso = res.fechaEntrada || '';
      const salida = res.fechaSalida || '';
      const estado = res.estado || '';

      // Agregamos la fila separada por punto y coma
      csv += `#${id};${cliente};${dni};${habitacion};${ingreso};${salida};${estado}\n`;
    });

    // 4. Magia de HTML5 para forzar la descarga con codificación UTF-8 (para las tildes)
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // Le ponemos la fecha de hoy al nombre del archivo
    const fechaHoy = new Date().toISOString().split('T')[0];
    link.download = `Reporte_Inti_${fechaHoy}.csv`;
    
    link.click();
    window.URL.revokeObjectURL(url);
  }
}