import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // 📜 Revisamos el papelito virtual en la memoria del navegador
  const isAdminLogged = localStorage.getItem('isAdminLogged');

  if (isAdminLogged === 'true') {
    return true; // 🔓 ¡Acceso concedido! El administrador inició sesión correctamente.
  } else {
    // 🔒 Acceso denegado: Mandamos un aviso y lo botamos al login
    alert('Acceso denegado. Debes iniciar sesión para ingresar al panel.');
    router.navigate(['/login']);
    return false; 
  }
};