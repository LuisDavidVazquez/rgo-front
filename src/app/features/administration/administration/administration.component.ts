import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SimsDataService } from '../../../core/services/sims-data.service';
import { Sim } from '../../../core/models/sim.model';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { ChartModule } from 'primeng/chart';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    PanelModule,
    ChartModule
  ],
  selector: 'app-administration',
  templateUrl: './administration.component.html',
  styleUrls: ['./administration.component.css']

})

export class AdministracionComponent implements OnInit {
  userName!: string | null;
  loading = false;
  pieData: any;
  pieOptions: any;
  active: Sim[] = [];
  suspended: Sim[] = [];
  inactive: Sim[] = [];
  inventory: Sim[] = [];
  totalSims: number = 0;
  simsList: Sim[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private simData: SimsDataService,
    private authService: AuthService
  ) {
    this.initChartOptions();
  }

  ngOnInit(): void {
    this.loadUserData();
    this.getCompanySims();
  }

  private initChartOptions() {
    this.pieOptions = {
      plugins: {
        legend: {
          labels: {
            usePointStyle: true,
            color: '#495057'
          }
        }
      }
    };
  }

  loadUserData() {
    const clientId = localStorage.getItem("ID");
    const email = localStorage.getItem("email");
    this.userName = localStorage.getItem("USERDATA") || '';
    // // // // console.log("Cargando datos de usuario en componente de administración:", clientId, email, this.userName);
  }

  callLogoutFromAdmin() {
    this.authService.logout();
  }

  irAPagina(url: string): void {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
      this.router.navigate([url]);
    }, 1500)
  }

  async getCompanySims() {
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No se encontró el token de autenticación');
      return;
    }

    const urlAllSims = `clientes-rastreo-go/all-sims`;
    const urlInventorySims = `sims-inventarios`;

    // Utilizamos forkJoin para hacer ambas llamadas en paralelo
    forkJoin({
      allSims: this.simData.getApiCall<Sim[]>(urlAllSims),
      inventorySims: this.simData.getApiCall<Sim[]>(urlInventorySims)
    }).subscribe(
      ({ allSims, inventorySims }) => {
        if (allSims && inventorySims) {
          // // // // console.log('Datos recibidos - Todas las SIMs:', allSims);
          // // // // console.log('Datos recibidos - SIMs en inventario:', inventorySims);
          
          // Combinamos todas las SIMs
          this.simsList = [...allSims, ...inventorySims];
          
          // Actualizar las listas filtradas
          this.active = this.simsList.filter(sim => sim.status === 'Activo');
          // // // // console.log('Lista de SIMs activos:', this.active);
          this.suspended = this.simsList.filter(sim => sim.status === 'Suspendido');
          this.inactive = this.simsList.filter(sim => sim.status === 'INACTIVE');
          
          this.inventory = this.simsList.filter(sim => sim.status === 'Inventario');
          //this.inventory = inventorySims; // Nueva lista para SIMs en inventario


          // // // // console.log('Lista de SIMs en inventario:', this.inventory);
          this.totalSims = this.simsList.length;
          
          this.updateChart();
        } else {
          // // // // console.log('No se recibieron datos de SIMs');
        }
      },
      (error) => {
        console.error('Error al obtener los datos de SIMs:', error);
      }
    );
  }

  updateChart() {
    this.pieData = {
      datasets: [
        {
          data: [
            this.active.length, 
            this.suspended.length, 
            this.inactive.length,
            this.inventory.length
          ],
          backgroundColor: [
            '#4CAF50',  // Verde para activas
            '#ff0800',  // Rojo para suspendidas
            '#c5baba',  // Gris para inactivas
            '#CCCCCC'   // Gris claro para inventario
          ],
          hoverBackgroundColor: [
            '#45a049',
            '#e60700', 
            '#b8aeae',
            '#BBBBBB'
          ]
        }
      ]
    };
  }
  }

