import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import {   RechargeplanMovement } from '../../../core/models/recharfeplanmovement.interface';
import { PaginatedResponse, RechargePlanMovementsService } from '../../../core/services/recharge-plan-movements.service';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { EMPTY, of } from 'rxjs';
import { interval, startWith } from 'rxjs';
import { Table } from 'primeng/table';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { InputGroupModule } from 'primeng/inputgroup';
import { RastreogoLoadingComponent } from '../../../core/components/rastreogo-loading';

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
    DropdownModule,
    CalendarModule,
    InputGroupModule,
    //RastreogoLoadingComponent
  ],
  selector: 'app-payment-history',
 // templateUrl: './Payment-history.component.html',

  styleUrls: ['./payment-history.component.css'],
  template: `

<!-- Contenedor principal con fondo y centrado 
<div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden"
style="background-image: url('assets/images/@RastreoGo-Transparente2.png'); background-size: cover; background-position: center;">

-->

<!-- Loading spinner 
   @if (loading) {
       <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
           <app-rastreogo-loading></app-rastreogo-loading>
       </div>
   }-->
    <div class="card">
        <button class="back-link-button" (click)="regresar()">
            <span class="arrow">←</span>
            <span>Regresar</span>
        </button>
        <div class="font-semibold text-xl mb-4">Historial de Pagos</div>
        
        <div class="filters-container">
          <div class="date-filters">
            <div class="date-input">
              <label>Fecha Inicio</label>
              <p-calendar 
                [(ngModel)]="fechaInicio"
                [locale]="es"
                [maxDate]="maxDate"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                placeholder="Seleccione fecha inicio"
                (onSelect)="onFechasChange()"
              ></p-calendar>
            </div>
            
            <div class="date-input">
              <label>Fecha Fin</label>
              <p-calendar 
                [(ngModel)]="fechaFin"
                [locale]="es"
                [maxDate]="maxDate"
                [showIcon]="true"
                dateFormat="dd/mm/yy"
                placeholder="Seleccione fecha fin"
                (onSelect)="onFechasChange()"
              ></p-calendar>
            </div>
          </div>

          <div class="filter-type">
            <label>Tipo de Transacción</label>
            <p-dropdown
              [options]="tiposTransaccion"
              [(ngModel)]="tipoSeleccionado"
              (onChange)="onTipoChange()"
              placeholder="Seleccione tipo"
              [style]="{'width': '200px'}"
            ></p-dropdown>
          </div>

          <div class="search-wrapper">
            <div class="p-input-icon-left search-container">
              <i class="pi pi-search search-icon"></i>
              <input 
                pInputText 
                type="text" 
                (input)="onGlobalFilter(dt1, $event)" 
                placeholder="Buscar..." 
                class="p-inputtext search-input"
              />
            </div>
          </div>
        </div>

        <p-table
            #dt1
            [value]="clientesListaPaginada"
            [rows]="10"
            [loading]="loading"
            [rowHover]="true"
            [showGridlines]="true"
            [paginator]="true"
            [globalFilterFields]="['user.username', 'sim.iccid', 'sim.name', 'amount', 'paymentStatus']"
            responsiveLayout="scroll"
        >
            <ng-template pTemplate="caption">
                <div class="flex justify-between items-center flex-column sm:flex-row">
                    <button pButton label="Exportar a Excel" class="p-button-outlined mb-2" icon="pi pi-file-excel" (click)="exportExcel()"></button>
                </div>
            </ng-template>
            
            <ng-template pTemplate="header">
                <tr>
                    <th>
                        <div class="flex justify-between items-center">
                            Nombre
                            <p-columnFilter type="text" field="user.username" display="menu"></p-columnFilter>
                        </div>
                    </th>
                    <th>
                        <div class="flex justify-between items-center">
                            ICCID
                            <p-columnFilter type="text" field="sim.iccid" display="menu"></p-columnFilter>
                        </div>
                    </th>
                    <th>
                        <div class="flex justify-between items-center">
                            Nombre de la unidad
                            <p-columnFilter type="text" field="sim.name" display="menu"></p-columnFilter>
                        </div>
                    </th>
                    <th>
                        <div class="flex justify-between items-center">
                            Fecha
                            <p-columnFilter type="date" field="createdAt" display="menu"></p-columnFilter>
                        </div>
                    </th>
                    <th>
                        <div class="flex justify-between items-center">
                            Monto
                            <p-columnFilter type="numeric" field="amount" display="menu" currency="USD"></p-columnFilter>
                        </div>
                    </th>
                    <th>
                        <div class="flex justify-between items-center">
                            Estado
                            <p-columnFilter field="paymentStatus" matchMode="equals" display="menu">
                                <ng-template pTemplate="filter" let-value let-filter="filterCallback">
                                    <p-dropdown 
                                        [ngModel]="value" 
                                        [options]="paymentStatuses" 
                                        (onChange)="filter($event.value)" 
                                        placeholder="Cualquiera">
                                        <ng-template let-option pTemplate="item">
                                            <span [class]="'status-' + option.value">{{ option.label }}</span>
                                        </ng-template>
                                    </p-dropdown>
                                </ng-template>
                            </p-columnFilter>
                        </div>
                    </th>
                    <th>Activación</th>
                    <th>Plan</th>
                    <th>Número de Transacción</th>
                </tr>
            </ng-template>
            
            <ng-template pTemplate="body" let-movement>
                <tr>
                    <td>{{ movement.user?.username || movement.client?.name }}</td>
                    <td>{{ movement.sim.iccid }}</td>
                    <td>{{ movement.sim.name }}</td>
                    <td>{{ movement.createdAt | date:'short' }}</td>
                    <td>{{ movement.amount | currency }}</td>
                    <td>
                        <span [class]="'status-' + movement.paymentStatus">
                            {{ movement.paymentStatus }}
                        </span>
                    </td>
                    <td>{{ movement.isFirstPost ? 'Sí' : 'No' }}</td>
                    <td>{{ movement.paymentMetadata?.planName || "N/A" }}</td>
                    <td>{{ movement.paymentMetadata?.transactionNumber || "N/A" }}</td>
                </tr>
            </ng-template>
            
            <ng-template pTemplate="emptymessage">
                <tr>
                    <td colspan="9">No se encontraron registros.</td>
                </tr>
            </ng-template>
        </p-table>
    </div>
  `,
  styles: [`
    /* Contenedor principal para los filtros */
    .filters-container {
      display: flex;                    /* Usa flexbox para organizar elementos */
      justify-content: space-between;   /* Distribuye espacio entre elementos */
      align-items: flex-end;           /* Alinea elementos al final del contenedor */
      margin-bottom: 1rem;             /* Margen inferior */
      gap: 1rem;                       /* Espacio entre elementos */
      flex-wrap: wrap;                 /* Permite que elementos se envuelvan */
    }

    /* Contenedor para los filtros de fecha */
    .date-filters {
      display: flex;                   /* Usa flexbox */
      gap: 1rem;                       /* Espacio entre filtros de fecha */
      flex-wrap: wrap;                 /* Permite envolver en pantallas pequeñas */
    }

    /* Estilo para cada input de fecha individual */
    .date-input {
      display: flex;                   /* Usa flexbox */
      flex-direction: column;          /* Apila elementos verticalmente */
      gap: 0.5rem;                    /* Espacio entre label e input */
    }

    /* Estilo para las etiquetas de fecha */
    .date-input label {
      font-size: 0.875rem;            /* Tamaño de fuente */
      color: #666;                    /* Color gris para las etiquetas */
    }

    /* Contenedor del buscador */
    .search-wrapper {
      min-width: 250px;               /* Ancho mínimo */
      max-width: 300px;               /* Ancho máximo */
    }

    /* Estilos específicos para componentes PrimeNG */
    :host ::ng-deep {
      /* Estilo para el calendario */
      .p-calendar {
        min-width: 200px;             /* Ancho mínimo del calendario */
      }

      .p-calendar .p-inputtext {
        width: 100%;                  /* Ancho completo del input */
      }

      /* Contenedor del campo de búsqueda */
      .search-container {
        position: relative;           /* Para posicionar el icono */
        width: 100%;                 /* Ancho completo */
      }

      /* Icono de búsqueda */
      .search-icon {
        position: absolute;           /* Posicionamiento absoluto */
        left: 10px;                  /* Distancia desde la izquierda */
        top: 50%;                    /* Centrado vertical */
        transform: translateY(-50%);  /* Ajuste fino del centrado */
        color: #6c757d;              /* Color gris del icono */
        z-index: 1;                  /* Sobre el input */
      }

      /* Input de búsqueda */
      .search-input {
        width: 100%;                 /* Ancho completo */
        padding: 0.75rem;            /* Relleno interno */
        padding-left: 2.5rem !important; /* Espacio para el icono */
        border: 1px solid #ced4da;   /* Borde gris */
        border-radius: 6px;          /* Bordes redondeados */
        font-size: 1rem;             /* Tamaño de fuente */
        transition: all 0.2s;        /* Animación suave */
      }

      /* Estado focus del input */
      .search-input:focus {
        outline: none;               /* Elimina el contorno por defecto */
        border-color: #2196F3;       /* Borde azul al focus */
        box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.2); /* Sombra suave */
      }

      /* Ajustes de altura para calendarios */
      .p-calendar .p-inputtext {
        padding: 0.75rem;            /* Relleno interno */
        height: 45px;                /* Altura fija */
      }

      /* Botones del calendario */
      .p-calendar .p-button {
        height: 45px;                /* Misma altura que el input */
      }

      /* Contenedor de filtros - Organiza los elementos del filtro en columna con espacio entre ellos */
      .filter-type {
        display: flex;                /* Usa flexbox para layout */
        flex-direction: column;       /* Apila elementos verticalmente */
        gap: 0.5rem;                 /* Espacio de 0.5rem entre elementos */
      }

      /* Etiquetas de los filtros - Define el estilo del texto de las etiquetas */
      .filter-type label {
        font-size: 0.875rem;         /* Tamaño de fuente de 14px */
        color: #666;                 /* Color gris medio para el texto */
      }

      /* Dropdown del filtro - Define la altura del componente dropdown */
      .p-dropdown {
        height: 30px;                /* Altura fija de 45px */
      }

      /* Etiqueta dentro del dropdown - Alinea el contenido verticalmente */
      .p-dropdown-label {
        display: flex;               /* Usa flexbox */
        align-items: center;         /* Centra elementos verticalmente */
      }
    }

    /* Estilos responsivos */
    @media screen and (max-width: 768px) {
      .filters-container {
        flex-direction: column;       /* Apila elementos en móvil */
        align-items: stretch;         /* Estira elementos al ancho completo */
      }

      .search-wrapper {
        max-width: 100%;             /* Ancho completo en móvil */
      }
    }
  `]
})
export class PaymentHistoryComponent implements OnInit {
  searchTerm: string = '';
  minActiveLines: number = 0;
  clientesListaPaginada: RechargeplanMovement[] = [];
  totalPaginas: number = 1;
  paginaActual: number = 1;
  userName: string = '';
  loading: boolean = false;
  token: string | null = '';
 // movements: RechargePlanMovement[] = [];
  RechargeplanMovement: RechargeplanMovement[] = [];

  notifications: Notification[] = [];
  unreadNotificationsCount: number = 0;


  // Agregar variables para los filtros
  startDate?: string;
  endDate?: string;
  paymentStatus?: string;
  amount?: number;
  isFirstPost?: boolean;
  details?: string;
  createdAt?: string;
  //id?: number;
  
  // Agregar nueva propiedad para almacenar todos los movimientos
  todosLosMovimientos: RechargeplanMovement[] = [];
  
  previousUrl: string = '';

  paymentStatuses = [
    { label: 'Pendiente', value: 'PENDING' },
    { label: 'Completado', value: 'COMPLETED' },
    { label: 'Fallido', value: 'FAILED' }
  ];

  // Configuración para el calendario en español
  es = {
    firstDayOfWeek: 1,
    dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
    monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
    monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
    today: 'Hoy',
    clear: 'Limpiar'
  };

  // Variables para el rango de fechas
  fechaInicio: Date | null = null;
  fechaFin: Date | null = null;
  maxDate: Date = new Date();

  tiposTransaccion = [
    { label: 'Todos', value: 'todos' },
    { label: 'Activaciones', value: 'activaciones' },
    { label: 'No Activaciones', value: 'no-activaciones' }
  ];

  tipoSeleccionado: string = 'todos';

  constructor(
    private authService: AuthService,
      private rechargeService: RechargePlanMovementsService,
      private router: Router,
      private location: Location,
  ) { }

  ngOnInit(): void {
    this.previousUrl = localStorage.getItem('previousUrl') || '';
  //  console.log('previousUrl en ngOnInit:', this.previousUrl);
    
    this.obtenerToken();
    this.fetchMovements();
  }

  obtenerToken(): void {
    this.token = localStorage.getItem('authToken');
    // // // // console.log('Token obtenido:', this.token);
    
    if (this.token) {
      try {
        const tokenParts = this.token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          // // // // console.log('Contenido del token:', payload);
          this.userName = payload.name;
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }
  }

  search(): void {
    this.paginaActual = 1; // Reiniciar a la primera página al realizar una nueva búsqueda
    this.applyFilters();
  }

  onMinActiveLinesChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.minActiveLines = parseInt(target.value, 10) || 0;
    this.applyFilters();
  }

  applyFilters(): void {
    this.fetchMovements();
  }

  fetchMovements(): void {
    this.loading = true;

    const params = {
      startDate: this.fechaInicio ? this.fechaInicio.toISOString() : undefined,
      endDate: this.fechaFin ? this.fechaFin.toISOString() : undefined,
      userId: this.userId(),
      isFirstPost: this.tipoSeleccionado === 'activaciones' ? true : 
                  this.tipoSeleccionado === 'no-activaciones' ? false : undefined,
      paymentStatus: this.paymentStatus,
      page: this.paginaActual,
      limit: 10
    };

    this.rechargeService.searchMovements(params).subscribe({
      next: (response: PaginatedResponse<RechargeplanMovement>) => {
        this.clientesListaPaginada = response.items;
        this.totalPaginas = response.meta.totalPages;
        this.loading = false;
        // console.log('Movimientos obtenidos:', response);
      },
      error: (error) => {
        console.error('Error al obtener los movimientos:', error);
        this.loading = false;
      }
    });
  }

  actualizarPaginacion(): void {
    this.fetchMovements();
  }

  cambiarPagina(pagina: number): void {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
      this.actualizarPaginacion();
    }
  }

 

  callLogoutFromLines(): void {
    // // // // console.log('Cerrando sesión...');
  }
  
  irAPagina(url: string): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      // this.router.navigate([url]);
    }, 1500)
  }

  // Método para obtener el ID del usuario actual
  private userId(): number | undefined {
    // Implementa la lógica para obtener el ID del usuario desde el token o el servicio de autenticación
    // Ejemplo:
    // return this.authService.getCurrentUserId();
    return undefined; // Reemplaza con tu implementación
  }

  exportExcel(): void {
    const fechaActual = new Date();
    const fechaFormateada = this.formatDateForFileName(fechaActual);
    
    const tipoTransaccion = this.tipoSeleccionado === 'activaciones' ? 'Activaciones' :
                           this.tipoSeleccionado === 'no-activaciones' ? 'No_Activaciones' : 
                           'Todos';

    const datosParaExportar = this.clientesListaPaginada.map(item => {
      return {
        'Fecha de Transacción': this.formatDate(item.createdAt),
        'Usuario': item.user?.username || '',
        'ICCID': item.sim?.iccid || '',
        'Nombre SIM': item.sim?.name || '',
        'Monto': this.formatAmount(Number(item.amount)),
        'Estado': this.getEstadoPago(item.paymentStatus),
        'Tipo': item.isFirstPost ? 'Activación' : 'No Activación',
        'Fecha de Exportación': this.formatDate(new Date())
      };
    });

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(datosParaExportar);

    // Ajustar ancho de columnas
    const wscols = [
      { wch: 20 }, // Fecha de Transacción
      { wch: 15 }, // Usuario
      { wch: 15 }, // ICCID
      { wch: 15 }, // Nombre SIM
      { wch: 12 }, // Monto
      { wch: 12 }, // Estado
      { wch: 15 }, // Tipo
      { wch: 20 }  // Fecha de Exportación
    ];
    worksheet['!cols'] = wscols;

    const workbook: XLSX.WorkBook = { 
      Sheets: { 'Historial de Pagos': worksheet }, 
      SheetNames: ['Historial de Pagos'] 
    };

    const fileName = `Historial_de_Pagos_${tipoTransaccion}_${fechaFormateada}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  }

  // Función para formatear fecha para el nombre del archivo
  private formatDateForFileName(date: Date): string {
    const dia = date.getDate().toString().padStart(2, '0');
    const mes = (date.getMonth() + 1).toString().padStart(2, '0');
    const anio = date.getFullYear();
    const hora = date.getHours().toString().padStart(2, '0');
    const minutos = date.getMinutes().toString().padStart(2, '0');
    
    return `${dia}-${mes}-${anio}_${hora}-${minutos}`;
  }

  // Función mejorada para formatear fechas
  private formatDate(date: string | Date): string {
    if (!date) return '';
    const fechaObj = new Date(date);
    return fechaObj.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  private formatAmount(amount: number): string {
    return amount ? `$${amount.toFixed(2)}` : '$0.00';
  }

  private getEstadoPago(status: string): string {
    const estadosMap: { [key: string]: string } = {
      'PENDING': 'Pendiente',
      'COMPLETED': 'Completado',
      'FAILED': 'Fallido'
    };
    return estadosMap[status] || status;
  }

  regresar(): void {
    this.location.back();
  }

  // Agregar método para el filtro global
  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  // Agregar método para limpiar filtros
  clear(table: Table) {
    table.clear();
  }

  // Método para manejar el cambio en el rango de fechas
  onFechasChange(): void {
    if (this.fechaInicio && this.fechaFin) {
      if (this.fechaInicio > this.fechaFin) {
        // Si la fecha inicial es mayor que la final, intercambiarlas
        const temp = this.fechaInicio;
        this.fechaInicio = this.fechaFin;
        this.fechaFin = temp;
      }
      this.fetchMovements();
    }
  }

  onTipoChange() {
    this.fetchMovements();
  }

}
