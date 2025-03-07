import { Routes } from '@angular/router';
import { SimRegisterComponent } from './sim-register/sim-register.component';
import { SimsRequestsComponent } from './sims requests/sims-requests.component';
export default [
    { path: 'sim-register', component: SimRegisterComponent },
    { path: 'sims-requests', component: SimsRequestsComponent }


] as Routes;
