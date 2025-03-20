import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, switchMap, map } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ClienteIccid } from '../models/client.model';
import { User } from '../models/sim.model';
import { Router } from '@angular/router';

interface MovimientoNoAprobado {
    paymentId: string;
    simId: number;
    userId: number;
    planName: string;
    amount: number;
    provider: string;
    transactionNumber: string;
    statusPago?: string;
    rechargePlanId?: number;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = environment.apiUrl;

    constructor(
        private http: HttpClient, 
        private router: Router
    ) {}

    public getHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        console.log('Token almacenado:', token);
        return new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: token ? `Bearer ${token}` : ''
        });
    }
    // Asegurarse de que getToken() está funcionando correctamente
    getToken(): string {
        const token = localStorage.getItem('authToken'); // Cambiado de 'token' a 'authToken'
        // // console.log('Token recuperado:', token);
        return token || '';
    }

    getUserByUsername(username: string): Observable<User> {
        const url = `${this.apiUrl}/users/by-username/${username}`;
        console.log('URL de búsqueda de usuario:', url);

        return this.http.get<User>(url).pipe(
            tap((response: User) => {
                // console.log('Respuesta del servidor:', response);
                return response;
            }),
            catchError((error) => {
                console.error('Error al obtener usuario:', error);
                return throwError(() => error);
            })
        );
    }

    login(email: string, password: string): Observable<any> {
        const loginUrl = new URL(environment.loginURL, this.apiUrl).toString();
        // // console.log('URL de inicio de sesión:', loginUrl);
        const headers = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        return this.http
            .post<any>(
                loginUrl,
                { email, password },
                {
                    headers: headers,
                    withCredentials: true
                }
            )
            .pipe(catchError(this.handleHttpError));
    }

    getTokenSims(email: string, password: string): Observable<any> {
        return this.http.post(environment.SimsUrl, { email, password }, { withCredentials: true }).pipe(catchError(this.handleError('Error al obtener el token')));
    }

    enviarSolicitudDistribuidor(data: any): Observable<any> {
        return this.http
            .post(`${this.apiUrl}${environment.solicitudesUrl}/enviar`, data, {
                //headers: this.getHeaders(),
                withCredentials: true
            })
            .pipe(catchError(this.handleError('Error al enviar la solicitud de distribuidor')));
    }

    obtenerSolicitudesPendientes(): Observable<any[]> {
        return this.http
            .get<any[]>(`${this.apiUrl}${environment.solicitudesUrl}/pendientes`, {
                headers: this.getHeaders(),
                withCredentials: true
            })
            .pipe(catchError(this.handleHttpError));
    }

    eliminarSolicitud(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}${environment.solicitudesUrl}/${id}`, {
            headers: this.getHeaders(),
            withCredentials: true
        });
    }

    guardarMovimientoNoAprobado(movimiento: MovimientoNoAprobado): Observable<any> {
        const url = `${environment.apiUrl}/recharge-plan-movements/noaprobado`;

        const movimientoData = {
            ...movimiento,
            statusPago: 'noaprobado'
        };

        return this.http
            .post(url, movimientoData, {
                headers: this.getHeaders(),
                
                withCredentials: true
            })
            .pipe(
                tap((response) => {
                     console.log('Respuesta del servidor de movimiento no aprobado:', response);
                    return response;
                }),
                catchError((error) => {
                    console.error('Error detallado:', error);
                    return this.handleHttpError(error);
                })
            );
    }

    sendPermission(permiso: any): Observable<any> {
        return this.http
            .post(`${this.apiUrl}${environment.URLpermission}/create`, permiso, {
                headers: this.getHeaders(),
                withCredentials: true
            })
            .pipe(catchError(this.handleError('Error al enviar el permiso')));
    }

    guardarCliente(cliente: any): Observable<any> {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return throwError(() => new Error('No hay token de autenticación'));
        }

        // Formatear el DTO según CreateClientesRastreoGoDto
        const clienteDTO = {
            name: cliente.name?.trim(),
            email: cliente.email?.trim().toLowerCase(),
            phone: cliente.phone?.trim(),
            password: cliente.password,
            street: cliente.street?.trim(),
            postalCode: cliente.postalCode?.toString(),
            state: cliente.state?.trim(),
            city: cliente.city?.trim(),
            personType: cliente.personType?.trim(),
            rfc: cliente.rfc?.trim().toUpperCase(),
            clientlevel: '2'
        };

        // Validaciones locales según las decoraciones del DTO
        const validaciones = {
            name: !!clienteDTO.name,
            email: !!clienteDTO.email,
            phone: !!clienteDTO.phone,
            password: !!clienteDTO.password,
            street: !!clienteDTO.street,
            postalCode: !!clienteDTO.postalCode,
            state: !!clienteDTO.state,
            city: !!clienteDTO.city,
            personType: !!clienteDTO.personType,
            rfc: !!clienteDTO.rfc
        };

        const camposFaltantes = Object.entries(validaciones)
            .filter(([_, valido]) => !valido)
            .map(([campo]) => campo);

        if (camposFaltantes.length > 0) {
            return throwError(() => new Error(`Campos requeridos faltantes: ${camposFaltantes.join(', ')}`));
        }

        // // console.log('Enviando datos al servidor:', clienteDTO);
        const url = `${this.apiUrl}${environment.apibackurlvalidacion}/create`;
        // // console.log('URL de la petición:', url);

        return this.http
            .post<any>(url, clienteDTO, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                })
            })
            .pipe(
                tap((response) => {
                    // console.log('Respuesta exitosa:', response);
                    return response;
                }),
                catchError((error) => {
                    console.error('Error detallado:', {
                        status: error.status,
                        message: error.error?.message,
                        errors: error.error?.errors
                    });

                    if (error.status === 400) {
                        const mensaje = error.error?.message || 'Datos inválidos. Verifique la información ingresada.';
                        return throwError(() => new Error(mensaje));
                    }

                    if (error.status === 409) {
                        return throwError(() => new Error('El email ya está registrado.'));
                    }

                    return throwError(() => new Error('Error al procesar la solicitud.'));
                })
            );
    }

    guardarClienteSuperAdmin(cliente: any): Observable<any> {
        return this.http
            .post(`${this.apiUrl}${environment.apiBackUrlclientesrastreogo}/create-superadmin`, cliente, {
                headers: this.getHeaders(),
                withCredentials: true
            })
            .pipe(catchError(this.handleError('Error al guardar cliente superadmin')));
    }

    guardarUsuarios(usuario: any): Observable<any> {
        const url = `${this.apiUrl}${environment.apiBackUrluser}/Registercustomer`;
        return this.http
            .post(url, usuario, {
                headers: this.getHeaders(),
                withCredentials: true
            })
            .pipe(
                tap((response) => {
                    console.log('Respuesta del servidor:', response);
                    return response;
                }),
                catchError((error: Error) => {
                    console.log('Error capturado:', error);

                    // Extraer el código de estado y mensaje del error
                    const errorMessage = error.message;
                    let statusCode: number | undefined;

                    // Intentar extraer el código de estado del mensaje de error
                    const statusMatch = errorMessage.match(/Código (\d+)/);
                    if (statusMatch) {
                        statusCode = parseInt(statusMatch[1]);
                    }

                    // Crear un objeto de error estructurado
                    const errorResponse = {
                        status: statusCode,
                        message: errorMessage,
                        originalError: error
                    };

                    console.log('Error procesado:', errorResponse);

                    return throwError(() => errorResponse);
                })
            );
    }

    guardarClienteiccid(clienteData: ClienteIccid) {
        const url = `${this.apiUrl}/client-iccids/create`;
        return this.http
            .post(url, clienteData, {
                headers: this.getHeaders(),
                withCredentials: true
            })
            .pipe(catchError(this.handleHttpError));
    }

    guardarDireccion(direccion: any): Observable<any> {
        return this.http
            .post(`${this.apiUrl}${environment.apidireccionesUrl}`, direccion, {
                headers: this.getHeaders(),
                withCredentials: true
            })
            .pipe(catchError(this.handleError('Error al crear dirección')));
    }

    guardarDatosFiscales(datosFiscales: any): Observable<any> {
        return this.http
            .post(`${this.apiUrl}${environment.apidatosfiscalesUrl}`, datosFiscales, {
                headers: this.getHeaders(),
                withCredentials: true
            })
            .pipe(catchError(this.handleError('Error al crear datos fiscales')));
    }

    getPermissions(): Observable<any> {
        return this.http
            .get<any>(`${this.apiUrl}${environment.profileURL}`, {
                headers: this.getHeaders()
            })
            .pipe(
                tap((response) => localStorage.setItem('clientLevel', response.clientLevel.toString())),
                catchError(this.handleError('Error al obtener clientLevel'))
            );
    }

    getuserprofile(): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}${environment.profileURL}`, {
            headers: this.getHeaders()
        });
    }

    logout(): Observable<any> {
        return new Observable(observer => {
            try {
                localStorage.clear();
                observer.next(true);
                observer.complete();
            } catch (error) {
                observer.error(error);
            }
        });
    }

    private handleError(errorMsg: string) {
        return (error: any): Observable<never> => {
            console.error(errorMsg, error);
            return throwError(() => new Error(errorMsg));
        };
    }

    private handleHttpError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred!';
        if (error.error instanceof ErrorEvent) {
            // Client-side errors
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side errors
            switch (error.status) {
                case 409:
                    errorMessage = 'Conflicto: El usuario ya existe o hay un problema con el ID del cliente.';
                    break;
                case 400:
                    errorMessage = 'Datos incorrectos: Por favor verifica la información ingresada.';
                    break;
                case 500:
                    errorMessage = 'Error del servidor: Por favor intente de nuevo más tarde.';
                    break;
                default:
                    errorMessage = `Error ${error.status}: ${error.message}`;
            }
        }
        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        // // console.log('Verificando autenticación - Token:', token); // Para debug
        return !!token;
    }
}
