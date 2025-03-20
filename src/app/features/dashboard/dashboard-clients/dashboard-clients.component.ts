import { Component, Inject, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { SimsDataService } from '../../../core/services/sims-data.service';
import { Sim } from '../../../core/models/sim.model';
import { Users } from '../../../core/models/user.model';
import { UserWithSims } from '../../../core/models/sim.model';
import { Router, RouterModule } from '@angular/router'; // Added this line
import { ElementRef, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core'; // Added this line
import { SimStatus } from '../../../core/models/sim.model'; // Added this import
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../environments/environment';
import { Notification } from '../../../core/models/notification.model';
import { interval, of } from 'rxjs';
import { catchError, startWith } from 'rxjs/operators';
import { EMPTY } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SuspendedSimsCountPipe } from '../../../core/pipes/suspended-sims-count.pipe';
import { DashboardLinesComponent } from '../dashboars-lines/dashboard-lines.component';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { SliderModule } from 'primeng/slider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { RatingModule } from 'primeng/rating';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { Location } from '@angular/common';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SuspendedSimsCountPipe,
        RouterModule,
        TableModule,
        MultiSelectModule,
        SelectModule,
        InputIconModule,
        TagModule,
        InputTextModule,
        SliderModule,
        ProgressBarModule,
        ToggleButtonModule,
        ToastModule,
        ButtonModule,
        RatingModule,
        RippleModule,
        IconFieldModule
    ],
    template: `
    <div class="card">
        <button class="back-link-button" (click)="regresar()">
            <span class="arrow">←</span>
            <span>Regresar</span>
        </button>
        
        <p-table
            #dt1
            [value]="filteredUsersWithSims"
            [rows]="clientesPorPagina"
            [paginator]="true"
            [loading]="loading"
            [rowHover]="true"
            [showGridlines]="true"
            styleClass="p-datatable-sm p-datatable-gridlines"
            [scrollable]="true"
            responsiveLayout="scroll"
        >
            <ng-template pTemplate="caption">
                <div class="flex flex-wrap gap-2 align-items-center justify-content-between">
                    <button pButton label="Limpiar" 
                            class="p-button-outlined" 
                            icon="pi pi-filter-slash" 
                            (click)="clear(dt1)">
                    </button>
                    <span class="p-input-icon-left">
                        <i class="pi pi-search"></i>
                        <input 
                            pInputText 
                            type="text" 
                            (input)="onGlobalFilter(dt1, $event)" 
                            placeholder="Buscar..." 
                            class="p-inputtext"
                        />
                    </span>
                </div>
            </ng-template>

            <ng-template pTemplate="header">
                <tr>
                    <th class="text-center" style="width:25%" pSortableColumn="username">
                        Nombre <p-sortIcon field="username"></p-sortIcon>
                    </th>
                    <th class="text-center" style="width:25%" pSortableColumn="email">
                        Email <p-sortIcon field="email"></p-sortIcon>
                    </th>
                    <th class="text-center" style="width:20%" pSortableColumn="phone">
                        Teléfono <p-sortIcon field="phone"></p-sortIcon>
                    </th>
                    <th class="text-center" style="width:15%" pSortableColumn="suspendedSims">
                        Líneas Vencidas <p-sortIcon field="suspendedSims"></p-sortIcon>
                    </th>
                    <th class="text-center" style="width:15%" pSortableColumn="totalSims">
                        Total Líneas <p-sortIcon field="totalSims"></p-sortIcon>
                    </th>
                </tr>
            </ng-template>

            <ng-template pTemplate="body" let-user>
                <tr>
                    <td class="text-center" style="width:25%">
                        <a [routerLink]="['/dashboard/dashboard-lines', user.id]" 
                           class="text-primary hover:text-primary-700">
                            {{user.username}}
                        </a>
                    </td>
                    <td class="text-center" style="width:25%">
                        {{user.email}}
                    </td>
                    <td class="text-center" style="width:20%">
                        {{user.phone}}
                    </td>
                    <td class="text-center" style="width:15%">
                        {{user.sims | suspendedSimsCount}}
                    </td>
                    <td class="text-center" style="width:15%">
                        {{user.totalSims - (user.sims | suspendedSimsCount)}}
                    </td>
                </tr>
            </ng-template>

            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="5" class="text-center p-4">
                        No se encontraron clientes.
                    </td>
                </tr>
            </ng-template>
        </p-table>
    </div>
    `,
    styles: [`
        :host ::ng-deep {
            .p-datatable {
                .p-datatable-thead > tr > th,
                .p-datatable-tbody > tr > td {
                    text-align: center !important;
                    justify-content: center !important;
                }
            }

            .p-input-icon-left {
                position: relative;
                display: inline-block;
            }

            .p-input-icon-left i {
                position: absolute;
                left: 0.75rem;
                top: 50%;
                transform: translateY(-50%);
                color: #6c757d;
            }

            .p-input-icon-left input {
                padding-left: 2rem;
            }
        }

        .back-link-button {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #666;
            cursor: pointer;
            font-size: 1rem;
            padding: 0.625rem;
            background: none;
            border: none;
            margin-top: -5px;
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

.search-icon {
    margin-left: 6px;
}

.p-input-icon-left i {
    left: 6px;
}
    `]
})
export class DashboardClientsComponent implements OnInit {
    @ViewChild('searchItem') searchItem!: ElementRef;
    @ViewChild('dt1') dt1!: Table;
    userName: string = ''; // Añade esta línea
    simsList: Sim[] = [];
    usersList: Users[] = [];
    usersWithSimStatus: any[] = []; // Nueva propiedad para almacenar usuarios con estado de SIMs
    usersWithSims: UserWithSims[] = [];
    loading = false;
    clientesListaPaginada: UserWithSims[] = []; // Cambiado de Users[] a UserWithSims[]
    paginaActual = 1;
    clientesPorPagina = 50;
    tiempoCarga: number = 0;
    totalPaginas: number = 1;
    filteredUsersWithSims: UserWithSims[] = [];
    searchTerm: string = '';
    minActiveLines: number = 0;
    totalSims: number = 0;
    suspendedSims: number = 0;
    usersSims: any[] = [];
    activeSims: number = 0;
    expiredSims: number = 0;


    notifications: Notification[] = [];
    unreadNotificationsCount: number = 0;


    constructor(
        private http: HttpClient,
        private simData: SimsDataService,
        @Inject(Router) private router: Router,
        private changeDetectorRef: ChangeDetectorRef,
        private notificationService: NotificationService,
        private location: Location
    ) { }

    ngOnInit(): void {
        const tiempoInicio = performance.now();
        // // // // console.log('Iniciando carga de datos...');

        this.getCompanySims();
        this.getUsersData();

        this.getUsersWithSimStatus(); // Nuevo método para obtener usuarios con estado de SIMs
        this.getUserName(); // Añade esta línea
        //this.getsimStatus();
        this.tiempoCarga = performance.now() - tiempoInicio;
        if (this.tiempoCarga > 3000) {
            console.warn('La carga de datos tomó más de 3 segundos');
        }
        this.filteredUsersWithSims = this.usersWithSims;
        this.loadNotifications(); // Added this line
    }


    getCompanySims() {
        let clientId = localStorage.getItem("ID");
        const url = `${environment.apiBackUrlclientesrastreogo}/sims/${clientId}`;

        // Obtiene la lista de SIMs asociadas al cliente
        // data contiene un array de objetos Sim con:
        // - id: número identificador de la SIM
        // - iccid: número ICCID de la SIM
        // - clientId: ID del cliente al que pertenece
        // - status: estado de la SIM (activo, suspendido, etc)
        // - imei: número IMEI del dispositivo
        // - simId: ID interno de la SIM
        // - planName: nombre del plan asociado
        // - dueDate: fecha de vencimiento
        // - activationDate: fecha de activación
        this.simData.getApiCall<Sim[]>(url).subscribe(
            (data) => {
                // console.log('Datos de data SIMs recibidos:', data);
                if (data && data.length > 0) {
                    // // // // console.log('data dentro de if', data);

                    // Filtra las SIMs que pertenecen al cliente actual
                    this.simsList = data.filter(sim => sim.clientId === clientId);

                    // Calcula el total de SIMs
                    //  const totalSims = data.length;
                    //  // // // // console.log('Total de SIMs:', totalSims);

                    // Calcula SIMs suspendidas
                    const simsSuspendidas = data.filter(sim => sim.status?.toLowerCase() === 'suspendido').length;
                    // // // // console.log('SIMs suspendidas:', simsSuspendidas);

                    // // // // console.log('simsList filtrada:', this.simsList);

                    // Calcula el total de SIMs
                    this.totalSims = this.simsList.length;

                    // Calcula el número de SIMs suspendidas
                    this.suspendedSims = this.simsList.filter(sim => sim.status?.toLowerCase() === 'Suspendido').length;

                    // // // // console.log(`Total de SIMs: ${this.totalSims}`);
                    // // // // console.log(`SIMs Suspendidas: ${this.suspendedSims}`);

                    this.updateUserLines();
                    // // // // // console.log('updateUserLines', this.updateUserLines);
                    // // // // console.log('SIMs obtenidas:', this.simsList);
                } else {
                    // Manejo en caso de que no haya SIMs
                    this.totalSims = 0;
                    this.suspendedSims = 0;
                    console.warn('No se encontraron SIMs para el cliente con ID:', clientId);
                }
            },
            (error) => {
                console.error('Error al obtener los SIMs:', error);
            }
        );
    }

    // getUsersWithSimStatus2() {
    //   let clientId = localStorage.getItem("ID");
    //   const url = `${environment.clienteiccidUrl}/users-with-sims/${clientId}`;
    //   // // // // console.log('url de clienteiccidUrl', url);

    //   this.simData.getApiCall<any[]>(url).subscribe(
    //     (data) => {
    //       // // // // console.log('Datos de sims filtradas recibidos:', data);
    //       if (data && data.length > 0) {
    //         // Procesar los datos recibidos
    //         this.usersWithSims = data.map(user => ({
    //           id: user.id,
    //           username: user.unitName,
    //           email: '', // Agregar si está disponible en la respuesta
    //           phone: '', // Agregar si está disponible en la respuesta
    //           sims: user.sims,
    //           totalSims: user.totalSims,
    //           activeSims: user.activeSims,
    //           expiredSims: user.expiredSims,
    //           lastActivityDate: new Date() // Usar fecha actual o de la respuesta si está disponible
    //         }));
    //         
    //         this.filteredUsersWithSims = this.usersWithSims;
    //         this.actualizarPaginacion();
    //         // // // // console.log('usersWithSims', this.usersWithSims);
    //         // // // // console.log('filteredUsersWithSims', this.filteredUsersWithSims);
    //         // // // // console.log('Usuarios con sims filtradas:', this.usersWithSims);
    //       }
    //     },
    //     (error) => {
    //       console.error('Error al obtener las sims filtradas:', error);
    //     }
    //   );
    // }

    // Nuevo método para obtener usuarios con estado de SIMs
    getUsersWithSimStatus() {
        const clientId = Number(localStorage.getItem("ID"));
        if (!clientId) {
            console.error('No se encontró el ID del cliente en localStorage');
            return;
        }
        // // // // console.log('clientId:', clientId);
        const url = `${environment.apiBackUrlclientesrastreogo}/users-with-sims/${clientId}`;
        //console.log('URL de la solicitud GET USERS WITH SIMS:', url);

        this.simData.getApiCall<UserWithSims[]>(url).subscribe(
            (data) => {
                //      console.log(' getUsersWithSimStatus Datos de data usuarios con estado de SIMs recibidos:', data);
                if (data && data.length > 0) {
                    data.forEach(user => {
                        // // // // console.log(`Usuario ${user.username}: Total SIMs: ${user.totalSims}, Activas: ${user.totalSims - (user.sims?.filter(sim => sim.status === 'Suspendido');.length || 0)}, Suspendidas: ${user.sims?.filter(sim => sim.status === 'Suspendido').length || 0}`);
                    });

                    this.usersWithSims = data;
                    this.filteredUsersWithSims = data;
                    this.actualizarPaginacion();
                    this.userName = data[0].username;

                    // // // // console.log('Usuarios con estado de SIMs:', this.usersWithSims);
                    // // // // console.log('Nombre de usuario:', this.userName);
                } else {
                    this.usersWithSims = [];
                    this.filteredUsersWithSims = [];
                    this.paginaActual = 1;
                    this.totalPaginas = 1;
                    this.userName = '';
                    console.warn('No se encontraron SIMs para el cliente con ID:', clientId);
                }
            },
            (error) => {
                console.error('Error al obtener los usuarios con estado de SIMs:', error);
            }
        );
    }

    getsimStatus() {
        let clientId = localStorage.getItem("ID");
        const url = `${environment.apiBackUrluser}/all-users-sims-by-client/${clientId}`;
        // // // // console.log('url de simStatus', url);

        this.simData.getApiCall<SimStatus[]>(url).subscribe(
            (data) => {
                this.usersSims = data;
                // // // // console.log('SIM STATUS Datos de data usuarios con estado de SIMs recibidos:', data);
            }
        );
    }

    getUsersData() {
        let clientId = localStorage.getItem("ID");
        if (!clientId) {
            console.error('No se encontró el ID del cliente en localStorage');
            return;
        }

        // Agregar log para ver el ID del cliente
        // // // // console.log('ID del cliente:', clientId);

        const url = `${environment.apiBackUrlclientesrastreogo}/users/${clientId}`;

        // Agregar log para ver la URL completa
        // // // // console.log('URL de la solicitud:', (url););

        this.simData.getApiCall<Users[]>(url).subscribe(
            (data) => {
                // Agregar log para ver los datos recibidos
                // // // // console.log('Datos de usuarios recibidos:', data);

                if (data && data.length > 0 && clientId) {
                    this.usersList = data;



                    // // // // console.log('Lista completa de usuarios:', this.usersList);
                    this.updateUserLines();
                    this.actualizarPaginacion();
                    this.changeDetectorRef.detectChanges(); // Forzar detección de cambios
                } else {
                    console.warn('No se encontraron datos de usuarios para este distribuidor');
                }
            },
            (error: HttpErrorResponse) => {
                console.error('Error al obtener los usuarios:', error);

                // Mejorar el manejo de errores
                if (error.status === 404) {
                    console.error('La ruta no existe. Verifica la URL y la configuración del servidor.');
                } else if (error.status === 0) {
                    console.error('No se pudo conectar con el servidor. Verifica la conexión de red.');
                } else {
                    console.error('Error desconocido al obtener los usuarios. Detalles:', error.message);
                }

                // Agregar log para ver los detalles completos del error
                // // // // console.log('Detalles completos del error:', error);
            }
        );
    }

    updateUserLines() {
        this.usersList.forEach(user => {
            // Todas las SIMs del distribuidor son potencialmente de sus usuarios
            const distributorSims = this.simsList;
            // // // // console.log('distributorSims de updateUserLines', distributorSims);
            user.totalLines = distributorSims.length;
            user.expiredLines = distributorSims.filter(sim => sim.status === 'Suspendido').length;
        });
    }

    actualizarPaginacion() {
        const inicio = (this.paginaActual - 1) * this.clientesPorPagina;
        const fin = inicio + this.clientesPorPagina;
        this.clientesListaPaginada = this.filteredUsersWithSims.slice(inicio, fin);
        this.totalPaginas = Math.ceil(this.filteredUsersWithSims.length / this.clientesPorPagina);
    }

    cambiarPagina(pagina: number) {
        if (pagina >= 1 && pagina <= this.totalPaginas) {
            this.paginaActual = pagina;
            this.actualizarPaginacion();
        }
    }

    search(): void {
        this.applyFilters();
    }

    onMinActiveLinesChange(event: Event): void {
        const target = event.target as HTMLInputElement;
        this.minActiveLines = parseInt(target.value, 10) || 0; // Asegura que sea un número
        this.applyFilters();
    }

    applyFilters(): void {
        this.filteredUsersWithSims = this.usersWithSims.filter(user => {
            const nameMatch = user.username.toLowerCase().includes(this.searchTerm.toLowerCase());
            const activeLines = user.totalSims - (user.sims.filter(sim => sim.status === 'Suspendido').length);
            const lineMatch = activeLines >= this.minActiveLines;
            return nameMatch && lineMatch;
        });
        this.paginaActual = 1; // Resetea a la primera página después de aplicar filtros
        this.actualizarPaginacion();
    }

    irAPagina(url: string): void {
        this.loading = true;
        setTimeout(() => {
            this.loading = false;
            // // // // // console.log('entro el metodo', url);
            this.router.navigate([url]);
        }, 1500)
    }

    callLogoutFromLines(): void {
        // Implementa la lógica de cierre de sesión aquí
        // // // // console.log('Cerrando sesión...');
    }

    getUserName(): void {
        // Implementa la lógica para obtener el nombre de usuario aquí
        this.userName = 'Usuario'; // Ejemplo
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
            notifications => {
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
        console.log('Botón regresar clickeado'); // Añade este log
        this.location.back();
    }

    clear(table: Table) {
        table.clear();
        this.searchTerm = '';
        this.minActiveLines = 0;
        this.applyFilters();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }
}