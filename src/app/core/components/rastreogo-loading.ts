import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rastreogo-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay">
      <div class="loading-container">
        <img src="assets/images/Animación de carga.gif" alt="RastreoGo Loading">
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
    }

    img {
      max-width: 200px;
      height: auto;
      animation: fadeIn 0.5s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }
  `]
})
export class RastreogoLoadingComponent implements OnInit, OnDestroy {
  private minLoadingTime = 3000; // 2 segundos de tiempo mínimo
  private loadingStartTime: number = 0;
  private timeoutRef: any;


  ngOnInit() {
    this.loadingStartTime = Date.now();
  }

  ngOnDestroy() {
    if (this.timeoutRef) {
      clearTimeout(this.timeoutRef);
    }
  }

  // Método para asegurar tiempo mínimo de carga
  ensureMinLoadingTime(): Promise<void> {
    const elapsedTime = Date.now() - this.loadingStartTime;
    const remainingTime = Math.max(0, this.minLoadingTime - elapsedTime);

    return new Promise(resolve => {
      this.timeoutRef = setTimeout(() => {
        resolve();
      }, remainingTime);
    });
  }
}
