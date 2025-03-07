import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Estado {
    id: number;
    nombre: string;
}

@Injectable({
    providedIn: 'root'
})
export class AddressesService {
    private apiUrl = environment.apiUrl;
    url = this.apiUrl + '/addresses';

    constructor(private http: HttpClient) {}

    getEstados(): Observable<Estado[]> {
        return this.http.get<Estado[]>(`${this.url}/mexico/estados`);
    }

    getMunicipios(estado: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.url}/mexico/municipios/${estado}`);
    }
}
