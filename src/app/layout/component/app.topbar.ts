import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthService } from '../../core/auth/auth.service';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
    template: ` <div class="layout-topbar ">
        <div class="layout-topbar-logo-container">
            <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                <i class="pi pi-bars"></i>
            </button>
            <a class="layout-topbar-logo flex items-center gap-2" routerLink="/dashboard/dashboard-distributor">
                <img src="assets/images/rastreo-go-letras.svg" 
                     alt="RastreoGO Logo" 
                     class="hidden md:block h-8 md:h-16 w-auto transition-all duration-200" 
                     [style]="{ filter: layoutService.isDarkTheme() ? 'invert(1)' : 'none' }" />
                <img src="assets/images/rastreo-go.svg" 
                     alt="RastreoGO Logo" 
                     class="h-8 md:h-16 w-auto transition-all duration-200" />
            </a>
        </div>

        <!-- Barra de búsqueda -->
        <div class="relative hidden md:flex items-center">
            <input 
                type="text" 
                placeholder="Buscar" 
                #searchItem 
                (change)="search()"
                class="pl-4 pr-10 py-2 rounded-full border border-gray-300 dark:border-gray-700 
                       bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 
                       focus:outline-none focus:ring-2 focus:ring-orange-500 
                       transition-all duration-200"
            >
            <i class="pi pi-search absolute right-4 text-gray-400"></i>
        </div>

        <!-- Enlaces de navegación con fondo más claro -->
        <div class="flex-1 hidden lg:flex items-center justify-center gap-6">
            <a routerLink="/dashboard/dashboard-distributor" routerLinkActive="text-orange-500" 
               class="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">
                Inicio
            </a>
            <a  routerLinkActive="text-orange-500"
               class="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">
                Sobre Nosotros
            </a>
            <a  routerLinkActive="text-orange-500"
               class="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">
                Quiero ser distribuidor
            </a>
            <a  routerLinkActive="text-orange-500"
               class="text-gray-600 dark:text-gray-300 hover:text-orange-500 transition-colors duration-200">
                Ayuda
            </a>
        </div>

        <!-- Resto del contenido del topbar -->
        <div class="layout-topbar-actions">
            <div class="layout-config-menu">
                <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                    <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                </button>
                
                <div class="relative hidden">
                    <button
                        class="layout-topbar-action layout-topbar-action-highlight"
                        pStyleClass="@next"
                        enterFromClass="hidden"
                        enterActiveClass="animate-scalein"
                        leaveToClass="hidden"
                        leaveActiveClass="animate-fadeout"
                        [hideOnOutsideClick]="true"
                    >
                        <i class="pi pi-palette"></i>
                    </button>
                    <app-configurator />
                </div>
            </div>

            <button class="layout-topbar-menu-button layout-topbar-action" 
                    pStyleClass="@next" 
                    enterFromClass="hidden" 
                    enterActiveClass="animate-scalein" 
                    leaveToClass="hidden" 
                    leaveActiveClass="animate-fadeout" 
                    [hideOnOutsideClick]="true">
                <i class="pi pi-ellipsis-v"></i>
            </button>

            <div class="layout-topbar-menu hidden lg:block">
                <!-- Menú móvil -->
                <div class="block lg:hidden p-3 border-b dark:border-gray-700">
                    <div class="flex flex-col gap-2">
                        <a routerLink="/dashboard/dashboard-distributor" 
                           class="flex items-center gap-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <i class="pi pi-home"></i>
                            <span>Inicio</span>
                        </a>
                        <a routerLinkActive="text-orange-500" 
                           class="flex items-center gap-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <i class="pi pi-info-circle"></i>
                            <span>Sobre Nosotros</span>
                        </a>
                        <a routerLinkActive="text-orange-500" 
                           class="flex items-center gap-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <i class="pi pi-users"></i>
                            <span>Quiero ser distribuidor</span>
                        </a>
                        <a routerLinkActive="text-orange-500" 
                           class="flex items-center gap-2 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                            <i class="pi pi-question-circle"></i>
                            <span>Ayuda</span>
                        </a>
                        
                        <!-- Separador -->
                        <div class="border-t dark:border-gray-700 my-2"></div>
                        
                        <!-- Botón de logout -->
                        <a (click)="callLogoutFromLines()" 
                           class="flex items-center gap-2 p-2 rounded-md text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                            <i class="pi pi-sign-out"></i>
                            <span>Cerrar Sesión</span>
                        </a>
                    </div>
                </div>

                <!-- Contenido existente del menú -->
                <div class="layout-topbar-menu-content">
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-calendar"></i>
                        <span>Calendar</span>
                    </button>
                    <button type="button" class="layout-topbar-action">
                        <i class="pi pi-inbox"></i>
                        <span>Messages</span>
                    </button>
                    
                    <div class="relative">
                        <button type="button" class="layout-topbar-action">
                            <i class="pi pi-bell"></i>
                            <span class="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" *ngIf="unreadNotificationsCount > 0">
                                {{unreadNotificationsCount}}
                            </span>
                        </button>
                    </div>

                    <div class="dropdown relative group">
                        <button type="button" class="layout-topbar-action flex items-center gap-2">
                            <i class="pi pi-user"></i>
                            <span class="ml-2">Hola, {{userName}}</span>
                        </button>
                        <div class="dropdown-content invisible group-hover:visible opacity-0 group-hover:opacity-100 absolute right-0 min-w-[200px] bg-white dark:bg-gray-900 shadow-lg rounded-md py-2 mt-2 transition-all duration-300">
                            <a href="#profile" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <i class="pi pi-user mr-2"></i>Perfil
                            </a>
                            <a href="#settings" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                                <i class="pi pi-cog mr-2"></i>Configuración
                            </a>
                            <a href="#" class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800" (click)="callLogoutFromLines()">
                                <i class="pi pi-sign-out mr-2"></i>Cerrar Sesión
                            </a>
                        </div>
                        <span class="ml-2">Hola, {{userName}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>`
})
export class AppTopbar {
    items!: MenuItem[];
    userName: string = '';
    unreadNotificationsCount: number = 0;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthService,
        private router: Router
    ) {
        this.getUserName();
        this.unreadNotificationsCount = 3;
    }

    private getUserName() {
        this.authService.getuserprofile().subscribe(user => {
            this.userName = user?.name || 'Usuario';
        });
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }

    callLogoutFromLines() {
        this.authService.logout().subscribe({
            next: () => {
                this.router.navigate(['/auth/login']);
            },
            error: (error) => {
                console.error('Error durante el logout:', error);
                this.router.navigate(['/auth/login']);
            }
        });
    }

    search() {
        console.log('Realizando búsqueda...');
    }

}
