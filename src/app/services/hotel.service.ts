import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HotelService {
  private apiUrl = 'http://localhost:8080/api/hoteles';
  private apiHabitacionesUrl = 'http://localhost:8080/api/habitaciones'; // URL base para habitaciones

  constructor(private http: HttpClient) {}

  // Este método trae la lista de hoteles
  listarHoteles(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Este método busca habitaciones filtradas por hotel y fechas
  // Nota: Asegúrate de que esta ruta coincida con el @GetMapping en tu Backend (HabitacionController)
  buscarHabitaciones(idHotel: any, llegada: string, salida: string, adultos: number, ninos: number) {
    return this.http.get<any[]>(
      `${this.apiHabitacionesUrl}/buscar?idHotel=${idHotel}&llegada=${llegada}&salida=${salida}&adultos=${adultos}&ninos=${ninos}`
    );
  }
  // ✨ NUEVO MÉTODO PARA EL ADMIN: Trae todas las reservas
  listarTodasLasReservas(): Observable<any[]> {
    // Asegúrate de que esta URL coincida con tu @GetMapping en el backend (ReservaController)
    return this.http.get<any[]>(`http://localhost:8080/api/reservas`);
  }

  // 🗑️ Eliminar reserva
  eliminarReserva(id: number): Observable<string> {
    return this.http.delete(`http://localhost:8080/api/reservas/${id}`, { responseType: 'text' });
  }

  // ➕ Registrar una nueva reserva manual
  registrarReserva(reservaData: any): Observable<string> {
    // Usamos responseType: 'text' porque tu Java devuelve un String ("Reserva registrada con éxito")
    return this.http.post('http://localhost:8080/api/reservas', reservaData, { responseType: 'text' });
  }

  // ✅ Actualizar estado de reserva (usando el mismo DTO que usa el registro)
  // Nota: Si tu backend espera un objeto completo, podemos enviarlo aquí.
  actualizarReserva(id: number, reservaData: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/reservas/${id}`, reservaData);
  }

  // 🛏️ Trae todas las habitaciones para la cuadrícula del admin
  listarHabitaciones() {
    // Usamos la ruta directa para evitar que se cruce con la ruta de hoteles
    return this.http.get<any[]>('http://localhost:8080/api/habitaciones');
  }

  // ✏️ Actualiza los datos (y el estado) de una habitación
  actualizarHabitacion(id: number, datos: any) {
    return this.http.put(`http://localhost:8080/api/habitaciones/${id}`, datos);
  }

  // 👥 MÓDULO CLIENTES
  listarClientes(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/clientes');
  }

  actualizarCliente(id: number, datos: any): Observable<any> {
    return this.http.put(`http://localhost:8080/api/clientes/${id}`, datos);
  }
}