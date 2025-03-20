import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';

export const appRoutes: Routes = [
    {
        path: '',
        redirectTo: 'auth/login',
        pathMatch: 'full'
    },
    {
        path: '',
        component: AppLayout,
        children: [
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { path: 'dashboard', loadChildren: () => import('./app/features/dashboard/dashboard.routes') },
            { path: 'validation', loadChildren: () => import('./app/features/validation/validation.routes') },
            { path: 'lines', loadChildren: () => import('./app/features/lines/lines.routes') },
            { path: 'users', loadChildren: () => import('./app/features/users/users.routes') },
            { path: 'sims', loadChildren: () => import('./app/features/sims/sims.routes') },
            { path: 'payment', loadChildren: () => import('./app/features/payments/payment.routes') },
            { path: 'administration', loadChildren: () => import('./app/features/administration/administration.routes') },
            { path: 'admin', loadChildren: () => import('./app/features/admin/admin.routes') },

            
        ]
    },
    { path: 'landing', component: Landing },


    { path: 'notfound', component: Notfound },
    // { path: 'auth', loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: 'auth', loadChildren: () => import('./app/features/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
