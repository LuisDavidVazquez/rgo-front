import { Routes } from '@angular/router';
import { ValidationComponent } from './validation.component';
export default [
    { path: 'validation', component: ValidationComponent },
    { path: 'validation/:id', component: ValidationComponent },

    
] as Routes;


