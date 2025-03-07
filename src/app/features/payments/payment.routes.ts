import { Routes } from '@angular/router';
import { PaymentComponent } from './payment/payment.component';
import { PaymentHistoryComponent } from './payment-history/payment-history.component';
export default [
    { path: 'payment', component: PaymentComponent },
    { path: 'payment-history', component: PaymentHistoryComponent }
] as Routes;

