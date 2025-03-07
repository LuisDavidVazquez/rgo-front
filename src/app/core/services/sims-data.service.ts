import { Injectable, inject } from '@angular/core';
import { Sim } from '../models/sim.model';
import { recharge_plan } from '../models/plans.model';
import { BehaviorSubject, Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { SolicitudDeSim } from '../models/sim.model';
import { UserWithSims } from '../models/sim.model';

@Injectable({
    providedIn: 'root'
})
export class SimsDataService {
    private sharedSIms: Sim[] = [];
    private sharedPlans!: recharge_plan;
    private http = inject(HttpClient);
    private simId: string = '';
    private apiUrl = environment.apiUrl;

    private selectedSimSubject = new BehaviorSubject<number | null>(null);
    selectedSim$ = this.selectedSimSubject.asObservable();

    private simsSubject = new BehaviorSubject<Sim[]>([]);
    sims$ = this.simsSubject.asObservable();

    private selectedPlanSubject = new BehaviorSubject<recharge_plan | null>(null);
    selectedPlan$ = this.selectedPlanSubject.asObservable();

    private selectedPlanKey = 'selectedPlan';

    constructor() {
        // Inicializar el BehaviorSubject con el valor almacenado en localStorage
        const storedSimId = this.getSelectedSimId();
        this.selectedSimSubject.next(storedSimId);
        // // // // console.log('storedSimId almacenado en localStorage:', storedSimId);
    }

    // Método para obtener simId
    getSimId(): string {
        // // // // console.log('Obteniendo simId:', this.simId); // Añadir log para depuración
        return this.simId;
    }

    clearSharedSims(): void {
        this.sharedSIms = [];
        localStorage.removeItem('selectedSims');
    }

    setSharedSims(data: Sim[]): void {
        // // // // console.log('Sims compartidas establecidas:', data);
        this.sharedSIms = data;
        localStorage.setItem('selectedSims', JSON.stringify(data));

        if (this.sharedSIms.length === 0) {
            // Llamar a la función loadAllSims del componente LineDetailsComponent
            //this.lineDetailsComponent.loadAllSims(); // Necesitas una referencia al componente LineDetailsComponent para llamar a esta función
        }
    }
    setSelectedSimId(simId: number): void {
        this.selectedSimSubject.next(simId);
        localStorage.setItem('selectedSimId', simId.toString());
        // // // // console.log('setSelectedSimId almacenado en localStorage:', simId);
    }

    getSelectedSimId(): number | null {
        const storedId = localStorage.getItem('selectedSimId');
        // // // // console.log('getSelectedSimId almacenado en localStorage:', storedId);
        return storedId ? parseInt(storedId) : null;
    }

    // Método para establecer simId
    setSimId(id: string): void {
        this.simId = id;
        // // // // console.log('simId establecido:', this.simId); // Añadir log para depuración
    }
    // getSharedSims() {
    //   return this.sharedSIms;
    // }
    // Modifica el método para devolver un array de SIMs en lugar de una sola SIM
    getSharedSims2(): Sim[] {
        return this.sharedSIms;
    }

    getSharedSims(): Observable<Sim[]> {
        const token = this.getToken();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            })
        };
        // // // // console.log('SimsDataService: Obteniendo Sims compartidas', this.sharedSIms);
        if (this.sharedSIms.length > 0) {
            return of(this.sharedSIms);
        } else {
            // Si aún no hay datos, realiza la llamada al API
            return this.http.get<Sim[]>(`${this.apiUrl}${environment.apiSimsUrl}/${this.simId}`, this.requestOptiones()).pipe(
                tap((sims) => {
                    this.sharedSIms = sims;
                    localStorage.setItem('selectedSims', JSON.stringify(sims));
                })
            );
        }
    }

    // Nuevo método para obtener una SIM por ID
    getSimById(simId: string): Observable<Sim> {
        // // // // console.log('Llamada a la API:', `${this.apiUrl}${environment.apiSimsUrl}/${simId}`);
        return this.http.get<Sim>(`${this.apiUrl}${environment.apiSimsUrl}/${simId}`, this.requestOptiones()).pipe(
            tap((sim) => {
                this.sharedSIms = [sim];
                localStorage.setItem('selectedSims', JSON.stringify([sim]));
            }),
            catchError((error) => {
                console.error(`Error al obtener la SIM con ID ${simId}:`, error);
                return throwError(() => new Error('Error al obtener la SIM'));
            })
        );
    }

    setPlanDetails(data: recharge_plan) {
        this.sharedPlans = data;
    }

    getPlanDetails() {
        return this.sharedPlans;
    }

    // Método para almacenar el token en localStorage
    saveToken(token: string): void {
        localStorage.setItem('authToken', token);
    }

    // Método para recuperar el token de localStorage
    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    // Método para borrar el token de localStorage
    clearToken(): void {
        localStorage.removeItem('authToken');
    }

    private requestOptiones(): { headers: HttpHeaders } {
        const token = this.getToken();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            })
        };
        return httpOptions;
    }
    /**
     * Realiza una solicitud HTTP a una API con el token de autorización.
     * @param method El metodo HTTP para la solicitud (POST, GET, PUT ...)
     * @param endpoint La URL de la API a la que se realizará la solicitud.
     * @param data Los datos que se enviarán en la solicitud POST.
     * @returns Un Observable que emite la respuesta de la API o maneja errores.
     */
    private handleRequest<T>(method: string, endpoint: string, data?: any): Observable<T> {
        const httpOptions = this.requestOptiones();
        const url = this.apiUrl + endpoint;

        switch (method) {
            case 'GET':
                // // // // console.log('Llamada a la API:', url);
                return this.http.get<T>(url, httpOptions).pipe(catchError(this.handleError));
            case 'POST':
                // // // // console.log('Llamada a la API:', url);
                return this.http.post<T>(url, data, httpOptions).pipe(catchError(this.handleError));
            case 'PACTH':
                // // // // console.log('Llamada a la API:', url);
                return this.http.patch<T>(url, data, httpOptions).pipe(catchError(this.handleError));
            default:
                throw new Error(`Metodo HTTP no válido: ${method} `);
        }
    }

    getRequest<T>(endpoint: string): Observable<T> {
        // // // // console.log('Llamada a la API:', endpoint);
        return this.handleRequest<T>('GET', endpoint).pipe(
            catchError((error) => {
                console.error('Error en la solicitud:', error);
                throw error;
            })
        );
    }

    makeRequest<T>(method: string, endpoint: string, data: any) {
        return this.handleRequest<T>(method, endpoint, data).pipe(
            catchError((error) => {
                console.error('Error en la solicitud: ', error);
                throw error;
            })
        );
    }

    patchApiCall<T>(urlCall: string, data: any): Observable<T> {
        const token = this.getToken();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            })
        };
        let url = this.apiUrl + urlCall;
        return this.http.patch<T>(url, data, httpOptions).pipe(
            tap((response) => {
                // // // // console.log(response);
            }),
            catchError(this.handleError)
        );
    }
    /**
     * Realiza una solicitud HTTP POST a una API con el token de autorización.
     * @param urlCall La URL de la API a la que se realizará la solicitud.
     * @param data Los datos que se enviarán en la solicitud POST.
     * @returns Un Observable que emite la respuesta de la API o maneja errores.
     */
    postApiCall<T>(urlCall: string, data: any): Observable<T> {
        try {
            console.log('Iniciando postApiCall');
            console.log('URL llamada:', urlCall);
            console.log('Datos a enviar:', data);

            // Obtiene el token de autorización del método getToken().
            const token = this.getToken();
            console.log('Token obtenido:', token ? 'Token presente' : 'Token ausente');

            // Configura las opciones HTTP, incluyendo el token de autorización.
            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                })
            };
            // // // // console.log('Headers configurados:', httpOptions);

            // Combina la URL base (apiUrl) con la URL específica para la llamada.
            let url = this.apiUrl + `/${urlCall}`;
            console.log('URL completa:', url);

            // Realiza la solicitud HTTP POST y maneja la respuesta y los errores.
            return this.http.post<T>(url, data, httpOptions).pipe(
                tap((response) => {
                    // // // // console.log('Respuesta exitosa recibida:', response);
                }),
                catchError((error) => {
                    console.error('Error en postApiCall:', error);
                    console.error('Detalles del error:', {
                        status: error.status,
                        message: error.message,
                        url: error.url
                    });
                    return this.handleError(error);
                })
            );
        } catch (error) {
            console.error('Error inesperado en postApiCall:', error);
            return throwError(() => error);
        }
    }

    getApiCall<T>(endpoint: string): Observable<T> {
        const token = this.getToken();
        const url = `${this.apiUrl}/${endpoint}`;
        console.log('Ruta de la API:', url);

        // Agregar logs para depuración
        // // // // console.log('Realizando llamada API a:', url);

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            })
        };

        return this.http.get<T>(url, httpOptions).pipe(
            tap((response) => {
                // // // // console.log('Respuesta del API:', response);
            }),
            catchError((error) => {
                console.error('Error en llamada API:', error);
                return this.handleError(error);
            })
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        if (error instanceof HttpErrorResponse) {
            if (error.status === 404) {
                console.error(`Error 404: ${error.error.message}`);
            } else if (error.status === 500) {
                console.error(`Error: ${error.status} - ${error.error.message}`);
            } else if (error.status === 409) {
                console.error(`Error: ${error.status} - ${error.error.message}`);
            }
        } else {
            console.error('Ocurrió un error en la solicitud:', error);
        }
        return throwError(error);
    }

    asignarSimACliente(iccid: string, clientName: string): Observable<any> {
        // // // // console.log(iccid, clientName);
        // // // // console.log(this.apiUrl);

        const token = this.getToken();
        if (!token) {
            throw new Error('No se encontró el token de autenticación');
        }

        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            })
        };

        return this.http.post(`${this.apiUrl}/sims-inventarios/asignar-sim`, { iccid, clientName }, httpOptions);
    }

    createSolicitud(solicitud: SolicitudDeSim): Observable<SolicitudDeSim> {
        return this.postApiCall<SolicitudDeSim>(`${environment.solicitudesUrl}/sims`, solicitud);
    }

    getAllSolicitudes(): Observable<SolicitudDeSim[]> {
        return this.getApiCall<SolicitudDeSim[]>(environment.solicitudesUrl);
    }

    getSolicitudById(id: number): Observable<SolicitudDeSim> {
        return this.getApiCall<SolicitudDeSim>(`${environment.solicitudesUrl}/${id}`);
    }

    updateSolicitud(id: number, solicitud: Partial<SolicitudDeSim>): Observable<SolicitudDeSim> {
        return this.patchApiCall<SolicitudDeSim>(`${environment.solicitudesUrl}/${id}`, solicitud);
    }

    deleteSolicitud(id: number): Observable<any> {
        return this.makeRequest<any>('DELETE', `${environment.solicitudesUrl}/${id}`, null);
    }

    private selectedPlan: recharge_plan | null = null;

    setSelectedPlan(plan: recharge_plan): void {
        this.selectedPlanSubject.next(plan);
        localStorage.setItem(
            this.selectedPlanKey,
            JSON.stringify({
                plan,
                timestamp: new Date().getTime()
            })
        );
        // // // // console.log('Plan guardado:', plan);
    }

    //  getSelectedPlan(): recharge_plan | null {
    //    let plan = this.selectedPlanSubject.getValue();
    //    if (plan) return plan;
    //
    //    const storedData = localStorage.getItem(this.selectedPlanKey);
    //    if (storedData) {
    //      const { plan, timestamp } = JSON.parse(storedData);
    //      if (new Date().getTime() - timestamp < 300000) { // 5 minutos
    //        this.selectedPlanSubject.next(plan);
    //        return plan;
    //      }
    //      localStorage.removeItem(this.selectedPlanKey);
    //    }
    //    return null;
    //  }

    private selectedSimDetails: Sim | null = null;

    setSelectedSimDetails(sim: Sim): void {
        this.selectedSimDetails = sim;
        localStorage.setItem('selectedSimDetails', JSON.stringify(sim));
    }

    getSelectedSimDetails(): Sim | null {
        if (!this.selectedSimDetails) {
            const storedSimDetails = localStorage.getItem('selectedSimDetails');
            if (storedSimDetails) {
                this.selectedSimDetails = JSON.parse(storedSimDetails);
            }
        }
        return this.selectedSimDetails;
    }

    getUsersWithSims(distributorId: string): Observable<UserWithSims[]> {
        const url = `clientes-rastreo-go/users-with-sims/${distributorId}`;
        return this.http.get<UserWithSims[]>(url);
    }

    setSimDetails(sims: Sim[]) {
        this.simsSubject.next(sims);
        localStorage.setItem('selectedSims', JSON.stringify(sims));
    }

    getSimDetails(): Sim[] {
        const storedSims = localStorage.getItem('selectedSims');
        return storedSims ? JSON.parse(storedSims) : [];
    }

    setSelectedPlanWithDetails(plan: recharge_plan): void {
        this.selectedPlanSubject.next(plan);

        const planData = {
            plan,
            timestamp: new Date().getTime()
        };
        localStorage.setItem('selectedPlanData', JSON.stringify(planData));
        // // // // console.log('Plan guardado:', planData);
    }

    getSelectedPlan(): recharge_plan | null {
        let plan = this.selectedPlanSubject.getValue();
        if (plan) return plan;

        const storedData = localStorage.getItem('selectedPlanData');
        if (storedData) {
            const { plan, timestamp } = JSON.parse(storedData);
            if (new Date().getTime() - timestamp < 300000) {
                // 5 minutos
                this.selectedPlanSubject.next(plan);
                return plan;
            }
            localStorage.removeItem('selectedPlanData');
        }
        return null;
    }

    updateApiCall<T>(url: string, data: any): Observable<T> {
        const token = this.getToken();
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            })
        };
        return this.http.patch<T>(url, data, httpOptions).pipe(catchError(this.handleError));
    }

    getSimIdByIccid(iccid: string): Observable<number> {
        const url = `${this.apiUrl}${environment.apiSimsUrl}/find-sim-id/${iccid}`;
        // // console.log('URL de la solicitud:', url);

        const token = localStorage.getItem('authToken');
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        });

        return this.http.get<{ id: number }>(url, { headers }).pipe(
            map((response) => {
                // // console.log('Respuesta completa del servidor:', response);
                if (response && response.id !== undefined) {
                    return response.id;
                }
                return 0; // Retorna 0 en lugar de lanzar error
            }),
            catchError((error) => {
                // // console.log('No se encontro el sim id');
                return new Observable<number>((subscriber) => {
                    subscriber.next(0); // Retorna 0 en caso de error
                    subscriber.complete();
                });
            })
        );
    }
}
