import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { RechargeplanMovement } from '../models/recharfeplanmovement.interface';

export interface PaginatedResponse<T> {
    items: T[];
    meta: {
        totalItems: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class RechargePlanMovementsService {
    private apiUrl = `${environment.apiUrl}/recharge-plan-movements/search`;

    constructor(private http: HttpClient) {}

    //rechargeplanMovement: RechargeplanMovement[] = [];
    searchMovements(params: {
        name?: string;
        createdAt?: string;
        endDate?: string;
        userId?: number;
        isFirstPost?: boolean;
        paymentStatus?: string;
        page?: number;
        limit?: number;
        amount?: number;
        details?: string;
        startDate?: string;
        id?: number;
    }): Observable<PaginatedResponse<RechargeplanMovement>> {
        let httpParams = new HttpParams();

        // // // // console.log('Parámetros recibidos:', params);

        if (params.startDate) {
            httpParams = httpParams.set('startDate', params.startDate);
        }
        if (params.endDate) {
            httpParams = httpParams.set('endDate', params.endDate);
        }
        if (params.userId) {
            httpParams = httpParams.set('userId', params.userId.toString());
        }
        if (params.isFirstPost !== undefined && params.isFirstPost.toString() != 'null') {
            httpParams = httpParams.set('isFirstPost', params.isFirstPost.toString());
        }
        if (params.paymentStatus) {
            httpParams = httpParams.set('paymentStatus', params.paymentStatus);
        }
        if (params.page) {
            httpParams = httpParams.set('page', params.page.toString());
        }
        if (params.limit) {
            httpParams = httpParams.set('limit', params.limit.toString());
        }
        if (params.amount) {
            httpParams = httpParams.set('amount', params.amount.toString());
        }
        if (params.details) {
            httpParams = httpParams.set('details', params.details);
        }

        // // // // console.log('Parámetros HTTP construidos:', httpParams.toString(););

        const token = localStorage.getItem('authToken');
        // // // // console.log('Token obtenido:', token ? 'Token presente' : 'Token no encontrado');

        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        // // // // console.log('URL de la API:', this.apiUrl);

        return this.http.get<PaginatedResponse<RechargeplanMovement>>(this.apiUrl, {
            headers: headers,
            params: httpParams
        });
    }
}
