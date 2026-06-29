import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { Login } from './components/login/login';
import { Destinos } from './components/destinos/destinos';
import { Nosotros } from './components/nosotros/nosotros';
import { DetalleReserva } from './components/detalle-reserva/detalle-reserva'; 
import { AdminDashboard } from './components/admin-dashboard/admin-dashboard';
import { authGuard } from './guards/auth.guard'; 
import { CustomerLayoutComponent } from './layouts/customer-layout/customer-layout';

// 👈 NUEVAS IMPORTACIONES PARA EL MUNDO ADMIN
import { AdminLayout } from './layouts/admin-layout/admin-layout'; 
import { HabitacionesLimpieza } from './components/habitaciones-limpieza/habitaciones-limpieza';
import { ClientesComponent } from './components/clientes/clientes'; // ✨ IMPORTAMOS EL NUEVO MÓDULO
import { EstadisticasComponent } from './components/estadisticas/estadisticas';

export const routes: Routes = [
  // 🌍 MUNDO CLIENTE
  { 
    path: '', 
    component: CustomerLayoutComponent, 
    children: [
      { path: '', component: HomeComponent },
      { path: 'destinos', component: Destinos },
      { path: 'nosotros', component: Nosotros },
      { path: 'detalle-reserva', component: DetalleReserva }
    ]
  },

  // 🔑 RUTAS INDEPENDIENTES
  { path: 'login', component: Login },
  
  // 🛡️ MUNDO ADMINISTRADOR
  { 
    path: 'admin-dashboard', 
    component: AdminLayout, 
    canActivate: [authGuard], 
    children: [
      { path: '', redirectTo: 'reservas', pathMatch: 'full' }, 
      
      // 📊 Pantalla 1: Reservas
      { path: 'reservas', component: AdminDashboard },
      
      // 🛏️ Pantalla 2: Habitaciones
      { path: 'habitaciones', component: HabitacionesLimpieza },

      // 👥 Pantalla 3: La nueva tabla de Clientes
      { path: 'clientes', component: ClientesComponent }, // 👈 ¡OJO AQUÍ! Se agregó la coma

      // 📈 Pantalla 4: El Tablero de Estadísticas (La Meta Diaria)
      { path: 'estadisticas', component: EstadisticasComponent } // ✨ AQUÍ VA PERFECTAMENTE UBICADO
    ]
  }, 

  { path: '**', redirectTo: '', pathMatch: 'full' }
];