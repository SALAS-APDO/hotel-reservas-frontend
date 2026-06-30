import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../services/hotel.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent],
  templateUrl: './clientes.html',
  styleUrls: ['./clientes.css']
})
export class ClientesComponent implements OnInit {
  clientes: any[] = [];
  filtroTexto: string = '';
  mostrarModalEdicion: boolean = false;
  clienteEditando: any = {};

  constructor(private hotelService: HotelService) {}

  ngOnInit() {
    this.cargarClientes();
  }

  get clientesFiltrados() {
    if (!this.filtroTexto) return this.clientes;
    const texto = this.filtroTexto.toLowerCase();
    return this.clientes.filter(c =>
      (c.numeroDocumento && c.numeroDocumento.includes(texto)) ||
      (c.apellido && c.apellido.toLowerCase().includes(texto)) ||
      (c.nombre && c.nombre.toLowerCase().includes(texto))
    );
  }

  cargarClientes() {
    this.hotelService.listarClientes().subscribe({
      next: (data) => this.clientes = data,
      error: (err) => console.error("Error al cargar clientes:", err)
    });
  }

  abrirModalEditar(cliente: any) {
    this.clienteEditando = { ...cliente };
    this.mostrarModalEdicion = true;
  }

  cerrarModal() {
    this.mostrarModalEdicion = false;
  }

  guardarEdicion() {
    this.hotelService.actualizarCliente(this.clienteEditando.idCliente, this.clienteEditando).subscribe({
      next: () => {
        this.cargarClientes();
        this.cerrarModal();
      },
      error: (err) => alert("Error al actualizar el cliente")
    });
  }
}