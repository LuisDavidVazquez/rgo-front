import { Component, Injectable, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class NotificationCenterComponent implements OnInit {
  notifications: any[] = [];

  constructor(
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadNotifications();
  }

  loadNotifications() {
    const clientId = Number(localStorage.getItem("ID"));
    if (isNaN(clientId)) {
      console.error('ID de cliente no válido');
      return;
    }
    this.notificationService.getNotifications(clientId).subscribe(
      notifications => this.notifications = notifications,
      error => {
        console.error('Error al cargar notificaciones:', error);
        if (error.status === 401) {
          console.error('Error de autenticación. Redirigiendo al login...');
          this.router.navigate(['/login']);
        }
      }
    );
  }

  markAsRead(notificationId: number) {
    this.notificationService.markAsRead(notificationId).subscribe(
      () => this.loadNotifications(),
      error => {
        console.error('Error al marcar como leída:', error);
        if (error.status === 401) {
          console.error('Error de autenticación. Redirigiendo al login...');
          this.router.navigate(['/login']);
        }
      }
    );
  }
}
