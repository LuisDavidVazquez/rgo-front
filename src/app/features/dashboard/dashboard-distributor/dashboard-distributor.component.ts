import { Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Sim } from '../../../core/models/sim.model';
//import { apiUrl, apiUrlSims } from '../routes';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, tap } from 'rxjs';
import { SimsDataService } from '../../../core/services/sims-data.service';

import { of, EMPTY } from 'rxjs';
import { interval, startWith } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { RastreogoLoadingComponent } from '../../../core/components/rastreogo-loading';


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ChartModule,
    RastreogoLoadingComponent
  ],                
  selector: 'app-dashboard-distributor',
  templateUrl: './dashboard-distributor.component.html',
  styleUrls: ['./dashboard-distributor.component.css'],

})
export class DashboardDistributorComponent implements OnInit {
  name: string = ''; // Inicializamos con string vacío para evitar undefined
  loading = false;
  pieChartBackground: string = '';
  activeSims: number = 0;
  suspendedSims: number = 0;
  
  notifications: Notification[] = [];
  unreadNotificationsCount: number = 0;

  constructor(
    private http: HttpClient,
    @Inject(Router) private router: Router,

    private route: ActivatedRoute,
    private simData: SimsDataService,
    private authService: AuthService,
  ) {
    this.initChartOptions();
  }

  toggleMenuItem(menuItem: any) {
    // Cambia el estado isSelected del elemento
    menuItem.isSelected = !menuItem.isSelected;
  }
  @ViewChild('searchItem') searchItem!: ElementRef;
  totalSims: number = 0;
  activas: number = 0;
  inactivas: number = 0;
  vencidas: number = 0;
  inventario: number = 0;



  // SIMs arrays
  filteredSims: Sim[] = [];
  simsList: Sim[] = [];
  ready: Sim[] = [];
  active: Sim[] = [];
  suspended: Sim[] = [];
  inactive: Sim[] = [];
  selectedSims: Set<Sim> = new Set();
  // Paginacion
  totalItems: number = 0;
  pageSize: number = 20;
  currentPage: number = 1;
  pageItems: Sim[] = [];
  totalPages: number = 0;
  // Control Booleans 
  admin: boolean = false;
  user: boolean = true;
  selectAll: boolean = false;
  selectAllStatus: { [key: number]: boolean } = {
    1: false
  }
  private apiUrl = environment.apiUrl; // Cambia esto a tu URL de API
  private apiUrlSims = environment.apiUrlSimService; // Cambia esto a tu URL de API

  // Agregamos las propiedades para la gráfica
  pieData: any;
  pieOptions: any;

  ngOnInit(): void {
    this.loadUserData();
    this.getCompanySims();
   // this.loadNotifications();
   // this.startNotificationPolling();
  }
  loadUserData() {
    const clientId = localStorage.getItem("ID");
    const email = localStorage.getItem("email");
    const name = localStorage.getItem("USERDATA") || '';
    const token = localStorage.getItem("authToken");
    const permission = localStorage.getItem("permission");
    const clientLevel = localStorage.getItem("clientlevel");
    const externalId = localStorage.getItem("externalId");
    const phone = localStorage.getItem("phone");

    // // // // console.log(



// // // // "Datos del token:", {
// // // //       clientId,
// // // //       email,
// // // //       name,
// // // //       token,
// // // //       permission,
// // // //       clientLevel,
// // // //       externalId,
// // // //       phone
// // // //     }
// // // // 
// // // 
// // 
// );

    this.name = name;
  }


  callLogoutFromLines() {//para hacer loguth
    this.authService.logout();

  }


  userChange() {  // Boton temporar para cambiar de usuario 
    this.admin = !this.admin;
    this.user = !this.user;
  }

  async getCompanySims() {
    const client = localStorage.getItem("ID");
    const token = localStorage.getItem('authToken');
    const permission = localStorage.getItem('permission');
    // // console.log("Token de SIMS:", token, "Cliente:", client, "Permiso:", permission);
    if (!client || !token) {
      console.error('Faltan datos necesarios:', { client, token });
      return;
    }
  
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    };
  
    const url = `${environment.apiBackUrlclientesrastreogo}/sims/${client}`;
  
    this.simData.getApiCall<Sim[]>(url).subscribe(
      (data) => {
        if (data && data.length > 0) {
          // // console.log('Datos recibidos:', data);
          this.simsList = data;
          
          this.simsList.forEach(sim => {
            // // console.log(`SIM ID: ${sim.id}, Status: ${sim.status}, Distributor ID: ${sim.clientId}`);
          });

          this.active = this.simsList.filter(sim => sim.status?.toLowerCase() === 'activo');
          this.suspended = this.simsList.filter(sim => sim.status?.toLowerCase() === 'suspendido');
          this.inactive = this.simsList.filter(sim => sim.status?.toLowerCase() === 'inventario');

          // // console.log('SIMs activas:', this.active);
          // // console.log('SIMs suspendidas:', this.suspended);
          // // console.log('SIMs inventario:', this.inactive);

          this.activas = this.active.length;
          this.inactivas = this.suspended.length;
          this.inventario = this.inactive.length;
          this.totalSims = this.simsList.length;

          this.updateChart();
        } else {
          console.warn('No se encontraron SIMs para el distribuidor proporcionado');
          alert('No se encontraron SIMs asociadas a esta cuenta');
          this.simsList = [];
          this.filteredSims = [];
          this.totalSims = 0;
          this.activas = 0;
          this.vencidas = 0;
          this.inventario = 0;
          this.updateChart();
        }
      },
      (error) => {
        console.warn('No se encontraron SIMs para el distribuidor proporcionado');
        alert('No se encontraron SIMs asociadas a esta cuenta');
        this.simsList = [];
        this.filteredSims = [];
        this.totalSims = 0;
        this.activas = 0;
        this.vencidas = 0;
        this.inventario = 0;
        this.updateChart();
      }
    );
  }

  onSimSelectionChange(sim: Sim) {
    if (sim.selected) {
      this.selectedSims.add(sim)
    }
    else {
      if (this.selectedSims.has(sim)) {
        this.selectedSims.delete(sim)
      }
    }
  }

  // Selecciona todos los elementos de la pagina
  toggleSelectAll() {
    if (this.currentPage in this.selectAllStatus) {
      this.selectAllStatus[this.currentPage] = this.selectAll;
    }
    if (this.selectAll) {
      for (const sim of this.pageItems) {
        this.selectedSims.add(sim);
      }
    }
    else {
      for (const sim of this.pageItems) {
        sim.selected = this.selectAll;
        if (this.selectedSims.has(sim)) {
          this.selectedSims.delete(sim)
        }
      }
    }
    for (const sim of this.pageItems) {
      sim.selected = this.selectAll; // Actualizar el estado de selección de cada sim
    }
  }


  filterSims(status: string) {
    this.selectAll = false;
    this.selectedSims = new Set();
    this.filteredSims = [];

    if (status === 'Total') {
      this.filteredSims = this.simsList;
    } else {
      this.filteredSims = this.simsList.filter(sim => sim.status === status);
    }
    this.resetPageOptions()
    this.getPageElements()
  }

  private resetPageOptions() {
    this.totalItems = 0;
    //this.pageSize = 20;
    this.currentPage = 1;
    this.pageItems = [];
    this.totalPages = 0;
    this.selectAllStatus = { 1: false }
    for (const sim of this.simsList) {
      sim.selected = false;
    }
  }

  async getPageElements() {
    // Lógica para obtener la lista completa de elementos
    this.totalItems = this.filteredSims.length;
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pageItems = this.filteredSims.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.totalItems / this.pageSize)
    // // // // // console.log(this.totalItems, startIndex, endIndex, this.totalPages)
  }
     
  previousPage() {
    // // // // console.log(this.selectAllStatus, this.selectAll)
    if (this.currentPage > 1) {
      this.currentPage--;
      this.getPageElements();
    }
    if (this.currentPage in this.selectAllStatus) {
      this.selectAll = this.selectAllStatus[this.currentPage];
    }
    else {
      this.selectAllStatus[this.currentPage] = false;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.getPageElements();
      if (this.selectAll) {
        this.selectAll = !this.selectAll
      }
    }
    if (this.currentPage in this.selectAllStatus) {
      this.selectAll = this.selectAllStatus[this.currentPage];
    }
    else {
      this.selectAllStatus[this.currentPage] = false;
    }
    // // // // console.log(this.selectAllStatus, this.selectAll)
  }

  resetPageSize() {
    this.filterSims('Total');
  }
///////////////////////////////////////////
  async resetConection(sim: Sim) {
    // // // // console.log("Reset")
    let url: string;
    if (sim.endpointId != 'NA') {
      url = this.apiUrlSims + '/api/v1/sims/reset/' + sim.endpointId
    }
    else {
      url = this.apiUrlSims + '/api/v1/sims/reset/' + sim.iccid
    }
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
  
    // Realiza la solicitud POST
    this.http.patch<any>(url, httpOptions).pipe(
      tap((response) => {
        if (response === 204) {
          alert('La conexion de la linea ha sido reseteada con exito');
        }
        else {
          // // // // console.log(response)
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 404) {
          const message = error.error.message;
          alert(`Error:  ${error.status} \n ${message} `);
        }
        else if (error.status === 500) {
          const message = error.error.message;
          alert(`Error:  ${error.status} \n ${message} `);
        }
        else if (error.status === 409) {
          const message = error.error.message;
          alert(`Error:  ${error.status} \n ${message} `);
        }
        return ('Ocurrió un error en la solicitud');
      })
    ).subscribe();
  }
  //////////////////////////////////////////////////////////////////////

  rechargeOne(sim: Sim): void {
    if (!sim.id) return;
    else {
      this.simData.setSharedSims([sim])
    }
    this.selectedSims = new Set();
    this.selectAll = false;
    this.selectAllStatus = { 1: false }
    this.resetPageOptions()
    this.router.navigate(['/recargas'], {
    })
  }

  rechargeAll(): void {
    if (this.selectedSims.size === 0) {
      alert('Ningun sim seleccionado')
    }
    else {
      this.simData.setSharedSims([...this.selectedSims])
      this.selectedSims = new Set();
      this.selectAll = false;
      this.selectAllStatus = { 1: false }
      this.resetPageOptions()
      this.router.navigate(['/recargas'], {
      })
    }
  }

  createService(simIccid: string) {
    const clientId = localStorage.getItem("ID"); // Obtener el ID del cliente
    const dataToSend = { iccid: simIccid, distributorId: clientId }; // Incluir clientId como distributorid en dataToSend
    // // // // console.log(dataToSend, 'esto es data send')
    this.simData.setSharedSims([...this.selectedSims]);
    this.router.navigate(['/altas'], { relativeTo: this.route, queryParams: dataToSend });
  }

  search(): void {
    // // // // console.log("Respuesta")
    this.filteredSims = this.simsList.filter((sim) => this.coincideTerminoBusqueda(sim));
    this.getPageElements();
  }

  coincideTerminoBusqueda(elemento: Sim): boolean {
    const termino = this.searchItem.nativeElement.value.toLowerCase();
    return Object.values(elemento).some((valor) => {
      if (typeof valor === 'string') {
        return valor.toLowerCase().includes(termino);
      }
      return false;
    });
  }

  simDetails(sim: Sim) {
    // // // // console.log(sim)
  }

  irAPagina(url: string): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      if (url === '/historial-pagos') {
        localStorage.setItem('previousUrl', 'dashboard/dashboard-distributor');
      }
      this.router.navigate([url]);
    }, 1500);
  }

  /////////////grafica de sims activos y suspendidos////////////
  updateChart() {
    const documentStyle = getComputedStyle(document.documentElement);
    
    this.pieData = {
     // labels: ['SIMs Activas', 'SIMs Suspendidas', 'SIMs Inventario'],
      datasets: [
        {
          data: [this.active.length, this.suspended.length, this.inactive.length],
          backgroundColor: [
            '#4CAF50',  // Verde para activas
            '#ff0800',  // Rojo para suspendidas
            '#c5baba'   // Gris para inventario
          ],
          hoverBackgroundColor: [
            '#45a049',  // Verde más oscuro
            '#e60700',  // Rojo más oscuro
            '#b8aeae'   // Gris más oscuro
          ]
        }
      ]
    };
  }

  private initChartOptions() {
    this.pieOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: {
              size: window.innerWidth < 768 ? 10 : 12 // Ajusta el tamaño de la fuente según el dispositivo
            }
          }
        }
      }
    };
  }

  private getUserName() {
    this.authService.getuserprofile().subscribe(user => {
        this.name = user?.name || 'Usuario';
    });
  }

}