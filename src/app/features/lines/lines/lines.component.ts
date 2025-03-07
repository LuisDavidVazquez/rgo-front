import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, HostListener } from '@angular/core';
import { LineDetailsComponent } from '../line-details/line-details.component';
import { Clientsims, Sim } from '../../../core/models/sim.model';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
//import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { NewService } from '../../../core/models/newService.model';
//import { apiUrl, apiUrlSims } from '../routes';
import { environment } from '../../../environments/environment';
import { catchError, tap } from 'rxjs';
import { SimsDataService } from '../../../core/services/sims-data.service';
import { AuthService } from '../../../core/auth/auth.service';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { TagModule } from 'primeng/tag';
import { CheckboxModule } from 'primeng/checkbox';
import { InputIconModule } from 'primeng/inputicon';
import { PanelModule } from 'primeng/panel';



@Component({
  standalone: true,
  selector: 'app-lines',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    ToastModule,
    TagModule,
    CheckboxModule,
    InputIconModule,
    PanelModule
  ],
  templateUrl: './lines.component.html',
  styleUrls: ['./lines.component.css']
})
export class LinesComponent implements OnInit {
  userName!: string; // Definimos la propiedad userName aquí
  loading = false;
  currentFilter: string = 'Total';  // Añadida la propiedad currentFilter

  constructor(
    private http: HttpClient,
 //   private dialog: MatDialog,
    private router: Router,

    private route: ActivatedRoute,
    private simData: SimsDataService,
    private authService: AuthService
  ) { }

  toggleMenuItem(menuItem: any) {
    // Cambia el estado isSelected del elemento
    menuItem.isSelected = !menuItem.isSelected;
  }
  @ViewChild('searchItem') searchItem!: ElementRef;
  totalSims: number = 0;
  activas: number = 0;
  inactivas: number = 0;
  suspendidas: number = 0;
  inventario: number = 0;

  // SIMs arrays
  filteredSims: Sim[] = [];
  simsList: Sim[] = [];
  ready: Sim[] = [];
  active: Sim[] = [];
  selectedSims: Sim[] = [];
  gps: string = '';

  // Paginacion
  totalItems: number = 0;
  pageSize: number = 20;
  currentPage: number = 1;
  pageItems: Sim[] = [];
  totalPages: number = 0;


  userame: string = '';


  // Control Booleans 
  admin: boolean = false;
  user: boolean = true;
  selectAll: boolean = false;
  selectAllStatus: { [key: number]: boolean } = {
    1: false
  }

  private apiUrl = environment.apiUrl; // Cambia esto a tu URL de API
  private apiUrlSims = environment.apiUrlSimService; // Cambia esto a tu URL de API

  // Actualizar los filtros para coincidir con la base de datos
  filters = [
    { label: 'Total', value: 'Total', count: 0 },
    { label: 'Activas', value: 'Activo', count: 0 },
    { label: 'Inactivas', value: 'Inactivo', count: 0 },
    { label: 'Suspendidas', value: 'Suspendido', count: 0 },
    { label: 'Inventario', value: 'inventario', count: 0 }
  ];

  showSummary: boolean = false;

  searchTerm: string = ''; // Propiedad para el término de búsqueda

  ngOnInit() {
    this.loadUserData();
    this.getCompanySims();
    this.loadSims();
    this.updateFilterCounts(); // Actualizar contadores iniciales
   this.userName = localStorage.getItem("USERDATA") || '';
   // console.log('userName',this.userName)
  }

  loadUserData() {
    const clientId = localStorage.getItem("ID");
    const email = localStorage.getItem("email");
    const token = localStorage.getItem('authToken');
    const clientelevel = localStorage.getItem('clientelevel');
    // console.log('Token almacenado:', token);

    // Si hay un token, intentar decodificarlo y enviarlo a historial de pagos
    if (token) {
      console.log('Token almacenado:', token);
      try {
        // Dividir el token en sus partes (header, payload, signature)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          // Decodificar la parte del payload (segunda parte)
          const payload = JSON.parse(atob(tokenParts[1]));
          // // console.log('Contenido decodificado del token:', payload);
          this.userName = payload.name; // Obtener el nombre del payload decodificado
          
          // Guardar el token para que esté disponible en historial de pagos
          localStorage.setItem('authToken', token);
        }
      } catch (error) {
        console.error('Error al decodificar el token:', error);
      }
    }

    console.log("Cargando datos de usuario en componente de líneas:", clientId, email, this.userName, clientelevel);
  }

  callLogoutFromLines() {//para hacer loguth
    this.authService.logout();

  }


  userChange() {  // Boton temporar para cambiar de usuario 
    this.admin = !this.admin;
    this.user = !this.user;
  }

  async getCompanySims() {
    let client = localStorage.getItem("ID") // Pisitou Team // usuario
   // console.log("UserId", client)
    ////  const url = 'api/v1/sims/client/' + client //+'?status=1&items=200'   /// filtrado por Estatus de las sims (Opcional) 1 = Inventario, 2 = Activo, 3 = Suspedido, 4 = Eliminado y por cantidad de items recibidos 1
    const url = `${environment.clienteiccidUrlLines}/user/${client}` //+'?status=1&items=200'   /// filtrado por Estatus de las sims (Opcional) 1 = Inventario, 2 = Activo, 3 = Suspedido, 4 = Eliminado y por cantidad de items recibidos 1

    this.simData.getApiCall<Clientsims[]>(url).subscribe(
      (clientsimsList) => {
        // // console.log("esto es clientsimsList", clientsimsList);

        // Procesa los datos recibidos y asigna GPS
        this.processClientsimsData(clientsimsList);

        // Ya no es necesario iterar y asignar this.gps aquí
        // console.log(this.simsList, 'esto es simslist')
        // // // console.log("GPS guardado:", this.gps);
      },
      (error) => {
        console.error('Error fetching data:', error);
        alert(error.errorMessage);
      }
    );
  }

  
  async configureDevice(sim: Sim) {
    try {
      // Validar que la SIM tenga un dispositivo asociado
      if (!sim.gps) {
        alert('Esta línea no tiene un dispositivo GPS asociado');
        return;
      }

      // Obtener el ID del cliente actual
      const clientId = localStorage.getItem("ID");
      
      // Construir URL para configuración del dispositivo
      const url = `${environment.clienteiccidUrlLines}/device/configure/${sim.id}`;

      // Preparar datos de configuración
      const configData = {
        simId: sim.id,
        deviceId: sim.gps,
        clientId: clientId
      };

      // Llamar al endpoint de configuración
      this.simData.postApiCall(url, configData).subscribe(
        (response) => {
          // // console.log('Dispositivo configurado exitosamente:', response);
          alert('El dispositivo se ha configurado correctamente');
        },
        (error) => {
          console.error('Error al configurar dispositivo:', error);
          alert('Error al configurar el dispositivo. Por favor intente nuevamente.');
        }
      );

    } catch (error) {
      console.error('Error en configuración:', error);
      alert('Ocurrió un error durante la configuración');
    }
  }

  // Método para procesar los datos de cada ClienteIccid y sus Sims
  processClientsimsData(clientsimsList: Clientsims[]) {
    const simGpsMap: { [simId: number]: string } = {};
    
    // Reiniciar contadores
    this.totalSims = 0;
    this.activas = 0;
    this.inactivas = 0;
    this.inventario = 0;

    clientsimsList.forEach(clienteIccid => {
      // // console.log(`ClienteIccid ID: ${clienteIccid.id}, User ID: ${clienteIccid.userId}`);

      // Procesar las SIMs asociadas
      if (clienteIccid.sims && clienteIccid.sims.length) {
        // Actualizar contador total
        this.totalSims += clienteIccid.sims.length;

        clienteIccid.sims.forEach(sim => {
          // Asignar gps desde clienteIccid si está indefinido o es null en sim
          if (!sim.gps) { // Esto cubre undefined y null
            sim.gps = clienteIccid.gps;
          }
          // // console.log(`Sim ID: ${sim.id}, ICCID: ${sim.iccid}, GPS: ${sim.gps}`);

          // Actualizar contadores según el estado
          switch(sim.status) {
            case 'Activo':
              this.activas++;
              break;
            case 'Suspendido':
              this.suspendidas++;
              break;
            case 'Ready':
              this.inventario++;
              break;
          }

          // Añadir al mapeo
          simGpsMap[sim.id] = sim.gps || '';
        });

        // Asegurarse de que simsList sea una nueva referencia para desencadenar la detección de cambios
        this.simsList = [...this.simsList, ...clienteIccid.sims];
      }

      // Procesar la información del usuario asociado
      if (clienteIccid.user) {
        const userName = clienteIccid.user.username;
        const userId = clienteIccid.user.id; // Obtener el userId
        const originalClientId = clienteIccid.user.clientId;

        // Almacenar en localStorage
        localStorage.setItem('userName', userName);
        localStorage.setItem('clientId', userId.toString()); // Reemplazar clientId con userId
        localStorage.setItem('originalClientId', originalClientId.toString()); // Guardar el clientId original si se necesita
        localStorage.setItem('isUser', 'true'); // Agregar bandera booleana

        // // console.log(`Username almacenado: ${userName}`);
        // // console.log(`UserId almacenado como clientId: ${userId}`);
        // // console.log(`Original ClientId almacenado: ${originalClientId}`);
      }
    });

    // Almacenar el mapeo de SIM ID a GPS en localStorage
    localStorage.setItem('simGpsMap', JSON.stringify(simGpsMap));

    // Inicializar filtros y paginación
    this.filterSims('Total'); // Mostrar todos inicialmente
    this.getPageElements();

    // // console.log(this.simsList, 'esto es simsList');
    // // console.log("GPS mapeados y guardados en localStorage:", simGpsMap);
  }

  // Método para recuperar el mapeo de SIM ID a GPS desde localStorage
  getSimGpsMap(): { [simId: number]: string } {
    const simGpsMapString = localStorage.getItem('simGpsMap');
    if (simGpsMapString) {
      return JSON.parse(simGpsMapString);
    }
    return {};
  }

  // Obtener el GPS de una SIM específica por su ID
  getGpsBySimId(simId: number): string {
    const simGpsMap = this.getSimGpsMap();
    return simGpsMap[simId] || 'GPS no disponible';
  }

  onSimSelectionChange(sim: Sim) {
    if (sim.selected) {
      // // console.log(`SIM seleccionada: ${sim.id}`);
      this.selectedSims.push(sim);
    } else {
      // // console.log(`SIM deseleccionada: ${sim.id}`);
      if (this.selectedSims.includes(sim)) {
        this.selectedSims.splice(this.selectedSims.indexOf(sim), 1);
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
        this.selectedSims.push(sim);
      }
    }
    else {
      for (const sim of this.pageItems) {
        sim.selected = this.selectAll;
        if (this.selectedSims.includes(sim)) {
          this.selectedSims.splice(this.selectedSims.indexOf(sim), 1);
        }
      }
    }
    for (const sim of this.pageItems) {
      sim.selected = this.selectAll; // Actualizar el estado de selección de cada sim
    }
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
    // console.log(this.totalItems, startIndex, endIndex, this.totalPages)
  }

  previousPage() {
    //console.log(this.selectAllStatus, this.selectAll)
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
   // console.log(this.selectAllStatus, this.selectAll)
  }

  resetPageSize() {
    this.filterSims('Total');
  }

  async resetConection(sim: Sim) {
    //console.log("Reset")
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
          // console.log(response)

          alert('Ocurrió un error en la solicitud');

          return response;
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

  rechargeOne(sim: Sim): void {
    console.log(sim)
    if (!sim.id) return;

    // Obtener el userId del localStorage
    const userId = localStorage.getItem('currentUserId');
    console.log(userId)

    // // console.log('Recargando SIM:', sim);
    this.simData.setSharedSims([sim]);
    localStorage.setItem('selectedSimId', sim.id.toString());
    localStorage.setItem('simsarray', JSON.stringify([sim]));

    this.selectedSims = [];
    this.selectAll = false;
    this.selectAllStatus = { 1: false };
    this.resetPageOptions();


    console.log('Sim seleccionado:', sim);
    this.router.navigate(['lines/line-details'], {

      state: {
        sim,
        userId: userId, // Pasar el userId en el estado
        simIds: [sim.id] // Enviar array de simIds
      },
      queryParams: {
        simIds: [sim.id], // Incluir array de simIds en los parámetros
        userId: userId, // Incluir userId en los parámetros
      }
    });
  }

  rechargeAll(sim?: Sim): void {
    if (sim) {
      // Lógica para recargar una sola SIM
      this.rechargeOne(sim);
    } else if (this.selectedSims.length > 0) {
      // Lógica para recargar múltiples SIMs
      const selectedSimsArray = [...this.selectedSims];
      const userId = localStorage.getItem('currentUserId');
      console.log(selectedSimsArray)

      // // console.log('Recargando todas las SIMs seleccionadas:', selectedSimsArray);
      this.simData.setSharedSims(selectedSimsArray);

      // Guardar las SIMs seleccionadas en localStorage
      localStorage.setItem('selectedSims', JSON.stringify(selectedSimsArray));
      localStorage.setItem('simsarray', JSON.stringify(selectedSimsArray));

      this.selectedSims = [];
      this.selectAll = false;
      this.selectAllStatus = { 1: false };
      this.resetPageOptions();

      this.router.navigate(['lines/line-details'], {
        queryParams: {
          simIds: selectedSimsArray.map(sim => sim.id), // Enviar múltiples IDs de SIM
          userId: userId
        }
      });
    } else {
      alert('Ningún SIM seleccionado');
    }
  }

  createService(simIccid: string) {
    this.loading = true;
    const dataToSend = { iccid: simIccid }
    this.simData.setSharedSims([...this.selectedSims])
    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['lines/line-details'], { relativeTo: this.route, queryParams: dataToSend })
    }, 1500);
  }

  search(): void {
    if (!this.searchTerm.trim()) {
      this.filteredSims = [...this.simsList];
    } else {
      const term = this.searchTerm.toLowerCase().trim();
      this.filteredSims = this.simsList.filter(sim => 
        sim.name?.toLowerCase().includes(term) ||
        sim.id?.toString().includes(term) ||
        sim.planName?.toLowerCase().includes(term) ||
        sim.gps?.toLowerCase().includes(term)
      );
    }
    this.getPageElements();
  }

  simDetails(sim: Sim) {
   // console.log(sim)
  }

  navigateToLineDetails(sim: Sim): void {
    const clientId = localStorage.getItem("ID");
    const unitName = this.userName; // Asegúrate de que `unitName` esté definido en tu componente

    this.router.navigate(['lines/line-details'], {
      queryParams: {
        simId: sim.id,
        clientId: clientId,
        unitName: unitName
      }
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  clearSimsList(event: Event): void {
    this.simData.clearSharedSims();
    this.simsList = [];
    localStorage.removeItem('selectedSimId'); // Limpiar el ID de la SIM seleccionada
  }


  irAHistorialPagos(): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      // Guardar la URL actual antes de navegar
      localStorage.setItem('previousUrl', 'lines/lines');
      // console.log('previousUrl guardada:', localStorage.getItem('previousUrl'));
      this.router.navigate(['payments-history/payments-history']);
    }, 1500);
  }

  // Método para determinar la severidad del estado
  getStatusSeverity(status: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'Activo':
        return 'success';
      case 'Suspendido':
        return 'danger';
      case 'Ready':
        return 'info';
      default:
        return 'warn';
    }
  }

  // Método para actualizar los contadores
  updateSimCounts(): void {
    if (this.simsList) {
      // Total de SIMs
      this.filters[0].count = this.simsList.length;

      // Conteo por estado
      const statusCounts = this.simsList.reduce((acc, sim) => {
        acc[sim.status || ''] = (acc[sim.status || ''] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Actualizar contadores en los filtros
      this.filters.forEach(filter => {
        if (filter.value !== 'Total') {
          filter.count = statusCounts[filter.value] || 0;
        }
      });
    }
  }

  loadSims() {
    this.loading = true;
    const clientId = localStorage.getItem("ID");
    this.simData.getApiCall<Sim[]>(this.apiUrlSims + '/api/v1/sims/client/' + clientId).subscribe({
      next: (response) => {
        this.simsList = response;
        this.updateSimCounts(); // Actualizar contadores cuando se cargan los datos
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading SIMs:', error);
        this.loading = false;
      }
    });
  }

  // Método para procesar y contar SIMs
  processSims(sims: Sim[]) {
    // Reiniciar contadores
    this.totalSims = 0;
    this.activas = 0;
    this.inactivas = 0;
    this.suspendidas = 0;
    this.inventario = 0;

    // Contar total de SIMs
    this.totalSims = sims.length;

    // Contar por estado
    sims.forEach(sim => {
      switch(sim.status) {
        case 'Activo':
          this.activas++;
          break;
        case 'Inactivo':
          this.inactivas++;
          break;
        case 'Suspendido':
          this.suspendidas++;
          break;
        case 'Ready':
          this.inventario++;
          break;
      }
    });

    // Actualizar contadores en los filtros
    this.filters[0].count = this.totalSims;
    this.filters[1].count = this.inventario;
    this.filters[2].count = this.activas;
    this.filters[3].count = this.inactivas;
    this.filters[4].count = this.suspendidas;

    // Actualizar la lista filtrada
    this.filterSims(this.currentFilter);
  }

  // Método para filtrar SIMs
  filterSims(status: string): void {
    this.currentFilter = status;
    
    // Filtrar las SIMs
    if (status === 'Total') {
      this.filteredSims = [...this.simsList];
    } else {
      this.filteredSims = this.simsList.filter(sim => sim.status === status);
    }

    // Actualizar contadores
    this.totalSims = this.simsList.length;
    this.activas = this.simsList.filter(sim => sim.status === 'Activo').length;
    this.inactivas = this.simsList.filter(sim => sim.status === 'Inactivo').length;
    this.suspendidas = this.simsList.filter(sim => sim.status === 'Suspendido').length;
    this.inventario = this.simsList.filter(sim => sim.status === 'Ready').length;

    // Actualizar los contadores en los filtros
    this.updateFilterCounts();

    // Actualizar paginación
    this.currentPage = 1;
    this.getPageElements();
  }

  // Método para obtener el resumen de conteos
  getSimsSummary(): string {
    return `Total: ${this.totalSims} | Activas: ${this.activas} | Inactivas: ${this.inactivas} | Suspendidas: ${this.suspendidas} | Inventario: ${this.inventario}`;
  }

  updateFilterCounts() {
    this.filters = this.filters.map(filter => ({
      ...filter,
      count: filter.value === 'Total' 
        ? this.simsList.length
        : this.simsList.filter(sim => sim.status === filter.value).length
    }));
  }

  toggleSummary(): void {
    this.showSummary = !this.showSummary;
  }

  // Método para limpiar filtros
  clearFilters(): void {
    this.searchTerm = '';
    this.currentFilter = 'Total';
    this.filteredSims = [...this.simsList];
    this.getPageElements();
  }

  // Método para manejar la selección de una SIM individual
  onRowSelect(event: any) {
    // console.log('SIM seleccionada:', event.data);
  }

  // Método para manejar la deselección de una SIM
  onRowUnselect(event: any) {
    // console.log('SIM deseleccionada:', event.data);
  }

  // Método para obtener las SIMs seleccionadas
  getSelectedSims(): Sim[] {
    return this.selectedSims;
  }
}