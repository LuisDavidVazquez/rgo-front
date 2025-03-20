import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule
  ],
  selector: 'app-thanks-user',
  templateUrl: './thanks-user.component.html',
  styleUrls: ['./thanks-user.component.css']
})
export class ThanksUserComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Redirigir después de 3 segundos usando replaceUrl
    setTimeout(() => {
      this.router.navigate(['/lines/lines'], { 
        replaceUrl: true,
        skipLocationChange: true 
      });
    }, 3000);
  }

}
