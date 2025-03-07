import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { FluidModule } from 'primeng/fluid';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { SimsDataService } from '../../../core/services/sims-data.service';
import { Location } from '@angular/common';
import { ClientsService, UserByClient } from '../../../core/services/clients.service';

interface ClienteIccid {
    username: string;
    iccid: string;
    unitName: string;
    imei: string;
    gps: string;
    clientId: number;
    simId: number;
}

@Component({
    selector: 'app-sim-register',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, InputTextModule, ProgressSpinnerModule, ToastModule, FluidModule, ReactiveFormsModule],
    templateUrl: './sim-register.component.html',
    providers: [MessageService],
    styles: [
        `
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
                color: #ff6b00 !important;
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
        `
    ]
})
export class SimRegisterComponent implements OnInit {
    loading = false;
    simForm!: FormGroup;
    userId: string = '';
    private apiUrl = environment.apiUrl;
    private apiUrlSimService = environment.apiUrlSimService;
    private previousUrl: string = '/tableros';
    gpsMarca: string[] = ['Teltonika', 'Ruptela', 'Tekastar'];
    gpsModel: string[] = ['T20', 'T30', 'T40'];
    users: UserByClient[] = [];

    constructor(
        private fb: FormBuilder,
        private router: Router,

        private route: ActivatedRoute,
        private authService: AuthService,
        private messageService: MessageService,
        private simsDataService: SimsDataService,
        private location: Location,
        private clientsService: ClientsService
    ) {
        this.initForm();
    }

    private initForm(): void {
        this.simForm = this.fb.group({
            username: ['', [Validators.required]],
            iccid: ['', [Validators.required]],
            unitname: ['', [Validators.required]],
            gps: ['', [Validators.required]],
            model: [''],
            imei: ['']
        });
    }

    ngOnInit(): void {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.userId = localStorage.getItem('ID') || '';
            this.getClients();
        }
    }

    getClients(): void {
        this.clientsService.getUsersByClientId(Number(this.userId)).subscribe({
            next: (users) => {
                this.users = users;
            },
            error: (error) => {
                console.error('Error al obtener los clientes:', error);
                this.mostrarError('Error al obtener los clientes');
            }
        });
    }

    onSubmit(altas: boolean = true): void {
        if (this.simForm.valid) {
            this.loading = true;
            const formValues = this.simForm.value;

            if (!this.validarDatosFormulario(formValues)) {
                this.loading = false;
                localStorage.setItem('unitName', formValues.unitname);
                return;
            }

            const userId = Number(localStorage.getItem('ID'));
            const iccid = formValues.iccid;

            if (isNaN(userId) || userId <= 0) {
                this.mostrarError('Error: ID de usuario no válido');
                this.loading = false;
                return;
            }

            this.simsDataService.getSimIdByIccid(iccid).subscribe({
                next: (simId: number) => {
                    if (!simId || isNaN(Number(simId))) {
                        this.mostrarError('Error: No se pudo obtener un ID de SIM válido');
                        this.loading = false;
                        return;
                    }

                    const formData: ClienteIccid = {
                        username: formValues.username,
                        iccid: iccid,
                        unitName: formValues.unitname,
                        imei: formValues.imei || '',
                        gps: formValues.gps,
                        clientId: userId,
                        simId: simId
                    };
                    localStorage.setItem('currentTransaction', JSON.stringify(formData));

                    if (altas) {
                        this.procesarAlta(formData);
                    } else {
                        this.confirmarAnadirLinea(formData);
                    }
                },
                error: (error: Error) => {
                    console.error('Error al obtener simId:', error);
                    this.mostrarError('Error al obtener el ID de la SIM');
                    this.loading = false;
                }
            });
        } else {
            this.markFormGroupTouched(this.simForm);
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
        const field = this.simForm.get(fieldName);
        return field ? field.invalid && (field.dirty || field.touched) : false;
    }

    getErrorMessage(fieldName: string): string {
        const control = this.simForm.get(fieldName);
        if (control?.errors) {
            if (control.errors['required']) return 'Este campo es requerido';
            if (control.errors['minlength']) return 'Mínimo 3 caracteres';
        }
        return '';
    }

    private mostrarError(mensaje: string): void {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: mensaje
        });
    }

    private validarDatosFormulario(formValues: any): boolean {
        // Implementa la validación específica
        return true;
    }

    private procesarAlta(formData: ClienteIccid): void {
        this.confirmarAnadirLinea(formData);
    }

    private confirmarAnadirLinea(formData: ClienteIccid): void {
        const confirmacionRecargas = confirm('¿Desea proceder a recargas?');
        if (confirmacionRecargas) {
            this.authService.getUserByUsername(formData.username).subscribe({
                next: (user) => {
                    const fiscalData = {
                        iccid: formData.iccid,
                        unitName: formData.unitName,
                        imei: formData.imei,
                        gps: formData.gps,
                        simId: Number(formData.simId),
                        userId: Number(user.id),
                        clientId: Number(localStorage.getItem('ID')),
                        username: formData.username
                    };

                    console.log('Datos finales para enviar:', fiscalData);
                    console.log('user id', user.id);

                    this.authService.guardarClienteiccid(fiscalData).subscribe({
                        next: (response) => {
                            console.log('Respuesta exitosa:', response);
                            const sims = [
                                {
                                    iccid: formData.iccid,
                                    name: formData.unitName,
                                    id: formData.simId
                                }
                            ];

                            localStorage.setItem('simsarray', JSON.stringify(sims));
                            // // console.log('userName', this.userName);

                            this.router.navigate(['lines/line-details'], {
                                queryParams: {
                                    iccid: formData.iccid,
                                    simId: formData.simId.toString(), // Asegúrate de que sea string
                                    userId: user.id.toString(),
                                    unitName: formData.unitName
                                }
                            });
                        },
                        error: (error) => {
                            // Mejorar el logging del error
                            console.error('Error completo:', error);
                            console.error('Estado:', error.status);
                            console.error('Mensaje:', error.error);
                            this.mostrarError(error.error);
                        }
                    });
                },
                error: (error) => {
                    console.error('Error al buscar usuario:', error);
                    this.mostrarError(error.error);
                }
            });
        }
    }

    goBack(): void {
        this.location.back();
    }
}
