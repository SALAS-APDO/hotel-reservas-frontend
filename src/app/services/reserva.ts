import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReservaService {
  // Esta es la URL exacta de tu ReservaController en Java
  private apiUrl = 'http://localhost:8080/api/reservas'; 

  constructor(private http: HttpClient) {}

  // Este método enviará el ReservaRequestDTO completo a tu Backend
  registrarReserva(reservaData: any): Observable<string> {
    return this.http.post(this.apiUrl, reservaData, { responseType: 'text' });
  }
}