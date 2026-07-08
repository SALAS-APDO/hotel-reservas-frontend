import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  // URL base de tu Backend en Java
  private apiUrl = 'http://localhost:8080/api/reservas'; 

  constructor(private http: HttpClient) {}

  // 1. Registrar nueva reserva (El que ya tenías)
  registrarReserva(reservaData: any): Observable<string> {
    return this.http.post(this.apiUrl, reservaData, { responseType: 'text' });
  }

  // 2. Obtener SOLAMENTE las reservas activas (Para tu tabla de Gestión)
  getReservasActivas(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // 3. Obtener TODAS las reservas (Para sumar el dinero en Estadísticas)
  getHistorialReservas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/historial`);
  }

  // 4. Finalizar reserva ("Soft Delete" para no borrar el dinero)
  finalizarReserva(id: number): Observable<string> {
    return this.http.put(`${this.apiUrl}/${id}/finalizar`, {}, { responseType: 'text' });
  }
  actualizarReserva(id: number, reservaData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, reservaData);
  }
}