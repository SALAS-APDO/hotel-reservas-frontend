import { Injectable } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WhatsappService {
  private readonly telefonoHotel = '51946475312'; // Teléfono oficial de Hoteles UPN

  constructor() { }

  /**
   * Captura la franja horaria local mediante programación reactiva.
   * Utiliza un temporizador RxJS que evalúa la hora del cliente de forma reactiva.
   */
  public obtenerSaludoReactivo(): Observable<string> {
    // Emite inmediatamente (0) y luego cada 60 segundos (60000ms)
    return timer(0, 60000).pipe(
      map(() => {
        const horaLocal = new Date().getHours();
        if (horaLocal >= 6 && horaLocal < 12) {
          return '¡Buenos días';
        } else if (horaLocal >= 12 && horaLocal < 19) {
          return '¡Buenas tardes';
        } else {
          return '¡Buenas noches';
        }
      })
    );
  }

  /**
   * Genera dinámicamente la URL de WhatsApp codificando el mensaje para evitar roturas.
   * Aplica encodeURIComponent para que el saludo y mensaje viajen en el formato correcto.
   * @param mensajeAdicional Texto que complementa al saludo principal
   */
  public obtenerUrlDinamica(mensajeAdicional: string = 'Vengo de la página web y me gustaría recibir asistencia con una reserva.'): Observable<string> {
    return this.obtenerSaludoReactivo().pipe(
      map(saludo => {
        const mensajeCompleto = `${saludo}! ${mensajeAdicional}`;
        const mensajeCodificado = encodeURIComponent(mensajeCompleto);
        return `https://wa.me/${this.telefonoHotel}?text=${mensajeCodificado}`;
      })
    );
  }
}
