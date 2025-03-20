import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul>`,
    styles: [`
        :host ::ng-deep .layout-menu {
            /* Estilo base para todos los elementos del menú */
            li {
                a {
                    color: #495057 !important; /* Color gris para el texto */
                    transition: all 0.3s ease !important; /* Transición suave */
                }

                /* Estilo al pasar el cursor */
                a:hover {
                    color: #ff5932 !important; /* Color naranja al hover */
                }

                /* Estilo para el ícono */
                .p-menuitem-icon {
                    color: #495057 !important; /* Color gris para el ícono */
                    transition: all 0.3s ease !important;
                }

                /* Estilo para el ícono al hover */
                a:hover .p-menuitem-icon {
                    color: #ff5932 !important; /* Color naranja para el ícono al hover */
                }
            }

       
            }
        
    `]
})
export class AppMenu {
    model: MenuItem[] = [];
    clientLevel: string = '';

    ngOnInit() {
        // Obtener el nivel del cliente del localStorage
        this.clientLevel = localStorage.getItem('clientlevel') || '';
        
        // Definir los menús según el nivel del cliente
        switch (this.clientLevel) {
            case '2': // Distribuidor
                this.model = [
                    {
                        label: 'Navegación',
                        items: [
                            { label: 'Historial de pagos', icon: 'pi pi-fw pi-dollar', routerLink: ['payment/payment-history'] },
                            { label: 'Tableros', icon: 'pi pi-fw pi-chart-bar', routerLink: ['dashboard/dashboard-distributor'] },
                            { label: 'Ganancias', icon: 'pi pi-fw pi-money-bill', routerLink: ['/ganancias'] },
                            { label: 'Registrar cliente', icon: 'pi pi-fw pi-user-plus', routerLink: ['users/user-register'] },
                            { label: 'Añadir líneas', icon: 'pi pi-fw pi-list', routerLink: ['sims/sim-register'] },
                            { label: 'Mis clientes', icon: 'pi pi-fw pi-users', routerLink: ['dashboard/dashboard-clients'] },
                            { label: 'Solicitud de sims', icon: 'pi pi-fw pi-inbox', routerLink: ['sims/sims-requests'] }
                        ]
                    }
                ];
                break;

            case '3': // usuario final
                this.model = [
                    {
                        label: 'Navegación',
                        items: [
                            { label: 'Historial de pagos', icon: 'pi pi-fw pi-dollar', routerLink: ['payment/payment-history'] },
                            { label: 'Mis líneas', icon: 'pi pi-fw pi-list', routerLink: ['lines/lines'] }
                        ]
                    }
                ];
                break;

            case '4': // Usuario en validación ventas
                this.model = [
                    {
                        label: 'Navegación',
                        items: [
                            { label: 'Estado de validación', icon: 'pi pi-fw pi-clock', routerLink: ['validation/validation'] }
                        ]
                    }
                ];
                break;

            case '5': // Administrador
                this.model = [
                    {
                        label: 'Administración',
                        items: [
                            { label: 'Panel de control', icon: 'pi pi-fw pi-cog', routerLink: ['/administracion'] },
                            { label: 'Usuarios', icon: 'pi pi-fw pi-users', routerLink: ['/administracion/usuarios'] },
                            { label: 'Reportes', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/administracion/reportes'] }
                        ]
                    }
                ];
                break;

            default: // Usuario no autenticado o sin nivel
                this.model = [
                    {
                        label: 'Navegación',
                        items: [
                            { label: 'Iniciar sesión', icon: 'pi pi-fw pi-sign-in', routerLink: ['/auth/login'] }
                        ]
                    }
                ];
                break;
        }
    }
}
