import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/auth/auth.service';
import { RouterModule } from '@angular/router';
import { FluidModule } from 'primeng/fluid';
import { ToastModule } from 'primeng/toast';
import { RastreogoLoadingComponent } from '../../../core/components/rastreogo-loading';
import { Location } from '@angular/common';

@Component({
    selector: 'app-user-register',
    standalone: true,
    imports: [
        CommonModule, 
        RouterModule, 
        ButtonModule, 
        InputTextModule, 
        ProgressSpinnerModule, 
        ToastModule, 
        FluidModule, 
        ReactiveFormsModule,
       // RastreogoLoadingComponent
    ],
    templateUrl: './user-register.component.html',
    providers: [MessageService],
    styles: [`
        .back-link {
            display: flex;
            align-items: center;
            gap: 8px;
            color: #666;
            cursor: pointer;
            font-size: 16px;
            padding: 10px;
            width: fit-content;
            margin-bottom: 10px;
            transition: all 0.3s ease;
        }

        .back-link:hover {
            color: #ff6b00 !important; /* Color naranja */
            transform: translateX(-5px);
        }

        .back-link .arrow {
            font-size: 20px;
            line-height: 1;
            transition: transform 0.3s ease;
        }

        .back-link:hover .arrow {
            transform: translateX(-3px);
        }
    `]
})
export class UserRegisterComponent implements OnInit {
    userForm!: FormGroup;
    loading = false;
    userId: string = '';

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,
        private messageService: MessageService,
        private location: Location
    ) {
        this.initForm();
    }

    private initForm(): void {
        this.userForm = this.fb.group({
            username: ['', [Validators.required, Validators.minLength(3)]],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
        });
    }

    ngOnInit(): void {
        const token = localStorage.getItem('authToken');

        // Si hay un token, obtenemos el nombre del usuario
        if (token) {
            this.userId = localStorage.getItem('ID') || '';
        }
    }

    onSubmit(): void {
        if (this.userForm.valid) {
            this.loading = true;
            const userData = {
                ...this.userForm.value,
                clientId: parseInt(this.userId)
            };

            this.authService.guardarUsuarios(userData).subscribe({
                next: () => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Cliente registrado correctamente'
                    });
                    this.navigateToPage('sims/sim-register');
                },
                error: (error: Error) => {
                    this.loading = false;
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: error.message || 'Error al registrar el cliente'
                    });
                }
            });
        } else {
            this.markFormGroupTouched(this.userForm);
        }
    }

    private markFormGroupTouched(formGroup: FormGroup) {
        Object.values(formGroup.controls).forEach((control) => {
            control.markAsTouched();
            if (control instanceof FormGroup) {
                this.markFormGroupTouched(control);
            }
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.userForm.get(fieldName);
        return field ? field.invalid && (field.dirty || field.touched) : false;
    }

    getErrorMessage(fieldName: string): string {
        const control = this.userForm.get(fieldName);
        if (control?.errors) {
            if (control.errors['required']) return 'Este campo es requerido';
            if (control.errors['email']) return 'Formato de correo inválido';
            if (control.errors['minlength']) return 'Mínimo 3 caracteres';
            if (control.errors['pattern']) return 'Formato de teléfono inválido';
        }
        return '';
    }

    navigateToPage(url: string): void {
        this.loading = true;
        setTimeout(() => {
            this.loading = false;
            this.router.navigate([url]);
        }, 1000);
    }

    goBack(): void {
        this.location.back();
    }
}
