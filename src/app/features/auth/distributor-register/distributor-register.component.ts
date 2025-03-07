import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { InputMaskModule } from 'primeng/inputmask';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InputNumberModule } from 'primeng/inputnumber';
import { AddressesService } from '../../../core/services/addresses.service';
import { Estado } from '../../../core/services/addresses.service';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-distributor-register',
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
        InputMaskModule,
        RadioButtonModule,
        SelectModule,
        FormsModule,
        CommonModule,
        InputNumberModule
    ],
    templateUrl: './distributor-register.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DistributorRegisterComponent implements OnInit {
    formulario: FormGroup;
    loading = false;
    mensajeError: string | null = null;
    estados: Estado[] = [];
    municipios: string[] = [];

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private authService: AuthService,
        private addressesService: AddressesService,
        private cd: ChangeDetectorRef
    ) {
        this.formulario = this.fb.group({
            name: ['', [Validators.required]],
            phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\)\s\d{3}-\d{4}$/)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            personType: ['fisica', Validators.required],
            rfc: ['', [Validators.required, Validators.minLength(13), Validators.maxLength(13)]],
            state: ['', Validators.required],
            city: [{ value: '', disabled: true }, Validators.required],
            street: ['', Validators.required],
            neighborhood: ['', Validators.required],
            postalCode: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(5), Validators.pattern('^[0-9]*$')]]
        });

        this.formulario.get('state')?.valueChanges.subscribe((estado) => {
            const cityControl = this.formulario.get('city');
            if (estado) {
                cityControl?.enable();
                this.cargarMunicipios(estado);
            } else {
                // cityControl?.disable();
                this.municipios = [];
                cityControl?.setValue('');
            }
        });
    }

    ngOnInit(): void {
        this.cargarEstados();
    }

    cargarEstados(): void {
        this.addressesService.getEstados().subscribe({
            next: (estados) => {
                this.estados = estados;
            },
            error: (error) => {
                console.error('Error al cargar estados:', error);
                this.mensajeError = 'Error al cargar los estados';
            }
        });
    }

    cargarMunicipios(estado: string): void {
        this.addressesService.getMunicipios(estado).subscribe({
            next: (municipios) => {
                this.municipios = municipios;
                this.formulario.patchValue({ city: '' });
                this.cd.detectChanges();
            },
            error: (error) => {
                console.error('Error al cargar municipios:', error);
                this.municipios = [];
                this.mensajeError = 'Error al cargar los municipios';
            }
        });
    }

    onSubmit(): void {
        if (this.formulario.valid) {
            this.loading = true;
            const formData = this.formulario.getRawValue();

            this.authService
                .enviarSolicitudDistribuidor(formData)
                .pipe(finalize(() => (this.loading = false)))
                .subscribe({
                    next: () => this.router.navigate(['/auth/login']),
                    error: (error) => {
                        this.mensajeError = error.error?.message || 'Error al registrar distribuidor';
                    }
                });
        } else {
            this.marcarCamposInvalidos();
        }
    }

    private marcarCamposInvalidos(): void {
        Object.keys(this.formulario.controls).forEach((key) => {
            const control = this.formulario.get(key);
            if (control?.invalid) {
                control.markAsTouched();
                control.markAsDirty();
            }
        });
    }

    // Validar campos específicos
    campoInvalido(campo: string): boolean {
        const control = this.formulario.get(campo);
        return (control?.invalid && (control?.touched || control?.dirty)) || false;
    }

    getMensajeError(campo: string): string {
        const control = this.formulario.get(campo);

        if (control?.errors) {
            if (control.errors['required']) return 'Este campo es requerido';
            if (control.errors['email']) return 'Email inválido';
            if (control.errors['minlength']) return `Mínimo ${control.errors['minlength'].requiredLength} caracteres`;
            if (control.errors['maxlength']) return `Máximo ${control.errors['maxlength'].requiredLength} caracteres`;
        }

        return '';
    }

    cerrarMensajeError(): void {
        this.mensajeError = null;
    }

    volverALogin(): void {
        this.router.navigate(['/auth/login']);
    }

    irAPagina(url: string): void {
        this.loading = true;
        setTimeout(() => {
            this.loading = false;
            this.router.navigateByUrl(url);
        }, 1500);
    }
}
