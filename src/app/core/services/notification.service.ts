// src/app/services/notification.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { Notification } from '../models/notification.model';
import { tap, catchError, retryWhen, delay, scan } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  getNotifications(clientId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${environment.apiUrl}/notifications`, {
      params: { clientId: clientId.toString() },
      headers: this.getHeaders()
    }).pipe(
      retryWhen(errors => 
        errors.pipe(
          scan((retryCount, error) => {
            if (retryCount >= 3) throw error;
            return retryCount + 1;
          }, 0),
          delay(1000) // Esperar 1 segundo entre reintentos
        )
      ),
      catchError(error => {
        console.error('Error al obtener notificaciones después de reintentos:', error);
        return of([]);
      })
    );
  }

  markAsRead(notificationId: number): Observable<Notification> {
    // // // // console.log(`Marcando como leída la notificación ID: ${notificationId}`);
    return this.http.patch<Notification>(`${environment.apiUrl}/notifications/${notificationId}/read`, {}, { headers: this.getHeaders() }).pipe(
      tap(notification => {
        // // // // console.log(`Notificación ${notificationId} marcada como leída`);
      }),
      catchError(error => {
        console.error(`Error al marcar como leída la notificación ${notificationId}:`, error);
        return throwError(error);
      })
    );
  }

  refreshNotifications(clientId?: number) {
    this.getNotifications(clientId!).subscribe(
      notifications => this.notificationsSubject.next(notifications)
    );
  }
}