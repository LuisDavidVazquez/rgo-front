import { Component } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { ValidacionService } from '../../core/services/validacion.service';
import { Router, RouterModule } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';

interface SolicitudPendiente {
  id: number;
  name: string;
  phone: string;
  email: string;
  password: string;
  personType: string;
  rfc: string;
  state: string;
  city: string;
  street: string;
  postalCode: string;
  // Agrega más campos según los datos que esperes
}


@Component({
  standalone: true,
  imports: [
    CommonModule,
     FormsModule, 
     ReactiveFormsModule, 
     RouterModule, 
     TableModule, 
     SelectModule, 
     MultiSelectModule, 
     InputTextModule, 
     ButtonModule, 
     DropdownModule, 
     
  ],
  selector: 'app-validation',
  templateUrl: './validation.component.html',
  styleUrls: ['./validation.component.css']
})




export class ValidationComponent {
  formData: any;
  solicitudesPendientes: SolicitudPendiente[] = [];
  selectedSolicitud?: SolicitudPendiente;  // Variable para almacenar la solicitud seleccionada


  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.cargarSolicitudesPendientes();
  }

  //   ngOnInit() {
  //     this.cargarSolicitudesPendientes();
  // }

  cargarSolicitudesPendientes() {
    this.authService.obtenerSolicitudesPendientes().subscribe({
      next: (solicitudes) => {
        // // // // console.log('Solicitudes pendientes:', solicitudes);
        this.solicitudesPendientes = solicitudes;
      },
      error: (error) => {
        console.error('Error al cargar solicitudes pendientes', error);
      }
    });
  }

  mostrarDetalles(solicitud: SolicitudPendiente) {
    this.selectedSolicitud = solicitud;
  }
  rejectDataapprove(solicitud: SolicitudPendiente) {
    // Devuelve directamente el Observable sin suscribirse aquí
    return this.authService.eliminarSolicitud(solicitud.id);
  }

  approveData(solicitud: SolicitudPendiente): void {
    // Validar que todos los campos requeridos estén presentes
    const camposRequeridos = [
        'name', 'phone', 'email', 'password',
        'personType', 'rfc',
        'state', 'city', 'street', 'postalCode', 'neighborhood'
    ];

    const camposFaltantes = camposRequeridos.filter(campo => !(campo in solicitud ));
    
    if (camposFaltantes.length > 0) {
        console.error('Campos faltantes:', camposFaltantes);
        // Aquí podrías mostrar un mensaje al usuario
        return;
    }

    // // // // console.log("Iniciando proceso de guardado:", solicitud);

    this.authService.guardarCliente(solicitud).pipe(
        switchMap(() => this.rejectDataapprove(solicitud))
    ).subscribe({
        next: () => {
            // // // // console.log('Cliente guardado y solicitud eliminada con éxito');
            this.solicitudesPendientes = this.solicitudesPendientes
                .filter(s => s.id !== solicitud.id);
            this.selectedSolicitud = undefined;
            this.router.navigate(['validation/validation']);
        },
        error: (error) => {
            console.error('Error durante el proceso:', error);
            // Aquí podrías mostrar un mensaje de error al usuario
        }
    });
  }



  // approveData(solicitud: SolicitudPendiente): void {
  //   // // // // console.log("Datos aprobados:", solicitud);
  //   if (!this.formData) {
  //     console.error("No hay datos para procesar.");
  //     return;
  //   }

  //   const { username, phone, email, password, tipoPersona, rfc, estado, municipio, calle, codigoPostal } = this.formData;
  //   const datosUsuario = { username, phone, email, password };
  //   const datosFiscales = { tipoPersona, rfc };
  //   const direccionData = { estado, municipio, calle, codigoPostal };

  //   this.authService.guardarCliente(datosUsuario).pipe(
  //     switchMap(() => this.authService.guardarClienteErp(datosUsuario)),
  //     switchMap(() => this.authService.guardarDatosFiscales(datosFiscales)),
  //     switchMap(() => this.authService.guardarDireccion(direccionData)),
  //     catchError((error) => {
  //       console.error('Error durante el proceso de guardado', error);
  //       return throwError(() => new Error('Error en la secuencia de guardado'));
  //     })
  //   ).subscribe({
  //     next: () => {
  //       // // // // console.log('Todos los datos han sido guardados con éxito.');
  //       this.validacionService.clearFormData(); // Limpiar los datos después de aprobar
  //       this.router.navigate(['/gracias']); // Navegar a la página de agradecimiento
  //     },
  //     error: (error) => console.error('Error durante el proceso de guardado', error)
  //   });
  // }

  rejectData(solicitud: SolicitudPendiente) {
    if (confirm("¿Estás seguro de que quieres rechazar y eliminar esta solicitud?")) {
      this.authService.eliminarSolicitud(solicitud.id).subscribe({
        next: () => {
          // // // // console.log("Solicitud eliminada con éxito");
          // Actualiza la lista de solicitudes pendientes eliminando la solicitud rechazada
          this.solicitudesPendientes = this.solicitudesPendientes.filter(s => s.id !== solicitud.id);
          this.router.navigate(['validation/validation']); // Opcional: redirigir a otra ruta
        },
        error: (error) => {
          console.error("Error al eliminar la solicitud", error);
        }
      });
    }
  }

  regresarAlLogin() {
    this.router.navigate(['auth/login']);  // Asegúrate de que la ruta '/login' esté definida en tus rutas de Angular
  }

  // approveData() {
  //   // Aquí iría la lógica para guardar los datos en la base de datos
  //   // // // // console.log("Datos aprobados:", this.formData);
  //   // Desestructura los datos del formulario para separarlos según su destino
  //   const { username, phone, email, password, tipoPersona, rfc, estado, municipio,
  //     calle, codigoPostal } = this.formData;

  //   const datosUsuario = { username, phone, email, password };
  //   const datosFiscales = { tipoPersona, rfc };
  //   const direccionData = { estado, municipio, calle, codigoPostal };

  //   // Llamadas HTTP a tus servicios
  //   // Guardar datos del usuario

  //   // Encadena las llamadas de API
  //   this.authService.guardarCliente(datosUsuario).pipe(
  //     switchMap(() => this.authService.guardarClienteErp(datosUsuario)),
  //     switchMap(() => this.authService.guardarDatosFiscales(datosFiscales)),
  //     switchMap(() => this.authService.guardarDireccion(direccionData)),
  //     catchError((error) => {
  //       console.error('Error durante el proceso de guardado', error);
  //       return throwError(() => new Error('Error en la secuencia de guardado'));
  //     })
  //   ).subscribe({



  //     // this.authService.guardarCliente(datosUsuario).subscribe({
  //     //   next: (response) => // // console.log('Usuario guardado con éxito', response);,
  //     //   error: (error) => console.error('Error al guardar el usuario', error)
  //     // });

  //     // // // Guardar datos fiscales
  //     // this.authService.guardarDatosFiscales(datosFiscales).subscribe({
  //     //   next: (response) => // // console.log('Datos fiscales guardados con éxito', response);,
  //     //   error: (error) => console.error('Error al guardar datos fiscales', error)
  //     // });

  //     // // // Guardar dirección
  //     // this.authService.guardarDireccion(direccionData).subscribe({
  //     //   next: (response) => // // console.log('Dirección guardada con éxito', response);,
  //     //   error: (error) => console.error('Error al guardar la dirección', error)
  //     // });


  //     // // Guardar datos del usuario en la primera base de datos
  //     // this.authService.guardarCliente(datosUsuario).pipe(
  //     //   switchMap(response => {
  //     //     // // // // console.log('Usuario guardado con éxito en la primera base de datos', response);
  //     //     // Una vez guardado el usuario en la primera base, intenta guardar en la segunda
  //     //     return this.authService.guardarClienteErp(datosUsuario);
  //     //   }),
  //     //   switchMap(responseErp => {
  //     //     // // // // console.log('Usuario guardado con éxito en la segunda base de datos (ERP);', responseErp);
  //     //     // Procede a guardar datos fiscales después de guardar en ambas bases
  //     //     return this.authService.guardarDatosFiscales(datosFiscales);
  //     //   }),
  //     //   switchMap(responseFiscales => {
  //     //     // // // // console.log('Datos fiscales guardados con éxito', responseFiscales);
  //     //     // Finalmente, guarda la dirección
  //     //     return this.authService.guardarDireccion(direccionData);
  //     //   })
  //     // ).subscribe({
  //     next: () => {
  //       // // // // console.log('Todos los datos han sido guardados con éxito.');
  //       this.validacionService.clearFormData(); // Limpiar los datos después de aprobar
  //       this.router.navigate(['/gracias']); // Navegar a la página de agradecimiento
  //     },
  //     error: error => console.error('Error durante el proceso de guardado', error)
  //   });
  // }

  // rejectData(solicitud: SolicitudPendiente): void {
  //   // // // // console.log("Datos rechazados:", solicitud);
  //   // Manejar el rechazo de datos aquí, por ejemplo, redirigiendo o limpiando los datos
  //   // // // // console.log("Datos rechazados, limpiando datos.");
  //   this.validacionService.clearFormData();
  //   this.router.navigate(['/login']); // Redirigir al inicio

  // }


}


