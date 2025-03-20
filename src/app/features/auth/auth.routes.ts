import { Routes } from '@angular/router';
import { Login } from './login/login';
import { DistributorRegisterComponent } from './distributor-register/distributor-register.component';
import { RequestResetPassword } from './request-reset-password/RequestResetPassword';
import { ResetPassword } from './reset-password/Reset-Password';

export default [
    { path: 'login', component: Login },
    { path: 'distributor-register', component: DistributorRegisterComponent },
    { path: 'request-reset-password', component: RequestResetPassword },
    { path: 'reset-password', component: ResetPassword}
] as Routes;
