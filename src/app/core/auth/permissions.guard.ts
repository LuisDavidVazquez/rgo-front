import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class PermissionsGuard implements CanActivate {
  constructor(private router: Router) { }

  canActivate(): boolean {
    const permission = localStorage.getItem('permission');
   // // // // // console.log("Permission from localStorage:", permission);
    // Asegúrate de que el permiso sea el esperado para activar la ruta
    if (permission === 'FF70FC1E') {
      // // // // console.log("Paso el permiso");
     // this.router.navigate(['/altas']);
      return true;
    } else {
      // // // // console.log("Sin acceso, redirigiendo...");
      // Redirigir si el permiso no es suficiente
      this.router.navigate(['/login']);  // Asegúrate de redirigir a una ruta adecuada
      return false;
    }
  }
}