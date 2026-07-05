import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HotelService } from '../../services/hotel.service';
import { Router } from '@angular/router';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, CommonModule, IconComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  hoteles: any[] = [];
  busqueda = { hotelId: '', fechaLlegada: '', fechaSalida: '', adultos: 2, ninos: 0 };

  habitacionesDisponibles: any[] = [];

  nombreHotelSeleccionado: string = "";
  haBuscado: boolean = false;
  fechaMinima: string = "";

  fondos: string[] = [
    '/assets/fondo-1.jpg',
    '/assets/fondo-2.webp',
    '/assets/fondo-3.webp',
    '/assets/fondo-4.jpg',
    '/assets/fondo-5.jpeg'
  ];
  imagenActual: number = 0;
  intervaloCarrusel: any;

  chatAbierto: boolean = false;
  preguntasFrecuentes: any[] = [];

  mensajesChat: any[] = [
    { emisor: 'bot', texto: '¡Hola! Bienvenido a Hoteles UPN. Por favor, selecciona una de nuestras preguntas frecuentes a continuación para resolver tus dudas al instante.' }
  ];
  preguntasRespondidas: Set<number> = new Set();

  constructor(private hotelService: HotelService, private router: Router) { }

  ngOnInit() {
    this.fechaMinima = new Date().toISOString().split('T')[0];

    this.hotelService.listarHoteles().subscribe({
      next: (data) => {
        this.hoteles = data;
      },
      error: (err) => console.error(err)
    });

    this.intervaloCarrusel = setInterval(() => {
      this.imagenActual = (this.imagenActual + 1) % this.fondos.length;
    }, 5000);

    this.cargarPreguntasChatbot();
  }

  ngOnDestroy() {
    if (this.intervaloCarrusel) {
      clearInterval(this.intervaloCarrusel);
    }
  }

  buscarReserva() {
    if (this.busqueda.fechaLlegada < this.fechaMinima) {
      alert("¡No puedes seleccionar una fecha pasada!");
      return;
    }

    if (this.busqueda.fechaSalida <= this.busqueda.fechaLlegada) {
      alert("La fecha de salida debe ser posterior a la de llegada.");
      return;
    }

    if (!this.busqueda.hotelId || !this.busqueda.fechaLlegada || !this.busqueda.fechaSalida) {
      alert("Por favor, completa todos los campos antes de buscar.");
      return;
    }

    const hotelEncontrado = this.hoteles.find(h => h.idHotel == this.busqueda.hotelId);
    this.nombreHotelSeleccionado = hotelEncontrado ? hotelEncontrado.nombre : "nuestro hotel";

    this.hotelService.buscarHabitaciones(
      this.busqueda.hotelId,
      this.busqueda.fechaLlegada,
      this.busqueda.fechaSalida,
      this.busqueda.adultos,
      this.busqueda.ninos
    ).subscribe({
      next: (data) => {
        this.habitacionesDisponibles = data;
        this.haBuscado = true;
      },
      error: (err) => {
        alert("Hubo un error al buscar.");
      }
    });
  }

  irADetalle(habitacion: any) {
    this.router.navigate(['/detalle-reserva'], {
      state: {
        habitacionSeleccionada: habitacion,
        datosBusqueda: this.busqueda
      }
    });
  }

  cargarPreguntasChatbot() {
    fetch('http://localhost:8080/api/chatbot')
      .then(res => res.json())
      .then(data => {
        this.preguntasFrecuentes = data;
      })
      .catch(err => console.error(err));
  }

  toggleChat() {
    this.chatAbierto = !this.chatAbierto;
  }

  seleccionarPregunta(preguntaObj: any) {
    this.mensajesChat.push({ emisor: 'user', texto: preguntaObj.pregunta });

    setTimeout(() => {
      if (this.preguntasRespondidas.has(preguntaObj.id)) {
        this.mensajesChat.push({
          emisor: 'bot',
          texto: `Esta información ya fue brindada: ${preguntaObj.respuesta} Si tienes otra duda, selecciona una opción distinta.`
        });
      } else {
        this.mensajesChat.push({
          emisor: 'bot',
          texto: preguntaObj.respuesta
        });
        this.preguntasRespondidas.add(preguntaObj.id);
      }
      this.scrollChatAlFondo();
    }, 400);
  }

  scrollChatAlFondo() {
    setTimeout(() => {
      const chatContenedor = document.getElementById('chat-mensajes');
      if (chatContenedor) {
        chatContenedor.scrollTop = chatContenedor.scrollHeight;
      }
    }, 50);
  }
}