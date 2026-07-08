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
    '/assets/fondoupn-1.jpg',
    '/assets/fondoupn-2.jpg',
    '/assets/fondoupn-3.jpg',
    
  ];
  imagenActual: number = 0;
  intervaloCarrusel: any;

  chatAbierto: boolean = false;
  preguntasFrecuentes: any[] = [];
  
  mensajesChat: any[] = [
    { emisor: 'bot', texto: '¡Hola! Bienvenido a Hoteles UPN. Por favor, selecciona una de nuestras preguntas frecuentes a continuación para resolver tus dudas al instante.' }
  ];
  preguntasRespondidas: Set<number> = new Set();

  constructor(private hotelService: HotelService, private router: Router) {}

  ngOnInit() {
    //aqui calculo la fecha exacta, pero restando la diferencia de la zona docente
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, -1);
    this.fechaMinima = new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000).toISOString().split('T')[0];
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

    // 1. Descargamos TODAS las habitaciones del catálogo
    this.hotelService.listarHabitaciones().subscribe({
      next: (todasHabitaciones) => {
        // Filtramos solo las de la sede que el cliente eligió
        const habitacionesSede = todasHabitaciones.filter(h => {
          const primerDigito = h.numeroHabitacion.match(/\d/);
          return primerDigito && primerDigito[0] === this.busqueda.hotelId.toString();
        });

        // 2. Descargamos TODAS las reservas para cruzarlas nosotros mismos sin que el backend nos mienta
        this.hotelService.listarTodasLasReservas().subscribe({
          next: (todasReservas) => {
            
            // Evaluamos una por una las tarjetas de la pantalla
            this.habitacionesDisponibles = habitacionesSede.map(habSede => {
              
              // Buscamos si esta habitación en específico tiene reservas activas
              const reservasHabitacion = todasReservas.filter(r => 
                r.numeroHabitacion === habSede.numeroHabitacion && 
                r.estado !== 'FINALIZADA' && 
                r.estado !== 'CANCELADA'
              );

              let estaOcupada = false;

              // Cruzamos las fechas exactas (Magia matemática)
              for (const res of reservasHabitacion) {
                // Si la fecha de llegada buscada es menor que la salida del huésped actual
                // Y la fecha de salida buscada es mayor que la entrada del huésped actual = ¡CHOQUE!
                if (this.busqueda.fechaLlegada < res.fechaSalida && this.busqueda.fechaSalida > res.fechaEntrada) {
                  estaOcupada = true;
                  break; // Con un solo choque, ya marcamos la tarjeta en rojo
                }
              }

              return {
                ...habSede,
                estadoVisual: estaOcupada ? 'OCUPADA' : 'DISPONIBLE'
              };
            });

            this.haBuscado = true; 
          },
          error: (err) => {
            alert("Error al cargar el sistema de reservas para validación.");
          }
        });
      },
      error: (err) => {
        alert("Error al cargar el catálogo de habitaciones.");
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

  obtenerFotoHabitacion(nombreHotel: string): string {
    if (nombreHotel === 'Sede Los Olivos') {
      return 'assets/habitacion-olivos.jpg';
    } else if (nombreHotel === 'Sede Breña') {
      return 'assets/habitacion-brena.jpg';
    } else if (nombreHotel === 'Sede Comas') {
      return 'assets/habitacion-comas.jpg';
    }
    return 'assets/habitacion-olivos.jpg';
  }
  
  //  AQUI ESTA LA DINAMICA PARA NUESTRO WSTP COMPAÑEROS
  abrirWhatsApp() {
    // 1. OBLIGATORIO: Pon el número de tu COMPAÑERO aquí (que no sea tu propio número)
    const numeroHotel = '51999999999'; // <-- NUMERO DE PRUEBA
    
    const horaActual = new Date().getHours();
    let saludo = '';

    if (horaActual >= 6 && horaActual < 12) {
      saludo = 'Buenos dias';
    } else if (horaActual >= 12 && horaActual < 19) {
      saludo = 'Buenas tardes';
    } else {
      saludo = 'Buenas noches';
    }

    const mensaje = `¡Hola, ${saludo}! Vengo de la pagina web de Hoteles UPN y me gustaria recibir el catalogo de habitaciones e informacion de reservas.`;
    const mensajeCodificado = encodeURIComponent(mensaje);
    const url = `https://web.whatsapp.com/send?phone=${numeroHotel}&text=${mensajeCodificado}`;

    window.open(url, '_blank');
  }
}
