import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SimsDataService } from '../../../core/services/sims-data.service';
import { SimStatus, Sim } from '../../../core/models/sim.model';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../environments/environment';
import { editUser } from './interface-editimei';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Location } from '@angular/common';
import { RastreogoLoadingComponent } from '../../../core/components/rastreogo-loading';


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChartModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    RastreogoLoadingComponent
  ],
  selector: 'app-dashboard-edit-imei',
  template: `
           <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden"

style="background-image: url('assets/images/@RastreoGo-Transparente2.png'); background-size: cover; background-position: center;">
<!-- Loading spinner -->
   @if (loading) {
       <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
           <app-rastreogo-loading></app-rastreogo-loading>
       </div>
   }
      <div class="card">
        <button class="back-link-button" (click)="regresar()">
          <span class="arrow">←</span>
          <span>Regresar</span>
        </button>

        <div class="font-semibold text-xl mb-4">Editar SIM de {{ user[0].user.username }}</div>

        <p-table 
          [value]="user"
          [tableStyle]="{ 'min-width': '60rem' }"
          [loading]="loading"
          [showGridlines]="true"
          responsiveLayout="scroll"
        >
          <ng-template pTemplate="header">
            <tr>
              <th>ID</th>
              <th>ICCID</th>
              <th>Plan</th>
              <th>GPS</th>
              <th>IMEI</th>
              <th>Estado</th>
              <th>Fecha de Vencimiento</th>
              <th>Fecha de activación</th>
              <th>Acciones</th>
            </tr>
          </ng-template>

          <ng-template pTemplate="body" let-user>
            <tr>
              <td>{{user.id}}</td>
              <td>{{user.iccid}}</td>
              <td>{{user.sims[0].planName}}</td>
              <td>{{user.gps}}</td>
              <td>
                <input pInputText type="text" [(ngModel)]="user.imei" class="w-full">
              </td>
              <td>{{user.sims[0].status}}</td>
              <td>{{user.sims[0].dueDate | date:'dd/MM/yyyy'}}</td>
              <td>{{user.sims[0].activationDate | date:'dd/MM/yyyy'}}</td>
              <td>
                <div class="flex gap-2">
                  <button pButton 
                    icon="pi pi-save" 
                    class="p-button-success" 
                    (click)="actualizarSIM()"
                    pTooltip="Actualizar">
                  </button>
                  <button pButton 
                    icon="pi pi-times" 
                    class="p-button-danger" 
                    (click)="cancelar()"
                    pTooltip="Cancelar">
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>

          <ng-template pTemplate="emptymessage">
            <tr>
              <td colspan="9" class="text-center">No hay datos disponibles.</td>
            </tr>
          </ng-template>
        </p-table>
      </div>
    </div>
  `,
  styles: [`
    .back-link-button {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      cursor: pointer;
      font-size: 16px;
      padding: 10px;
      background: none;
      border: none;
      margin-bottom: 10px;
      transition: all 0.3s ease;
    }

    .back-link-button:hover {
      color: #ff6b00;
      transform: translateX(-5px);
    }

    .back-link-button .arrow {
      font-size: 20px;
      line-height: 1;
    }

    .back-link-button:hover .arrow {
      transform: translateX(-3px);
    }

    :host ::ng-deep .p-button.p-button-text {
      color: var(--primary-color);
    }
    
    :host ::ng-deep .p-button.p-button-text:hover {
      background: rgba(var(--primary-color-rgb), 0.04);
    }
  `]
})

export class DashboardEditImeiComponent implements OnInit {
  simId: string | null = null;
  // sim: SimStatus[] = [];
  loading: boolean = false;
  notifications: any[] = [];
  userName: string = '';
  errorMessage: string = '';
  user: editUser[] = [];
  private userId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private simData: SimsDataService,
    private router: Router,
    private notificationService: NotificationService,
    private location: Location
  ) { }

  ngOnInit(): void {
    this.loading = true;
    this.simId = this.route.snapshot.queryParamMap.get('simId');
    this.userId = this.route.snapshot.queryParamMap.get('userId');

    // // // // console.log('ID de SIM a editar:', this.simId);
    if (this.simId) {
      localStorage.setItem('editSimId', this.simId);
      this.getSimById(this.simId);

    } else {
      console.error('No se proporcionó un simId válido.');
      this.loading = false;
      this.errorMessage = 'No se proporcionó un simId válido.';
    }

    // Obtener el userId de los queryParams o del localStorage
    this.route.queryParams.subscribe(params => {
      const simId = params['simId'];
      this.userId = localStorage.getItem('currentUserId'); // Asegúrate de guardar el userId cuando navegues a edit-users
    });
  }

  getSimById(simId: string) {
    const distributorId = localStorage.getItem("ID");
    // // // // console.log('distributorId:', distributorId);
    // // // // console.log('simId recibido:', simId);

    if (!distributorId) {
      console.error('No se encontró distributorId en el localStorage.');
      this.loading = false;
      this.errorMessage = 'Distributor ID no encontrado.';
      return;
    }

    const url = `${environment.clienteiccidUrl2}/sim/${simId}`;
    // // // // console.log('URL para obtener SIM:', url);
    // // // // console.log('Iniciando llamada a getApiCall...');

    this.simData.getApiCall<editUser[]>(url).subscribe(
      (data) => {
        // // // // console.log('Respuesta completa del API:', data);
        if (data) {
          this.user = data;
          // // // // console.log('SIM:', this.user);
        } else {
          // // // // console.log('SIM no encontrada.');
          this.errorMessage = 'SIM no encontrada.';
        }
        this.loading = false;
      },
      (error) => {
        console.error('Error al obtener la SIM:', error);
        console.error('Detalles del error:', {
          status: error.status,
          message: error.message,
          error: error.error
        });
        this.errorMessage = `Error al obtener la SIM: ${error.message}`;
        this.loading = false;
      }
    );
  }

  actualizarSIM() {
    if (this.user) {
      this.loading = true;
      console.log('user:', this.user);

      // Datos que se envían en la petición:
      const iccid = this.user[0].iccid; // ICCID de la SIM a actualizar
      const imeiNuevo = this.user[0].imei; // Nuevo IMEI que se asignará
      //  console.log('iccid:', iccid);
      //  console.log('imeiNuevo:', imeiNuevo);

      // URL a la que se envía: 
      // {clienteiccidUrl2}/client-iccids/iccid/{iccid}/imei
      const url = `${environment.apiUrl}/client-iccids/iccid/${iccid}/imei`;
      //   console.log('URL de actualización:', url);

      // Body de la petición PATCH:
      // { imei: "nuevo-imei" }
      const data = { imei: imeiNuevo };
      //   console.log('Body de la petición:', data);
      // // // // console.log('ID del cliente:', this.user[0].clientId); 
      // // // // console.log('IMEI que se enviará:', this.user[0].imei);

      // Se hace petición PATCH con:
      // - URL: {url}
      // - Body: { imei: imeiNuevo }
      this.simData.updateApiCall<any>(url, data).subscribe(

        (data) => {
          // // // // console.log('Respuesta del servidor:', data);
          // // // // console.log('SIM actualizada:', data);
          this.loading = false;
          // console.log('user:', this.user);
          // console.log('user:', this.user[0].clientId);
          // console.log('user:', this.user[0].userId);

          this.router.navigate(['/dashboard/dashboard-lines/' + this.userId]);

        },
        (error) => {
          console.error('Error al actualizar la SIM:', error);
          console.error('Detalles del error:', {
            status: error.status,
            message: error.message,
            error: error.error
          });
          this.errorMessage = `Error al actualizar la SIM: ${error.message}`;
          this.loading = false;
        }
      );
    }
  }

  cancelar() {
    if (this.user && this.userId) {
      this.router.navigate(['/dashboard/dashboard-lines', this.userId]);
    } else {
      // Si no tenemos el userId, intentamos obtenerlo del localStorage como respaldo
      const fallbackUserId = localStorage.getItem('currentUserId');
      if (fallbackUserId) {
        this.router.navigate(['/dashboard/dashboard-lines', fallbackUserId]);
      } else {
        this.router.navigate(['/dashboard/dashboard-clients']); // Ruta por defecto si no hay userId
      }
    }
  }

  guardarCambios() {
    this.actualizarSIM();
  }

  search(): void {
    // // // // console.log('Búsqueda realizada:', this.route.snapshot.queryParamMap.get('search'););
    // Implementa la lógica de búsqueda si es necesario
  }

  irAPagina(ruta: string): void {
    this.router.navigate([ruta]);
  }

  callLogout(): void {
    // // // // console.log('Cerrando sesión...');
    // Implementa la lógica de cierre de sesión aquí
  }



  regresar(): void {
    console.log('Botón regresar clickeado');
    this.location.back();
  }
}
