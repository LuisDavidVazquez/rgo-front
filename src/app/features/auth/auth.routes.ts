import { Routes } from '@angular/router';
import { Login } from './login/login';
import { DistributorRegisterComponent } from './distributor-register/distributor-register.component';
export default [
    { path: 'login', component: Login },
    { path: 'distributor-register', component: DistributorRegisterComponent }
] as Routes;
