import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SimsDataService } from '../../../core/services/sims-data.service';
import { UserWithSims, SimStatus, Sim } from '../../../core/models/sim.model';
import { ViewChild, ElementRef } from '@angular/core';
import { NotificationService } from '../../../core/services/notification.service';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { interval } from 'rxjs';
import { EMPTY, startWith } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Notification } from '../../../core/models/notification.model';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { Location } from '@angular/common';
import { RippleModule } from 'primeng/ripple';
import { IconFieldModule } from 'primeng/iconfield';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import * as XLSX from 'xlsx';
import { RastreogoLoadingComponent } from '../../../core/components/rastreogo-loading';
import { InputGroupModule } from 'primeng/inputgroup';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TableModule,
    MultiSelectModule,
    SelectModule,
    InputIconModule,
    TagModule,
    InputTextModule,
    ButtonModule,
    RippleModule,
    IconFieldModule,
    ToastModule,
    TooltipModule,
    InputGroupModule,
   // RastreogoLoadingComponent
  ],
  providers: [MessageService, NotificationService, SimsDataService],
  selector: 'app-dashboard-lines',
  templateUrl: './dashboard-lines.component.html',
  styleUrls: ['./dashboard-lines.component.css'],
  template: `
    <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden">
      @if (loading) {
        <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
          <app-rastreogo-loading></app-rastreogo-loading>
        </div>
      }
      <div class="container">
        <div class="content" role="main">
          <div class="tabla-container" *ngIf="user">
            <div class="card">
              <!-- Asegúrate de que este div esté fuera de p-table -->
              <div class="back-link" (click)="regresar()">
                <span class="arrow">←</span> Regresar
              </div>

              <div class="font-semibold text-xl mb-4">Líneas de {{ user.username }}</div>

              <p-table
                #dt1
                [value]="filteredUserSims"
                dataKey="id"
                [rows]="10"
                [loading]="loading"
                [rowHover]="true"
                [showGridlines]="true"
                [paginator]="true"
                [globalFilterFields]="['iccid', 'planName', 'gps', 'imei', 'status']"
                responsiveLayout="scroll"
              >
                <ng-template pTemplate="caption">
                  <div class="flex justify-between items-center flex-column sm:flex-row">
                    <div class="filter-container">
                      <label for="statusFilter">Filtrar por estado:</label>
                      <p-select
                        id="statusFilter"
                        [(ngModel)]="selectedStatus"
                        (onChange)="filterSimsByStatus($event.value)"
                        [options]="[
                          {label: 'Todos', value: 'all'},
                          {label: 'Activo', value: 'Activo'},
                          {label: 'Suspendido', value: 'Suspendido'},
                          {label: 'Inactivo', value: 'Inactivo'}
                        ]"
                      ></p-select>
                    </div>
                    <!-- Eliminar o comentar el botón de CSV si no lo necesitas -->
                    <!-- <button pButton label="Exportar CSV" icon="pi pi-download" class="p-button-outlined" (click)="exportToCSV()"></button> -->
                    <button pButton label="Exportar Excel" icon="pi pi-file-excel" class="p-button-outlined" (click)="exportToExcel()"></button>
                    <p-iconfield iconPosition="left" class="ml-auto">
                      <p-inputicon>
                        <i class="pi pi-search"></i>
                      </p-inputicon>
                      <input pInputText type="text" (input)="onGlobalFilter(dt1, $event)" placeholder="Buscar..." />
                    </p-iconfield>
                  </div>
                </ng-template>

                <ng-template pTemplate="header">
                  <tr>
                    <th>ID</th>
                    <th>
                      <div class="flex justify-between items-center">
                        ICCID
                        <p-columnFilter type="text" field="iccid" display="menu"></p-columnFilter>
                      </div>
                    </th>
                    <th>
                      <div class="flex justify-between items-center">
                        Plan
                        <p-columnFilter type="text" field="planName" display="menu"></p-columnFilter>
                      </div>
                    </th>
                    <th>GPS</th>
                    <th>IMEI</th>
                    <th>
                      <div class="flex justify-between items-center">
                        Estado
                        <p-columnFilter field="status" matchMode="equals" display="menu">
                          <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                            <p-select [ngModel]="value" [options]="[
                              {label: 'Activo', value: 'Activo'},
                              {label: 'Suspendido', value: 'Suspendido'},
                              {label: 'Inactivo', value: 'Inactivo'}
                            ]" (onChange)="filter($event.value)" placeholder="Seleccionar estado">
                            </p-select>
                          </ng-template>
                        </p-columnFilter>
                      </div>
                    </th>
                    <th>Fecha de Vencimiento</th>
                    <th>Fecha de activación</th>
                    <th>Acciones</th>
                  </tr>
                </ng-template>

                <ng-template pTemplate="body" let-sim>
                  <tr>
                    <td>{{sim.id}}</td>
                    <td>{{sim.iccid}}</td>
                    <td>{{sim.planName}}</td>
                    <td>{{sim.gps}}</td>
                    <td>{{sim.imei}}</td>
                    <td>
                      <span [class]="'status-badge status-' + sim.status.toLowerCase()">
                        {{sim.status}}
                      </span>
                    </td>
                    <td>{{sim.dueDate | date:'dd/MM/yyyy'}}</td>
                    <td>{{sim.activationDate | date:'dd/MM/yyyy'}}</td>
                    <td>
                      <div class="flex gap-2">
                        <button pButton icon="pi pi-refresh" class="p-button-rounded p-button-success" (click)="rechargeOne(sim)" tooltip="Recargar"></button>
                        <button pButton icon="pi pi-pencil" class="p-button-rounded p-button-primary" (click)="editar(sim)" tooltip="Editar"></button>
                      </div>
                    </td>
                  </tr>
                </ng-template>

                <ng-template pTemplate="emptymessage">
                  <tr>
                    <td colspan="9">No se encontraron líneas.</td>
                  </tr>
                </ng-template>
              </p-table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-link {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      cursor: pointer;
      font-size: 16px;
      padding: 10px;
      width: fit-content;
      margin-bottom: 10px;
    }

    .arrow {
      font-size: 20px;
      line-height: 1;
    }

    .back-link:hover {
      color: #333;
    }

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
  `]
})
export class DashboardLinesComponent implements OnInit {
  @ViewChild('searchItem') searchItem!: ElementRef;
  @ViewChild('dt1') dt1!: Table;
  userId: string | null = null;
  userSims: SimStatus[] = [];
  user: UserWithSims | null = null;
  unitname: string | null = null;
  userName: string = '';
  loading = false;
  filteredUserSims: SimStatus[] = [];
  selectedStatus: string = 'all';

  notifications: Notification[] = [];
  unreadNotificationsCount: number = 0;

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  constructor(
    private route: ActivatedRoute,
    private simData: SimsDataService,
    private router: Router,
    private location: Location,
    private notificationService: NotificationService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
      this.getUserWithSims(this.userId);
    }
   // this.getUserName();

    // No inicialices filteredUserSims aquí, ya que userSims aún no tiene datos
  }

  getUserWithSims(userId: string) {
    let distributorId = localStorage.getItem("ID");
    const url = `${environment.apiBackUrlclientesrastreogo}/users-with-sims/${distributorId}`;
    // // // console.log('url', url)
    this.simData.getApiCall<UserWithSims[]>(url).subscribe(
      (data) => {
        if (data && data.length > 0) {
          this.user = data.find(user => user.id.toString() === userId) || null;
          if (this.user) {
            this.userSims = this.user.sims;
            this.filteredUserSims = this.userSims; // Inicializa filteredUserSims aquí
            // // console.log('SIMs del usuario:', this.userSims);
            this.userName = this.user.username;
            localStorage.setItem('userName', this.userName);
            // // console.log('Nombre del usuario:', this.userName);
          } else {
            // // console.log('No se encontró el usuario');
          }
        } else {
          // // console.log('No se encontraron datos de usuarios con SIMs');
        }
      },
      (error) => {
        console.error('Error al obtener los datos de usuarios con SIMs:', error);
      }
    );
  }

  rechargeOne(sim: SimStatus): void {
    // // console.log('Recargando SIM:', sim);
    
    const simToRecharge: Sim = {
      ...sim,
      clientId: localStorage.getItem("ID") || '0', // Convertir a string
      simId: sim.id, // Convertir a string si es necesario
      name: sim.name || ''


    };
    const sims = [{
      iccid: sim.iccid,
      name: sim.name,
      id: sim.id,
    }]
    localStorage.setItem('simsarray', JSON.stringify(sims));


    
    this.simData.setSharedSims([simToRecharge]);
    
    // Navegar a la página de recargas con los parámetros necesarios
    this.router.navigate(['lines/line-details'], {
      queryParams: {
        iccid: sim.iccid,
        simId: sim.id,
        userId: this.userId,
        unitname: sim.name || ''
      }
    });
  }

  getUserName(): void {
    // Implementa la lógica para obtener el nombre de usuario
    this.userName = localStorage.getItem('userName') || '';
    // // console.log('Nombre del usuario:', this.userName);
  }


  
  search(): void {
    // // console.log('Búsqueda realizada:', this.searchItem.nativeElement.value);
    // Implementa la lógica de búsqueda aquí
  }

 

  irAPagina(url: string): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      if (url === '/historial-pagos') {
        // Guardar la URL actual antes de navegar
        localStorage.setItem('previousUrl', '/dashboard/dashboard-lines');
       // console.log('previousUrl guardada:', localStorage.getItem('previousUrl'));
      }
      this.router.navigate([url]);
    }, 1500);
  }

  callLogoutFromLines(): void {
    // // console.log('Cerrando sesión...');
    // Implementa la lógica de cierre de sesión aquí
  }

  filterSimsByStatus(status: string) {
    if (status === 'all') {
      this.filteredUserSims = this.userSims;
    } else {
      this.filteredUserSims = this.userSims.filter(sim => sim.status.toLowerCase() === status.toLowerCase());
    }
  }

  exportToCSV() {
    // Encabezados con formato español
    const headers = [
      'ID',
      'ICCID',
      'Plan',
      'GPS',
      'IMEI', 
      'Estado',
      'Fecha de Vencimiento',
      'Fecha de Activación'
    ];

    // Formatear los datos
    const csvData = this.filteredUserSims.map(sim => {
      // Formatear fechas al estilo español
      const dueDate = sim.dueDate ? new Date(sim.dueDate).toLocaleDateString('es-ES') : '';
      const activationDate = sim.activationDate ? new Date(sim.activationDate).toLocaleDateString('es-ES') : '';

      return [
        sim.id,
        sim.iccid,
        sim.planName || '',
        sim.gps || '',
        sim.imei || '',
        sim.status,
        dueDate,
        activationDate
      ];
    });

    // Crear contenido CSV con BOM para Excel
    let csvContent = '\ufeff'; // Agregar BOM para caracteres especiales en Excel
    
    // Agregar encabezados
    csvContent += headers.join(';') + '\n';
    
    // Agregar datos
    csvData.forEach(row => {
      // Procesar cada celda para manejar comas y punto y coma
      const processedRow = row.map(cell => {
        // Si la celda contiene comas o punto y coma, envolverla en comillas
        if (cell && (cell.toString().includes(',') || cell.toString().includes(';'))) {
          return `"${cell}"`;
        }
        return cell;
      });
      csvContent += processedRow.join(';') + '\n';
    });

    // Crear y descargar el archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Configurar nombre del archivo con fecha
    const date = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    const fileName = `lineas_distribuidor_${date}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToExcel() {
    // Preparar los datos en formato español
    const data = this.filteredUserSims.map(sim => ({
      'ID': sim.id,
      'ICCID': sim.iccid,
      'Plan': sim.planName || '',
      'GPS': sim.gps || '',
      'IMEI': sim.imei || '',
      'Estado': sim.status,
      'Fecha de Vencimiento': sim.dueDate ? new Date(sim.dueDate).toLocaleDateString('es-ES') : '',
      'Fecha de Activación': sim.activationDate ? new Date(sim.activationDate).toLocaleDateString('es-ES') : ''
    }));

    // Crear el libro de trabajo
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Líneas');

    // Configurar el ancho de las columnas
    const columnsWidth = [
      { wch: 10 },  // ID
      { wch: 20 },  // ICCID
      { wch: 20 },  // Plan
      { wch: 15 },  // GPS
      { wch: 20 },  // IMEI
      { wch: 15 },  // Estado
      { wch: 20 },  // Fecha de Vencimiento
      { wch: 20 }   // Fecha de Activación
    ];
    worksheet['!cols'] = columnsWidth;

    // Generar el archivo Excel
    const date = new Date().toLocaleDateString('es-ES').replace(/\//g, '-');
    XLSX.writeFile(workbook, `lineas_distribuidor_${date}.xlsx`);
  }

  editar(sim: SimStatus): void {
    // Guardar el userId actual en localStorage antes de navegar
    if (this.userId) {
      localStorage.setItem('currentUserId', this.userId);
    }
    
    this.router.navigate(['dashboard/dashboard-edit-imei'], { 
      queryParams: { 
        simId: sim.id,
        userId: this.userId
      }
    });
  }
  
  regresar(): void {
    this.location.back();
  }

  getSeverity(status: string): 'success' | 'danger' | 'warn' | 'info' {
    switch (status.toLowerCase()) {
        case 'activo':
            return 'success';
        case 'suspendido':
            return 'danger';
        case 'inactivo':
            return 'warn';
        default:
            return 'info';
    }
  }
}