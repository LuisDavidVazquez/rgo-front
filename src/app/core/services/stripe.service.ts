import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../environments/environment';
import { Observable, from, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class StripeService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) {
        console.log(this.apiUrl, 'esto es apiUrl de stripe.service');
    }

    redirectToCheckout(checkoutData: any): Observable<any> {
        // // console.log('StripeService: Iniciando redirectToCheckout', { checkoutData });

        // Validar la estructura y el monto
        if (!checkoutData.line_items?.[0]?.price_data?.unit_amount) {
            console.error('Datos de checkout:', checkoutData);
            return throwError(() => new Error('Estructura de datos inválida para el checkout'));
        }

        const amount = checkoutData.line_items[0].price_data.unit_amount;

        // Validar que el monto sea un número positivo
        if (typeof amount !== 'number' || isNaN(amount) || amount <= 0) {
            console.error('Monto inválido:', amount);
            return throwError(() => new Error(`Monto inválido: ${amount}`));
        }

        //console.log('Monto validado:', {
        //  amount,
        //  currency: checkoutData.line_items[0].price_data.currency
        //});

        return this.http.post<any>(
            `${this.apiUrl}/recharge-plan-movements/create-checkout-session`,
            {
                stripeData: checkoutData
            },
            { headers: this.getHeaders() }
        );
    }

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    validatePayment(sessionId: string): Observable<any> {
        // // console.log('StripeService: Validando pago', { sessionId });

        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        if (!token) {
            throw new Error('No hay token de autorización');
        }

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`).set('Content-Type', 'application/json');

        return this.http.get<any>(`${this.apiUrl}/recharge-plan-movements/check-status/${sessionId}`, { headers }).pipe(
            tap((response) => {
                // console.log('StripeService: Respuesta de validación', response)
            }),
            catchError((error) => {
                console.error('StripeService: Error en validación', error);
                throw error;
            })
        );
    }

    checkPaymentStatus(paymentId: string): Observable<any> {
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        if (!token) {
            throw new Error('No hay token de autorización');
        }

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`).set('Content-Type', 'application/json');

        return this.http.get<any>(`${this.apiUrl}/recharge-plan-movements/payment-status/${paymentId}`, { headers });
    }

    createCheckoutSession(checkoutData: any): Observable<any> {
        console.log('StripeService: Creando sesión de checkout', checkoutData);

        const url = `${this.apiUrl}/recharge-plan-movements/create-checkout-session`;
        console.log('StripeService: URL de la solicitud', url);
        return this.http.post(url, checkoutData).pipe(
            tap((response) => {
                console.log('StripeService: Respuesta del servidor', response);
            }),
            catchError((error) => {
                console.error('StripeService: Error en checkout', error);
                throw error;
            })
        );
    }

    verifyStripePayment(sessionId: string): Observable<any> {
        // // console.log('[Frontend StripeService] Iniciando verificación de pago', { sessionId });

        const token = localStorage.getItem('token') || localStorage.getItem('authToken');

        if (!token) {
            console.error('[Frontend StripeService] Error: No se encontró token de autorización');
            throw new Error('No hay token de autorización');
        }

        // Recuperar foliosYLineNumbers de localStorage
        const foliosYLineNumbers = localStorage.getItem('foliosYLineNumbers');
        let foliosYLineNumbersParsed: any = null;
        if (foliosYLineNumbers) {
            try {
                foliosYLineNumbersParsed = JSON.parse(foliosYLineNumbers);
                // // console.log('[Frontend StripeService] foliosYLineNumbers recuperados:', foliosYLineNumbersParsed);
            } catch (e) {
                console.error('[Frontend StripeService] Error al parsear foliosYLineNumbers:', e);
            }
        } else {
            console.warn('[Frontend StripeService] No se encontraron foliosYLineNumbers en localStorage');
        }

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`).set('Content-Type', 'application/json');

        // Construir la URL con los parámetros de consulta si foliosYLineNumbers está presente
        let url = `${this.apiUrl}/recharge-plan-movements/verify-payment/${sessionId}`;
        if (foliosYLineNumbersParsed) {
            const params = new URLSearchParams();
            params.set('foliosYLineNumbers', JSON.stringify(foliosYLineNumbersParsed));
            url += `?${params.toString()}`;
            // // console.log('[Frontend StripeService] URL con foliosYLineNumbers:', url);
        }

        //console.log('[Frontend StripeService] Enviando petición al backend', {
        //  url: url,
        //  headers: headers.keys()
        //});

        return this.http.get<any>(url, { headers }).pipe(
            tap((response) => {
                // // console.log('[Frontend StripeService] Respuesta recibida del backend:', response);
            }),
            catchError((error) => {
                console.error('[Frontend StripeService] Error en la petición:', {
                    status: error.status,
                    message: error.message,
                    error: error
                });
                throw error;
            })
        );
    }

    checkSessionStatus(sessionId: string): Observable<any> {
        // // console.log('🔄 Verificando sesión con ID:', sessionId);

        // Obtener el token del localStorage
        const token = localStorage.getItem('token');
        // // console.log('🔑 Token encontrado:', token ? 'Sí' : 'No');

        if (!token) {
            console.error('❌ No se encontró token de autenticación');
            return throwError(() => new Error('No hay token de autenticación'));
        }

        // Crear headers con el token de autorización
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`).set('Content-Type', 'application/json');

        // // console.log('📤 Headers de la petición:', headers.keys());

        // Incluir los headers en la petición
        return this.http.get(`${environment.apiUrl}/recharge-plan-movements/payment-status/${sessionId}`, { headers }).pipe(
            tap((response) => {
                //console.log('✅ Respuesta de verificación de pago:', response)
            }),
            catchError((error) => {
                console.error('❌ Error detallado:', {
                    status: error.status,
                    message: error.message,
                    error: error.error
                });

                if (error.status === 401) {
                    // Limpiar token si está expirado o es inválido
                    localStorage.removeItem('token');
                    return throwError(() => new Error('Sesión expirada. Por favor, inicie sesión nuevamente.'));
                }

                return throwError(() => error);
            })
        );
    }
}
