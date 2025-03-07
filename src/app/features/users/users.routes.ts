import { Routes } from '@angular/router';
import { UserRegisterComponent } from './user-register/user-register.component';
import { ThanksUserComponent } from './thanks-user/thanks-user.component';

export default [
    { path: 'user-register', component: UserRegisterComponent }, 
    { path: 'thanks-user', component: ThanksUserComponent }

] as Routes;

