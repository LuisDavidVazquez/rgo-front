import { Component, ElementRef, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service'; // Ajusta esta ruta según la ubicación de tu servicio
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';





interface PermissionRow {
  name: string
  detail: string;
}



@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonModule,
    ],
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.css']
})

export class PermissionComponent implements OnInit {
  readonly TOTAL_BITS = 32; // Ajuste esto según el número de permisos/rows que tengas
  // Inicializa un arreglo para mantener el estado (activado/desactivado) de cada bit
  // La longitud de este arreglo es igual a la cantidad de filas/permisos
  bitStates: boolean[] = new Array(this.TOTAL_BITS).fill(false);
  // Arreglo de arreglos para almacenar los valores de los bits de cada octeto
  octetosValues: number[][] = [];
  hexValues: string[] = []; // Almacena los valores hexadecimales
  allHexValues: string[] = []; // Nuevo arreglo para almacenar todos los valores hexadecimales
  nameToSend: string = ''; // Almacena el nombre ingresado por el usuario
  authToken: string | null = '';



  sendDataToBackend(): void {
    // Asegúrate de obtener el token de autenticación del localStorage
    const token = localStorage.getItem('authToken');

    if (this.nameToSend && this.allHexValues.length > 0 && token) {
      // Construye el objeto a enviar, transformando el array de valores hexadecimales en un solo string
      const hexString = this.allHexValues.join(''); // Concatena todos los valores hexadecimales en un solo string sin separadores

      const payload = {
        name: this.nameToSend,
        value: hexString  // Ahora 'value' es un string que representa todos los valores hexadecimales concatenados
      };

      // // // // console.log(`Enviando ${JSON.stringify(payload);}`);

      // Ahora pasamos el 'payload' y el 'token' como argumentos
      this.authService.sendPermission(payload).subscribe({
        next: (response) => {
          // // // // console.log('Datos enviados con éxito', response);
          // Maneja aquí la respuesta exitosa
        },
        error: (error) => {
          console.error('Error al enviar datos', error);
          // Maneja aquí el error
        }
      });
    } else {
      // Maneja el caso de que el nombre, los valores hexadecimales o el token no estén disponibles
      console.error('Falta información requerida para enviar: nombre, valores hexadecimales o token de autenticación.');
    }
}



  // loginSuccess(token: string) {
  //   localStorage.setItem('accessToken', token);
  // }

  rows: PermissionRow[] = [
    {
      name: '1-Alta de distribuidor',
      detail: 'alta en rastreo para revender',

    },
    {
      name: '2-Alta de Usuarios',
      detail: 'alta de usuario en la plataforma',

    },
    {
      name: '3-eliminar Usuario del inventario',
      detail: 'eliminar del inventario del distribuidor',

    },
    {
      name: '4-Eliminar de manera definitiva del sistema',
      detail: 'alta en rastreogo para revender',

    },
    {
      name: '5-Suspender usuarios',
      detail: 'Suspender por falta de pago, negar el acceso',

    },
    {
      name: '6-Añadir linea',
      detail: 'añadir una nueva sim',

    },
    {
      name: '7-Suspender linea',
      detail: 'suspender una sim',

    },
    {
      name: '8-Alta de usuarios por lote',
      detail: 'añadir usuarios por grupos',

    },
    {
      name: '9-Asignar roles',
      detail: 'dar roles a tipos de cuenta',

    },
    {
      name: '10-Reset de sim',
      detail: 'reinicia la sim',

    },
    {
      name: '11-Reset de dispositivo',
      detail: 'resetear el dispositivo',

    },
    {
      name: '12-Cambio de plataforma',
      detail: 'cambio de plataforma de rastreo',

    },
    {
      name: 'opcional',
      detail: 'opcional',

    },
    {
      name: 'opcional',
      detail: 'opcional',

    },
    {
      name: 'opcional',
      detail: 'opcional',

    },
    {
      name: 'opcional',
      detail: 'opcional',

    },
    {
      name: '13-reporte de pagos',
      detail: 'reporte relacionado a finanzas(pagos, cancelaciones de pago)',

    },
    {
      name: '14-Reporte de alta de sims',
      detail: 'reporte de altas de sims(lineas)',

    },
    {
      name: '15-Reporte de alta usuarios',
      detail: 'reporte de altas de usuario',

    },
    {
      name: '16-Reporte de bajas de sims',
      detail: 'reporte de bajas de sims(lineas)',

    },
    {
      name: '17-Reporte de bajas',
      detail: 'reporte de bajas de usuarios',

    },
    {
      name: '18-Reporte de comisiones',
      detail: 'reporte de comision proporcional a la cantidad de recargas al mes',

    },
    {
      name: '19-Reporte de tickets',
      detail: 'reporte de incidencias',

    },
    {
      name: '20-Reporte de ventas',
      detail: 'reporte de ventas realizados por los vendedores',

    },
    {
      name: 'opcional',
      detail: 'opcional',

    },
    {
      name: 'opcional',
      detail: 'opcional',

    },
    {
      name: '21-vender lineas',
      detail: 'ventas de lineas  de los vendedores',

    },
    {
      name: '22-Recarga de todas las lineas',
      detail: 'un usuario puede recargar todas sus lineas',

    },
    {
      name: '23-Recarga de linea',
      detail: 'un usuario puede pagar su linea',

    },
    {
      name: '24-Incrementar plan',
      detail: 'un usuario puede cambiar de idea y subir su plan sin aver acabado el plan anterior',

    },
    {
      name: '25-Realizar pagos',
      detail: 'los usuarios pueden realizar pagos',

    },
    {
      name: 'opcional',
      detail: 'opcional',

    },
    // Agrega más filas según sea necesario
  ];




  constructor(
    private authService: AuthService,
    private router: Router  // Añade el Router al constructor
  ) { }
  // Llama a esta función al inicio para inicializar los arreglos de valores de los checkboxes


  ngOnInit(): void {
    // Intenta recuperar el token de autenticación del localStorage
    const token = localStorage.getItem('authToken');
    // // // // console.log('Token recuperado:', token); // Imprime el token
    if (!this.authToken) {
      console.error('No se encontró el token de autenticación.');
      // Considera redirigir al usuario al login o manejar la falta de token adecuadamente
    }


    // Aquí puedes usar this.token según sea necesario en tu componente
    this.convertOctetosToHexAndStore();

    // Inicializa octetosValues con un arreglo para cada octeto
    const numOctetos = Math.ceil(this.TOTAL_BITS / 8);
    this.octetosValues = Array.from({ length: numOctetos }, () => []);
    // Asegúrate de que allHexValues tenga un lugar para cada octeto desde el principio.
    this.allHexValues = Array(this.TOTAL_BITS / 8).fill('0');

  }





  getOctetValues(): number[] {
    // Convertimos directamente los bits a valores de octetos sin necesidad de invertir el arreglo,
    // ya que la lógica de inversión se maneja en toggleBit
    return this.chunkArray(this.bitStates, 8).map(bits => this.bitsToNumber(bits));
  }

  chunkArray(array: any[], chunkSize: number): any[][] {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      result.push(array.slice(i, i + chunkSize));
    }
    return result;
  }

  bitsToNumber(bits: boolean[]): number {
    // Convierte un arreglo de bits (booleanos) a un número
    // Aquí no necesitamos invertir el arreglo, pues el bit de mayor valor ya está correctamente posicionado
    return bits.reduce((acc, val, index) => acc + (val ? Math.pow(2, 7 - index) : 0), 0);
  }



  handleCheckboxChange(rowIndex: number): void {
    // Invierte el estado del bit específico
    this.bitStates[rowIndex] = !this.bitStates[rowIndex];

    // Actualiza el valor del bit en octetosValues
    this.updateOctetosValues(rowIndex);

    // Calcula el octeto y el índice del bit dentro de ese octeto
    const octetoIndex = Math.floor(rowIndex / 8);
    const bitIndex = rowIndex % 8;
    const bitValue = Math.pow(2, 7 - bitIndex); // Ajusta según la posición del bit dentro del octeto



    // Asegúrate de que estamos manejando el arreglo de valores del octeto correcto
    if (!this.octetosValues[octetoIndex]) {
      this.octetosValues[octetoIndex] = new Array(8).fill(0);
    }

    // Actualiza el valor del bit en el arreglo del octeto
    // Si el bit está activo, almacena su valor; de lo contrario, asegura que es 0
    this.octetosValues[octetoIndex][bitIndex] = this.bitStates[rowIndex] ? bitValue : 0;
    this.calculateOctetosTotals();
    this.printOctetosTotalsInHex(); // Muestra los totales actualizados en la consola
    // Opcionalmente, después de actualizar, imprime los estados actuales de los octetos
    this.printOctetosStates();




    // // // // console.log(`Octeto ${octetoIndex + 1}, Bit ${bitIndex} (${this.bitStates[rowIndex] ? 'ON' : 'OFF'});: Valor del bit = ${bitValue}`);
    // // console.log('Este el total del octeto');// Llama a calculateOctetosTotals para ver los totales actualizados

    // Después de actualizar los estados de los bits, llama a printOctetosTotalsInHex para ver los totales en hexadecimal

  }

  calculateOctetosTotals(): number[] {
    // Asume que octetosValues es un arreglo de arreglos con 1s y 0s representando los bits encendidos y apagados
    return this.octetosValues.map(octeto =>
      octeto.reduce((total, bit, index) => total + (bit ? Math.pow(2, 7 - index) : 0), 0)
    );
  }

  convertOctetosToHexAndStore(): void {
    const totals = this.calculateOctetosTotals();
    this.allHexValues = totals.map(decimal => decimal.toString(16).toUpperCase());

    // Muestra los valores hexadecimales calculados para verificación
    // // // // console.log('Valores hexadecimales de cada octeto:', this.allHexValues);
  }




  printOctetosStates(): void {
    this.octetosValues.forEach((octeto, index) => {
      // Crear una cadena que represente el estado de cada bit en el octeto
      const bitStatesStr = octeto.map((value, bitIndex) => `Bit ${7 - bitIndex} (Posición ${bitIndex}): ${value}`).join(', ');
      // // // // console.log(`Estado del arreglo ${index + 1}: [${bitStatesStr}]`);
      // // // // console.log(`Estado del octeto ${index + 1}:`, octeto);
    });

  }

  convertTotalsToHex(): void {
    const totals = this.calculateOctetosTotals();
    this.hexValues = totals.map(total => total.toString(16).toUpperCase());

    // // // // console.log('Valores hexadecimales:', this.hexValues);
  }



  printOctetosTotalsInHex(): void {
    const totals = this.calculateOctetosTotals();
    // Asegúrate de que hexValues esté vacío o no, según lo que necesites.
    this.hexValues = totals.map(total => total.toString(16).toUpperCase());

    // Luego, si quieres acumular todos los valores en allHexValues...
    this.allHexValues = [...this.hexValues];

    // // // // console.log('Valores hexadecimales actuales:', this.hexValues);
    // // // // console.log('Todos los valores hexadecimales acumulados:', this.allHexValues);
  }




  updateAllHexValues(): void {
    const totals = this.calculateOctetosTotals();
    // Convierte y almacena los totales en hexadecimal.
    const newHexValues = totals.map(total => total.toString(16).toUpperCase());

    // Aquí asumimos que quieres almacenar la suma de todos los octetos calculados en un solo valor hexadecimal
    // Suma todos los totales
    const sumOfTotals = totals.reduce((acc, total) => acc + total, 0);
    // Convierte la suma total a hexadecimal y lo almacena en allHexValues
    const sumHex = sumOfTotals.toString(16).toUpperCase();
    this.allHexValues.push(sumHex);

    // // // // console.log('Nuevo valor hexadecimal sumado:', sumHex);
    // // // // console.log('Todos los valores hexadecimales acumulados:', this.allHexValues);
  }



  updateOctetosValues(rowIndex: number): void {
    const octetoIndex = Math.floor(rowIndex / 8);
    const bitIndex = 7 - (rowIndex % 8); // Invertimos la posición del bit
    const bitValue = Math.pow(2, bitIndex);

    this.octetosValues[octetoIndex] = this.octetosValues[octetoIndex] || new Array(8).fill(0);
    this.octetosValues[octetoIndex][7 - bitIndex] = this.bitStates[rowIndex] ? bitValue : 0; // Ajuste para inversión
  }





  // Calcula el valor numérico total basado en los estados de los checkboxes (bits activos)
  calculateTotalValue(): number {
    let totalValue = 0;
    // Asumiendo que tienes un arreglo bitStates correctamente definido y lleno
    this.bitStates.forEach((isActive, index) => {
      if (isActive) {
        const octetoIndex = Math.floor(index / 8);
        const bitIndex = index % 8;
        totalValue += Math.pow(2, 7 - bitIndex); // Ajusta según la posición del bit dentro del octeto
      }
    });

    return totalValue;
  }

  savePermissions() {
    // // // // console.log('Token recuperado:', this.authToken); // Imprime el token

  }

  navigateToLogin(): void {
    this.router.navigate(['auth/login']);
  }

}
