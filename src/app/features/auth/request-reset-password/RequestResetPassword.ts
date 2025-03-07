import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { RastreogoLoadingComponent } from '../../../core/components/rastreogo-loading';

@Component({
    selector: 'app-request-reset-password',
    standalone: true,
    imports: [
        ButtonModule,
        InputTextModule, 
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

            <!-- Success message -->
            @if (mensajeExito) {
                <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <p-message severity="success" [closable]="true" (onClose)="cerrarMensaje()">
                        {{ mensajeExito }}
                    </p-message>
                </div>
            }

            <!-- Error message -->
            @if (mensajeError) {
                <div class="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <p-message severity="error" [closable]="true" (onClose)="cerrarMensaje()">
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
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Recuperar contraseña</div>
                            <span class="text-muted-color font-medium">Ingresa tu correo electrónico para recibir instrucciones</span>
                        </div>

                        <form [formGroup]="formulario" (ngSubmit)="onSubmit()">
                            <div>
                                <label for="email" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Correo electrónico</label>
                                <input pInputText id="email" type="email" placeholder="Correo electrónico" class="w-full md:w-[30rem] mb-8" formControlName="email" />

                                <div class="flex flex-wrap justify-center gap-2 mt-4">
                                    <button pButton pRipple label="Enviar solicitud" 
                                            class="w-full p-3 text-xl" 
                                            [disabled]="formulario.invalid || loading"
                                            type="submit"></button>
                                </div>
                                
                                <div class="text-center mt-4">
                                    <a [routerLink]="['/auth/login']" class="font-medium no-underline text-blue-500 cursor-pointer">
                                        Volver al inicio de sesión
                                    </a>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep {
            .p-password input {
                width: 100%;
            }
        }
        .forgot-password-link {
            color: var(--primary-color);
        }
        .forgot-password-link:hover {
            text-decoration: underline;
        }
    `]
})
export class RequestResetPassword implements OnInit {
    formulario: FormGroup;
    loading = false;
    mensajeError: string | null = null;
    mensajeExito: string | null = null;

    constructor(
        private authService: AuthService,
        private router: Router,
        private viewContainerRef: ViewContainerRef
    ) {
        this.formulario = new FormGroup({
            email: new FormControl('', [])
        });
    }

    ngOnInit(): void {
    }

    onSubmit(): void {
        if (this.formulario.valid) {
            this.loading = true;
            const email = this.formulario.get('email')?.value;
            
            this.authService.requestResetPassword(email).subscribe({
                next: (response) => {
                    this.loading = false;
                    this.mensajeExito = response.message;
                    // Opcionalmente, limpiar el formulario
                    this.formulario.reset();
                },
                error: (error) => {
                    this.loading = false;
                    this.handleError(error);
                }
            });
        }
    }

    cerrarMensaje(): void {
        this.mensajeError = null;
        this.mensajeExito = null;
    }

    private handleError(error: any) {
        console.error('Error:', error);
        
        if (error.status === 0) {
            this.mensajeError = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.';
        } else {
            this.mensajeError = error.error?.message || 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo más tarde.';
        }
    }
}
