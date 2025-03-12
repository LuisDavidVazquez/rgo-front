import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UserByClient {
    id: number;
    username: string;
    email: string;
    phone: string;
}

export interface SimIccid {
    id: number;
    iccid: string;
    status: string;
    name: string;
    planName?: string;
    dueDate?: Date;
    msisdn?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ClientsService {
    private apiUrl = environment.apiUrl;
    url = this.apiUrl + '/clients';

    private getHeaders(): HttpHeaders {
        const token = localStorage.getItem('authToken');
        return new HttpHeaders({
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    constructor(private http: HttpClient) {}

    getClients(): Observable<any> {
        return this.http.get(this.url);
    }

    getClientById(id: number): Observable<any> {
        return this.http.get(`${this.url}/${id}`);
    }

    createClient(client: any): Observable<any> {
        return this.http.post(this.url, client);
    }

    updateClient(id: number, client: any): Observable<any> {
        return this.http.put(`${this.url}/${id}`, client);
    }

    deleteClient(id: number): Observable<any> {
        return this.http.delete(`${this.url}/${id}`);
    }

    getUsersByClientId(clientId: number): Observable<UserByClient[]> {
        return this.http.get<UserByClient[]>(`${this.url}/users/${clientId}`, { headers: this.getHeaders() });
    }

    //Obtenre ICCID por IDcliente
    getAvailableIccids(clientId: number): Observable<SimIccid[]> {
        console.log('Requesting ICCIDs for client:', clientId);
        return this.http.get<SimIccid[]>(`${this.url}/sims/${clientId}`, 
            { headers: this.getHeaders() }
        ).pipe(
            map(sims => {
                console.log('All sims before filtering:', sims);
                // Temporalmente retornamos todos los SIMs sin filtrar
                return sims;
                // return sims.filter(sim => sim.status === 'available' || !sim.status);
            })
        );
    }
}
