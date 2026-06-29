import { Hotel } from './hotel';

export interface Habitacion {
  idHabitacion: number;
  numeroHabitacion: string;
  tipoHabitacion: string;
  capacidadMaxima: number;
  precioPorNoche: number;
  disponible: boolean; // El backend nos manda true/false al listar
  hotel: Hotel;
}