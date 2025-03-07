import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { solicituddeSim } from '../../../core/models/sim.model';
import { SimsDataService } from '../../../core/services/sims-data.service';
import { AuthService } from '../../../core/auth/auth.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

import { DireccionEnvio } from '../../../core/models/sim.model';
import { Address, Clientwhithdetails, FiscalDetail } from './clientwhitdetails';
import { Notification } from '../../../core/models/notification.model';
import { NotificationService } from '../../../core/services/notification.service';
import { interval, of } from 'rxjs';
import { EMPTY, startWith } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';





@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
       
    ],
  selector: 'app-sims-requests',
  templateUrl: './sims-requests.component.html',
  styleUrls: ['./sims-requests.component.css'],
  template: `
  <i class="fas fa-bell" 


     [matBadge]="unreadNotificationsCount" 
     [matBadgeHidden]="unreadNotificationsCount === 0" 
     matBadgeColor="warn" 
     (click)="openNotificationCenter()">
  </i>
`
})
export class SimsRequestsComponent implements OnInit {
  userName: string = '';

  

  solicituddeSim: Clientwhithdetails | null = null;


  fiscalDetails: FiscalDetail[] = [];

  addresses: Address[] = [];
  
  notifications: Notification[] = [];
  unreadNotificationsCount: number = 0;


  direccionEnvio: { street: string, neighborhood: string } = { street: '', neighborhood: '' };

  
  cantidadSimsSolicitadas: number = 1;
  loading: boolean = false;
  constructor(
    private http: HttpClient,
    private simData: SimsDataService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService

  ) { }

  ngOnInit() {
    this.loadUserData();
    this.obtenerDetallesCliente();
  }

  loadUserData() {
    const clientId = localStorage.getItem("ID");
    const email = localStorage.getItem("email");
    this.userName = localStorage.getItem("USERDATA") || '';

    // // // // console.log("Cargando datos de usuario en componente de solicitud de SIMs:", clientId, email, this.userName);
  }

  obtenerDetallesCliente() {
    const clientId = localStorage.getItem("ID");
    const token = localStorage.getItem('authToken');

    if (!token || !clientId) {
      console.error('No se encontró el token o el ID del cliente');
      return;
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`
      })
    };
    const url = `clients/with-details/${clientId}`;
    //const url = `${environment.apiBackUrlclientesrastreogo}/with-details/${clientId}`;

    this.simData.getApiCall<any>(url).subscribe(
      (data:Clientwhithdetails) => {
        this.solicituddeSim = data;
        // // // // console.log('Detalles del cliente:', this.solicituddeSim);
      },
      (error) => {
        console.error('Error al obtener los detalles del cliente:', error);
      }
    );
  }
  validarFormulario(): boolean {
    
    // // // // console.log('Validando formulario:', this.solicituddeSim?.fiscalDetails[0]?.rfc || 'No hay RFC registrado', this.cantidadSimsSolicitadas);
    // // // // console.log('Dirección de envío:', this.solicituddeSim?.addresses[0]?.street || 'No hay dirección registrada');
    // // // // console.log('Cantidad de SIMs:', this.cantidadSimsSolicitadas);
    // // // // console.log('Solicitud de SIM:', this.solicituddeSim);
    // // // // console.log('Datos del cliente:', this.solicituddeSim);
    // // // // console.log('RFC:', this.solicituddeSim?.fiscalDetails[0]?.rfc || 'No hay RFC registrado');
    return !!(this.solicituddeSim?.fiscalDetails[0]?.rfc && this.cantidadSimsSolicitadas > 0);
  }
  

  enviarDireccionEnvio() {
    // // // // console.log('Enviando dirección de envío:', this.solicituddeSim?.addresses[0]?.street || 'No hay dirección registrada');
    // // // // console.log('Enviando cantidad de SIMs:', this.cantidadSimsSolicitadas);
    // // // // console.log('Enviando datos del cliente:', this.solicituddeSim);
    // // // // console.log('RFC:', this.solicituddeSim?.fiscalDetails[0]?.rfc || 'No hay RFC registrado');
    if (this.validarFormulario()) {
      this.loading = true;
      this.enviarSolicitudSim();
      setTimeout(() => {
        this.loading = false;
        this.router.navigate(['/tableros']);
      }, 1500);
    } else {
      // Mostrar mensaje de error si el formulario no es válido
    }
  }

  enviarSolicitudSim() {
    const solicitud = {
      street: this.solicituddeSim?.addresses[0]?.street || 'No hay dirección registrada',
      clientId: Number(localStorage.getItem("ID")), // Convertir a número
      neighborhood: this.solicituddeSim?.addresses[0]?.neighborhood || 'No hay colonia registrada',
      postalCode: (this.solicituddeSim?.addresses[0]?.postalCode || '').toString(),
      state: this.solicituddeSim?.addresses[0]?.state || 'No hay estado registrado',
      city: this.solicituddeSim?.addresses[0]?.city || 'No hay ciudad registrada',
      name: this.userName,
      cantidadSimsSolicitadas: this.cantidadSimsSolicitadas
    };

    // // // // console.log('Datos de la solicitud:', solicitud);

    if (!this.validarSolicitud(solicitud)) {
      console.error('Datos de solicitud inválidos:', solicitud);
      // Muestra un mensaje de error al usuario
      return;
    }

    //this.simData.postApiCall<any>('/solicitud-de-sims/sims', solicitud).subscribe({
    // // // // console.log('Ruta:', environment.apiUrl + environment.apiSolicitudUrl + '/sims');
    this.simData.postApiCall<any>(environment.apiUrl + environment.apiSolicitudUrl + '/sims', solicitud).subscribe({
      
      next: (response) => {
        // // // // console.log('Solicitud enviada con éxito', response);
        // Maneja la respuesta exitosa
      },
      error: (error) => {
        console.error('Error al enviar la solicitud', error);
        if (error.error && Array.isArray(error.error.message)) {
          error.error.message.forEach((msg: string) => {
            console.error('Error del servidor:', msg);
            // Muestra cada mensaje de error al usuario
          });
        } else if (error.error && error.error.message) {
          console.error('Mensaje de error del servidor:', error.error.message);
          // Muestra el mensaje de error al usuario
        } else {
          console.error('Error desconocido al enviar la solicitud');
          // Muestra un mensaje de error genérico al usuario
        }
      }
    });
  }

  validarSolicitud(solicitud: any): boolean {
    if (!solicitud.clienteId || isNaN(solicitud.clienteId)) {
      console.error('clienteId inválido');
      return false;
    }

    if (!solicitud.codigoPostal || typeof solicitud.codigoPostal !== 'string') {
      console.error('codigoPostal inválido');
      return false;
    }

    const camposFaltantes = Object.entries(solicitud)
      .filter(([key, value]) => !value && key !== 'nombre')
      .map(([key]) => key);

    if (camposFaltantes.length > 0) {
      console.error('Campos faltantes:', camposFaltantes);
      return false;
    }

    if (solicitud.cantidadSimsSolicitadas <= 0) {
      console.error('Cantidad de SIMs inválida');
      return false;
    }

    return true;
  }

  logout() {
    // Implementa aquí la lógica de cierre de sesión
    // // // // console.log('Cerrando sesión...');
  }

  loadNotifications() {
    const clientId = Number(localStorage.getItem("ID"));
    if (isNaN(clientId)) {
      console.error('ID de cliente no válido');
      return;
    }

    this.notificationService.getNotifications(clientId).pipe(
      catchError(error => {
        // Manejar el error específicamente
        if (error.status === 500) {
          console.error('Error interno del servidor al cargar notificaciones');
          // Opcionalmente mostrar un mensaje al usuario
          // this.showErrorMessage('No se pudieron cargar las notificaciones');
        }
        // Retornar un array vacío como fallback
        return of([]);
      })
    ).subscribe(
      (notifications: Notification[]) => {
        this.notifications = notifications;
        this.unreadNotificationsCount = notifications.filter(n => !n.readAt).length;
      }
    );
  }

  openNotificationCenter() {
    // // console.log('Abriendo centro de notificaciones');
    // // console.log(`Notificaciones actuales:`, this.notifications);
    // Aquí implementa la lógica para abrir el centro de notificaciones
  }

  startNotificationPolling() {
    const pollingInterval = 60000; // 1 minuto
    
    interval(pollingInterval).pipe(
      startWith(0), // Comenzar inmediatamente
      catchError(error => {
        console.error('Error en el polling de notificaciones:', error);
        return EMPTY; // Detener el polling en caso de error
      })
    ).subscribe(() => {
      this.loadNotifications();
    });
  }


  regresar(): void {
    window.history.back(); // Esto te llevará a la página anterior
  }
}
