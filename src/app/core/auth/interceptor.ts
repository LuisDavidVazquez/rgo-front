import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment'; // Asegúrate de que la ruta sea correcta
import { AuthService } from './auth.service';
@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) {}
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // No agregamos el header 'Access-Control-Allow-Origin' en el cliente
        request = request.clone({
            withCredentials: true,
            setHeaders: {
                'Content-Type': 'application/json'
            }
        });

        // Manejo de URLs relativas
        if (!request.url.startsWith('http://') && !request.url.startsWith('https://')) {
            const baseUrl = environment.apiUrl;
            const fullUrl = `${baseUrl}/${request.url}`.replace(/([^:]\/)\/+/g, '$1');
            request = request.clone({
                url: fullUrl
            });
        }

        // 3. Maneja los errores HTTP de forma centralizada:
        // - Captura errores del cliente (network errors)
        // - Captura errores del servidor (status codes)
        // - Formatea los mensajes de error
        // - Registra los errores en consola
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                // console.log('Error en la petición HTTP:', error);
                let errorMsg = '';
                if (error.error instanceof ErrorEvent) {
                    errorMsg = `Error del cliente: ${error.error.message}`;
                } else {
                    errorMsg = `Error del servidor: Código ${error.status}, Mensaje: ${error.error.message}`;
                }
                console.error('Error en la petición HTTP:', errorMsg);
                return throwError(() => new Error(errorMsg));
            })
        );
    }

    // Este método es un interceptor HTTP que maneja la autenticación:
    // 1. Obtiene el token de autenticación del AuthService
    // 2. Si existe un token, clona la petición HTTP y agrega el token en el header 'Authorization'
    // 3. Si no hay token, deja pasar la petición original sin modificar
    // 4. Es usado para agregar automáticamente el token JWT a todas las peticiones HTTP salientes
    interceptAuth(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const token = this.authService.getToken();

        // // // // console.log('Interceptor - Token:', token); // Para debug
        // // // // console.log('Interceptor - URL:', request.url); // Para debug

        if (token) {
            const cloned = request.clone({
                headers: request.headers.set('Authorization', `Bearer ${token}`)
            });
            // // // // console.log('Interceptor - Headers modificados:', cloned.headers.keys();); // Para debug
            return next.handle(cloned);
        }

        return next.handle(request);
    }
}
