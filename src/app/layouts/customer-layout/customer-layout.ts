import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component'; // Verifica que la ruta coincida con la tuya

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [RouterModule, NavbarComponent], // 👈 Importaciones clave
  templateUrl: './customer-layout.html',
  styleUrls: ['./customer-layout.css']
})
export class CustomerLayoutComponent { }
