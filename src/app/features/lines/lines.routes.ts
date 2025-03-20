import { Routes } from '@angular/router';
import { LinesComponent } from './lines/lines.component';
import { LineDetailsComponent } from './line-details/line-details.component';

export default [
    { path: 'line-details/:id', component: LineDetailsComponent },
    { path: 'line-details', component: LineDetailsComponent },
    { path: ':id', component: LinesComponent },
    { path: '', component: LinesComponent },
] as Routes;

