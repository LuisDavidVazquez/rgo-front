import { Component, Injectable, OnInit } from '@angular/core';
import { NotificationService } from './notification.service';


@Injectable({
    providedIn: 'root'
})

    export class NotificationPreferencesComponent implements OnInit {
  preferences: any = {};

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.loadPreferences();
  }

  loadPreferences() {
    // Cargar preferencias del usuario desde el backend
    this.preferences = {
      email: true,
      sms: true,
      push: true
    };
  }

  updatePreferences() {
    //this.notificationService.updatePreferences(this.preferences).subscribe(
    //  () => // // console.log('Preferencias actualizadas');//);
  }
}
