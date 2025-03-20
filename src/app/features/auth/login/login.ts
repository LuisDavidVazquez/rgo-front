import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { RastreogoLoadingComponent } from '../../../core/components/rastreogo-loading';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [
        ButtonModule, 
        CheckboxModule, 
        InputTextModule, 
        PasswordModule, 
        RouterModule, 
        RippleModule, 
        ReactiveFormsModule, 
        ProgressSpinnerModule, 
        MessagesModule, 
        MessageModule,
        RastreogoLoadingComponent
    ],
    template: `
        <div class="bg-surface-50 dark:bg-surface-950 flex items-center justify-center min-h-screen min-w-[100vw] overflow-hidden"
             style="background-size: cover; background-position: center;">
            
            <!-- Loading spinner -->
            @if (loading) {
                <app-rastreogo-loading></app-rastreogo-loading>
            }

            <!-- Error message -->
            @if (mensajeError) {
                <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <p-message severity="error" [closable]="true" (onClose)="cerrarMensajeError()">
                        {{ mensajeError }}
                    </p-message>
                </div>
            }

            <!-- Main content -->
            <div class="flex flex-col items-center justify-center" [class.opacity-50]="loading">
                <div style="box-shadow: 0px 0px 0px black, 0px 0px 0px rgb(0, 0, 0, 0.5) inset; border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, #ff5932 10%, rgba(255, 89, 50, 0) 60%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20" style="border-radius: 53px">
                        <div class="text-center mb-8">
                            <img src="assets/images/RastreoGo-Transparente2.png" alt="RastreoGo Logo" class="mx-auto mb-8 w-20" />
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Bienvenido a RastreoGO!</div>
                            <span class="text-muted-color font-medium">Inicia sesión para continuar</span>
                        </div>

                        <form [formGroup]="formulario" (ngSubmit)="onSubmit()">
                            <div>
                                <label for="email1" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Correo electrónico</label>
                                <input pInputText id="email1" type="text" placeholder="Correo electrónico" class="w-full md:w-[30rem] mb-8" formControlName="email" />

                                <label for="password1" class="block text-surface-900 dark:text-surface-0 font-medium text-xl mb-2">Contraseña</label>
                                <p-password id="password1" formControlName="password" placeholder="Contraseña" [toggleMask]="true" styleClass="mb-4" [fluid]="true" [feedback]="false"></p-password>

                                <div class="flex items-center justify-between mt-2 mb-8 gap-8">
                                    <div class="flex items-center">
                                        <p-checkbox formControlName="rememberMe" 
                                                   binary 
                                                   styleClass="custom-checkbox"
                                                   class="mr-2"
                                                   inputId="rememberMe">
                                        </p-checkbox>
                                        <label for="rememberMe">Recuérdame</label>
                                    </div>
                                    <a class="font-medium no-underline cursor-pointer forgot-password-link">¿Olvidaste tu contraseña?</a>
                                </div>

                                <p-button type="submit" 
                                          label="Iniciar sesión" 
                                          styleClass="w-full custom-secondary-button" 
                                          [loading]="loading">
                                </p-button>

                                <!-- <p-button type="button" label="Registrarse" styleClass="w-full mt-2" severity="secondary" (onClick)="irAPagina('registro')"></p-button> -->

                                <p-button type="button" 
                                          severity="secondary"
                                          label="Quiero ser distribuidor" 
                                          styleClass="w-full mt-2 custom-secondary-button" 
                                          (onClick)="irAPagina('auth/distributor-register')">
                                </p-button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        /* Estilo para el botón secundario en estado normal */
        :host ::ng-deep .custom-secondary-button.p-button {
            background: #e9ecef;  /* Define el fondo gris claro del botón */
            border: 1px solid var(--surface-500); /* Borde gris */
            color: #495057;       /* Color del texto en gris oscuro */
            transition: all 1s ease; /* Animación suave de 1s para todos los cambios */
        }

        /* Estilo cuando el cursor está sobre el botón habilitado */
        :host ::ng-deep .custom-secondary-button.p-button:enabled:hover {
            background: #ff5932; /* Cambia el fondo a naranja */
            border: 1px solid #ff5932; /* Borde naranja */
            color: #ffffff; /* Texto blanco */
            transition: all 0.3s ease; /* Animación más rápida al hacer hover */
        }

        /* Estilo cuando el botón habilitado está siendo presionado */
        :host ::ng-deep .custom-secondary-button.p-button:enabled:active {
            background: #e64d2b; /* Naranja más oscuro */
            border: 1px solid #e64d2b; /* Borde naranja oscuro */
            color: #ffffff; /* Texto blanco */
        }

        /* Estilo para el enlace de "olvidé contraseña" */
        .forgot-password-link {
            color: #495057;       /* Color inicial gris oscuro */
            transition: all 0.5s ease; /* Transición suave */
        }

        /* Estilo al pasar el cursor sobre el enlace */
        .forgot-password-link:hover {
            color: #ff5932; /* Cambia a naranja */
        }

        /* Estilo para el checkbox cuando está seleccionado */
        :host ::ng-deep .custom-checkbox .p-checkbox .p-checkbox-box.p-highlight,
        :host ::ng-deep .custom-checkbox .p-checkbox-box.p-highlight {
            background: #ff5932 !important; /* Fondo naranja */
            border-color: #ff5932 !important; /* Borde naranja */
        }

        /* Añadir estilos para el estado de carga */
        :host {
            position: relative;
        }

        .opacity-50 {
            opacity: 0.5;
            transition: opacity 0.3s ease;
        }
    `]
})
export class Login implements OnInit {
    loading = false;
    mensajeError: string = '';
    formulario: FormGroup;

    constructor(
        @Inject(Router) private router: Router,
        private authService: AuthService,
        private viewContainerRef: ViewContainerRef
    ) {
        this.formulario = new FormGroup({
            email: new FormControl(''),
            password: new FormControl(''),
            rememberMe: new FormControl(false)
        });
    }

    ngOnInit(): void {
        // Limpiar datos previos
        localStorage.clear();
    }

    cerrarMensajeError() {
        this.mensajeError = '';
    }

    async onSubmit() {
        if (this.formulario.valid) {
            this.loading = true;
            const loadingRef = this.viewContainerRef.createComponent(RastreogoLoadingComponent);
            
            try {
                this.mensajeError = '';
                const { email, password } = this.formulario.value;

                await new Promise(resolve => setTimeout(resolve, 500));

                await new Promise((resolve, reject) => {
                    this.authService.login(email, password).subscribe({
                        next: (response: any) => {
                            if (response.access_token) {
                                localStorage.setItem('authToken', response.access_token);
                                this.getUserProfile();
                                resolve(response);
                            } else {
                                reject('Error en la autenticación');
                            }
                        },
                        error: (error) => reject(error)
                    });
                });

                await loadingRef.instance.ensureMinLoadingTime();
            } catch (error) {
                this.handleError(error);
            } finally {
                this.loading = false;
                loadingRef.destroy();
            }
        }
    }

    private getUserProfile() {
        this.authService.getuserprofile().subscribe({
            next: (userProfile) => {
                this.saveUserData(userProfile);
                this.redirectBasedOnClientLevel(userProfile.clientlevel);
            },
            error: (error) => this.handleError(error)
        });
    }

    private saveUserData(userProfile: any) {
        localStorage.setItem('USERDATA', userProfile.name);
        localStorage.setItem('clientlevel', userProfile.clientlevel.toString());
        localStorage.setItem('ID', userProfile.id.toString());
        localStorage.setItem('email', userProfile.email);
        localStorage.setItem('permission', userProfile.permission);
    }

    private redirectBasedOnClientLevel(clientLevel: string) {
        setTimeout(() => {
            this.loading = false;
            switch (clientLevel) {
                case '0':
                    this.router.navigate(['']);
                    break;
                case '1':
                    this.router.navigate(['admin/permissions']);
                    break;
                case '2':
                    this.router.navigate(['dashboard/dashboard-distributor']);

                    break;
                case '3':
                    this.router.navigate(['lines/lines']);
                    break;
                case '4':
                    this.router.navigate(['validation/validation']);
                    break;
                case '5':
                    this.router.navigate(['/administration']);
                    break;
                default:
                    this.router.navigate(['']);
            }
        }, 1500);
    }

    private handleError(error: any) {
        console.error('Error:', error);
        this.loading = false;

        if (error.status === 0) {
            this.mensajeError = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.';
        } else if (error.status === 401) {
            this.mensajeError = 'Credenciales incorrectas. Por favor, inténtalo de nuevo.';
        } else {
            this.mensajeError = 'Ocurrió un error durante el inicio de sesión. Por favor, inténtalo más tarde.';
        }
    }

    async irAPagina(url: string): Promise<void> {
        this.loading = true;
        const loadingRef = this.viewContainerRef.createComponent(RastreogoLoadingComponent);
        
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            await loadingRef.instance.ensureMinLoadingTime();
            this.router.navigateByUrl(url);
        } finally {
            this.loading = false;
            loadingRef.destroy();
        }
    }
}
