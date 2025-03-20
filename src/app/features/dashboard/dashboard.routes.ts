import { Routes } from '@angular/router';
//import { DashboardClientsComponent } from './dashboard-clients/dashboard-clients.component';
import { DashboardDistributorComponent } from './dashboard-distributor/dashboard-distributor.component';
import { DashboardClientsComponent } from './dashboard-clients/dashboard-clients.component';
import { DashboardLinesComponent } from './dashboars-lines/dashboard-lines.component';
import { DashboardEditImeiComponent } from './dashboard-edit-imei/dashboard-edit-imei.component';
export default [
    { path: 'dashboard-clients', component: DashboardClientsComponent },
    { path: 'dashboard-distributor', component: DashboardDistributorComponent },
    { path: 'dashboard-lines/:id', component: DashboardLinesComponent },
    { path: 'dashboard-edit-imei/:id', component: DashboardEditImeiComponent },
    { path: 'dashboard-edit-imei', component: DashboardEditImeiComponent }
    
] as Routes;

