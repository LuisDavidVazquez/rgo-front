import { Component, Inject, OnInit, ViewContainerRef } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { RippleModule } from 'primeng/ripple';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../core/auth/auth.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { RastreogoLoadingComponent } from '../../../core/components/rastreogo-loading';
import { PasswordModule } from 'primeng/password';

@Component({
    selector: 'app-reset-password',
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
        RastreogoLoadingComponent,
        PasswordModule
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
                            <div class="text-surface-900 dark:text-surface-0 text-3xl font-medium mb-4">Cambiar contraseña</div>
                            <span class="text-muted-color font-medium">Ingresa tu nueva contraseña</span>
                        </div>

                        @if (tokenValido) {
                            <form [formGroup]="formulario" (ngSubmit)="onSubmit()">
                                <div>
                                    <label for="password" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Nueva contraseña</label>
                                    <p-password id="password" formControlName="password" 
                                               placeholder="Ingresa tu nueva contraseña" 
                                               [toggleMask]="true" 
                                               styleClass="w-full mb-4" 
                                               [feedback]="true"></p-password>
                                    @if (campoInvalido('password')) {
                                        <small class="text-red-500 block mb-4">La contraseña debe tener al menos 8 caracteres</small>
                                    }

                                    <label for="confirmPassword" class="block text-surface-900 dark:text-surface-0 text-xl font-medium mb-2">Confirmar contraseña</label>
                                    <p-password id="confirmPassword" formControlName="confirmPassword" 
                                               placeholder="Confirma tu nueva contraseña" 
                                               [toggleMask]="true" 
                                               styleClass="w-full mb-4" 
                                               [feedback]="false"></p-password>
                                    @if (passwordsMismatch()) {
                                        <small class="text-red-500 block mb-4">Las contraseñas no coinciden</small>
                                    }

                                    <div class="flex flex-wrap justify-center gap-2 mt-4">
                                        <button pButton pRipple label="Cambiar contraseña" 
                                                class="w-full p-3 text-xl" 
                                                [disabled]="formulario.invalid || passwordsMismatch() || loading"
                                                type="submit"></button>
                                    </div>
                                    
                                    <div class="text-center mt-4">
                                        <a [routerLink]="['/auth/login']" class="font-medium no-underline text-blue-500 cursor-pointer">
                                            Volver al inicio de sesión
                                        </a>
                                    </div>
                                </div>
                            </form>
                        } @else {
                            <div class="text-center">
                                <p class="text-red-500 mb-4">El enlace de restablecimiento no es válido o ha expirado.</p>
                                <a [routerLink]="['/auth/request-reset-password']" class="btn btn-primary font-medium no-underline text-blue-500 cursor-pointer">
                                    Solicitar un nuevo enlace
                                </a>
                            </div>
                        }
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
export class ResetPassword implements OnInit {
    formulario: FormGroup;
    loading = false;
    mensajeError: string | null = null;
    mensajeExito: string | null = null;
    token: string | null = null;
    tokenValido = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private viewContainerRef: ViewContainerRef
    ) {
        this.formulario = new FormGroup({
            password: new FormControl('', [Validators.required, Validators.minLength(8)]),
            confirmPassword: new FormControl('', [Validators.required])
        });
    }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            this.token = params['token'];
            if (this.token) {
                this.verificarToken();
            } else {
                this.tokenValido = false;
            }
        });
    }

    verificarToken(): void {
        this.loading = true;
        
        if (!this.token) {
            this.tokenValido = false;
            this.loading = false;
            this.mensajeError = 'No se proporcionó ningún token de restablecimiento.';
            return;
        }
        
        this.authService.verifyResetToken(this.token).subscribe({
            next: (response) => {
                this.tokenValido = response.valid;
                this.loading = false;
                
                if (!response.valid) {
                    this.mensajeError = response.message || 'El enlace de restablecimiento no es válido o ha expirado.';
                }
            },
            error: (error) => {
                this.tokenValido = false;
                this.loading = false;
                this.mensajeError = error.message || 'Error al verificar el token. Por favor solicite un nuevo enlace de restablecimiento.';
                console.error('Error verificando token:', error);
            }
        });
    }

    onSubmit(): void {
        if (this.formulario.valid && !this.passwordsMismatch() && this.token) {
            this.loading = true;
            const password = this.formulario.get('password')?.value;
            const confirmPassword = this.formulario.get('confirmPassword')?.value;
            
            console.log('Enviando reset password con token:', this.token);
            
            this.authService.resetPassword(this.token, password, confirmPassword).subscribe({
                next: (response) => {
                    console.log('Respuesta exitosa:', response);
                    this.loading = false;
                    this.mensajeExito = 'Contraseña cambiada exitosamente. Serás redirigido al inicio de sesión.';
                    this.formulario.reset();
                    
                    setTimeout(() => {
                        this.router.navigate(['/auth/login']);
                    }, 3000);
                },
                error: (error) => {
                    console.error('Error completo:', error);
                    this.loading = false;
                    this.handleError(error);
                }
            });
        }
    }

    campoInvalido(campo: string): boolean {
        const control = this.formulario.get(campo);
        return (control?.invalid && (control?.touched || control?.dirty)) || false;
    }

    passwordsMismatch(): boolean {
        const password = this.formulario.get('password')?.value;
        const confirmPassword = this.formulario.get('confirmPassword')?.value;
        return password !== confirmPassword && this.formulario.get('confirmPassword')?.touched === true;
    }

    cerrarMensaje(): void {
        this.mensajeError = null;
        this.mensajeExito = null;
    }

    private handleError(error: any) {
        console.error('Error:', error);
        
        if (error.status === 0) {
            this.mensajeError = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.';
        } else if (error.status === 401) {
            this.mensajeError = 'El enlace de restablecimiento no es válido o ha expirado.';
        } else {
            this.mensajeError = error.error?.message || 'Ocurrió un error al procesar tu solicitud. Por favor, inténtalo más tarde.';
        }
    }
}
