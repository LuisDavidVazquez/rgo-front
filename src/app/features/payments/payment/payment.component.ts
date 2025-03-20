import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { map, switchMap, tap, catchError } from 'rxjs/operators';
import { from } from 'rxjs';
//import { Recharge } from '../models/recharge.module';
import { SimsDataService } from '../../../core/services/sims-data.service';
import { recharge_plan } from '../../../core/models/plans.model';
import { Sim } from '../../../core/models/sim.model';
import { environment } from '../../../environments/environment';
import { AuthService } from '../../../core/auth/auth.service';
import { pipe } from 'rxjs';
import { EMPTY } from 'rxjs';
import { of } from 'rxjs';
import { paymentDetails } from '../../../core/models/payment.model';
import { filter } from 'rxjs/operators';
import { StripeService } from '../../../core/services/stripe.service';
import { take } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';





////////http://localhost:4200/validar-pago
@Component({
  standalone: true,
  imports: [
    HttpClientModule,
    
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    BrowserModule,
    BrowserAnimationsModule,
    
  ],
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css'],
  providers: [StripeService]
})
export class PaymentComponent implements OnInit {
  // Propiedades de la clase
  planData: recharge_plan = { id: 0, amount: 0, days: 0, name: '' };
  simDetails: Sim[] = [];
  response: string = '';
  monto: number = 0;
  formaPago: string = '';
  foliosYLineNumbers: { folio: string; idplan: number }[] = [];
  idplan!: number;
  foliomexPago!: number;
  numeroTransaccion: string = '';
  simId: number = 0;
  selectedSim: Sim | null = null;
  clientLevel: string = '';
  numeroAutorizacion: string = '';
  private planDetails: any;
  planName: string = '';
  days: number = 0;
  transactionData: any = null;
  unitName: string = '';
  debitoCredito: string = '';
  banco: string = '';
  tipoTarjeta: string = '';
  rechargePlanName: string = '';
  paymentDetails: any = null;
  currentUserId: number = 0;
  paymentSuccess: boolean = false;
  successMessage: string = '';
  paymentError: boolean = false;
  errorMessage: string = '';
  username: string = '';
  iccid: string = '';   // Para mostrar 'Plan de Recarga'
  nombreUnidad: string = ''; // Para mostrar 'Nombre de la Unidad'
  planNombre: string = '';   // Para mostrar 'Plan de Recarga'
  isFirstPost: boolean = false;
  processedSessionIds: string[] = [];
  companyClient: string = '';
  clientId: string = '';
  
  transacionsim: any;  //para mostrar los datos de la transaccion en el pago

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private simData: SimsDataService,
    private http: HttpClient,
    private authService: AuthService,
    private readonly stripeService: StripeService

  ) { }







  async ngOnInit() {

    try {
      this.transacionsim = JSON.parse(localStorage.getItem('currentTransaction') || '{}');
     // console.log('simsarray', this.transacionsim);// Verificar token primero
      const token = localStorage.getItem('authToken');
      const clientLevel = localStorage.getItem('clientLevel') || this.clientLevel;
      // // console.log('Token encontrado:', !!token);
      // // console.log('Token valor:', token);
      // // console.log('Nivel del cliente:', clientLevel);
      this.clientId = localStorage.getItem('ID') || '';
     // console.log('clientId', this.clientId);// Recuperar `isFirstPost` desde localStorage
      const isFirstPostString = localStorage.getItem('isFirstPost');
      if (isFirstPostString) {
        this.isFirstPost = JSON.parse(isFirstPostString);
        // // console.log('isFirstPost:', this.isFirstPost);
      }

      if (!token) {
        console.error('No se encontró token de autenticación');
        return;
      }

      // Obtener el perfil del usuario para asegurar el nivel del cliente
      try {
        const userData = await firstValueFrom(this.authService.getuserprofile());
        this.clientLevel = userData.clientlevel;
        localStorage.setItem('clientLevel', userData.clientlevel);
        // // console.log('Nivel del cliente actualizado:', this.clientLevel);
      } catch (error) {
        console.error('Error al obtener los datos del usuario', error);
        // await this.router.navigate(['/login']);
        return;
      }

      const paymentProcessed = localStorage.getItem('paymentProcessed');

      // if (paymentProcessed === 'true') {
      //   // // console.log('El pago ya ha sido procesado previamente.');
      //   return;
      // }

      // Recuperar detalles de la transacción desde LocalStorage
      // // console.log(' Cargando datos de transacción desde localStorage');
      // Verificar si existe currentTransaction en localStorage
      const transactionDataString = localStorage.getItem('currentTransaction');
      // // console.log('Verificando currentTransaction en localStorage:', transactionDataString ? 'Existe' : 'No existe');
      // Los datos pueden desaparecer de localStorage por:
      // 1. Expiración natural del localStorage 
      // 2. Limpieza manual del localStorage (ej: localStorage.clear())
      // 3. El usuario limpia los datos del navegador
      // 4. Otra parte del código elimina específicamente este item
      if (transactionDataString) {
        const transactionData = JSON.parse(transactionDataString);
        // // console.log('🔍 Datos de transacción recuperados:', transactionData);
        this.simId = transactionData.simId || 0;
        //console.log('simId de transaccion', this.simId);
        this.unitName = transactionData.username || '';
        this.planData = transactionData.plan || {};
        this.monto = transactionData.monto || 0;
        this.days = transactionData.plan?.days || 0;
        this.planName = transactionData.plan?.name || '';
        this.isFirstPost = transactionData.isFirstPost || false; // Asignar isFirstPost
        // // console.log('isFirstPost recuperado de currentTransaction:', this.isFirstPost);
        this.clientId = transactionData.clientId || this.clientId;
        // // console.log('clientId recuperado de currentTransaction:', this.clientId);

        // // console.log('Datos de la transacción recuperados:', transactionData);


        const planSeleccionado = localStorage.getItem('selectedPlan');
        if (planSeleccionado) {
          const plan = JSON.parse(planSeleccionado);
          this.planData = {
            id: plan.id,
            name: plan.name,
            amount: plan.amount,
            days: plan.days
          };
          // // console.log('Plan seleccionado recuperado desde LocalStorage:', this.planData);
        }

        const queryParams = new URLSearchParams(window.location.search);
        const sessionId = queryParams.get('session_id');

        if (sessionId) {
          this.verifyStripePayment(sessionId);
        }

        // Verificar si iccid está vacío
        if (!transactionData.iccid) {
          console.warn('ICCID está vacío en currentTransaction. Buscando a través de simId:', this.simId);
          await this.obtenerIccidPorSimId(this.simId);
          // Actualizar transactionData después de obtener el iccid
          const updatedTransaction = { ...transactionData, iccid: this.simDetails[0]?.iccid || '' };
          localStorage.setItem('currentTransaction', JSON.stringify(updatedTransaction));
          this.simDetails[0].iccid = updatedTransaction.iccid;
        }

      }


      else {
        console.error('No se encontraron datos de la transacción en LocalStorage.');
      }
    } catch (error) {
      console.error('Error en inicialización:', error);
      //await this.router.navigate(['/login']);
    }
    this.displayProcessedSessionIds();
  }

  async verifyStripePayment(sessionId: string) {
    // // console.log('🔍 Iniciando verificación de pago Stripe para session_id:', sessionId);

    try {
      // // console.log('🔍 Iniciando verificación de pago Stripe:', sessionId);

      const paymentVerification = await firstValueFrom(
        this.stripeService.verifyStripePayment(sessionId)
      );

      // // console.log('💳 Resultado de verificación:', paymentVerification);

      if (paymentVerification.status === 'approved') {



        const metadata = paymentVerification.paymentDetails.metadata;
        const currentTransaction = localStorage.getItem('currentTransaction');
        let sims: any[] = [];
        if (currentTransaction) {
          const transactionData = JSON.parse(currentTransaction);
          //console.log('transactionData', transactionData);
          sims = transactionData.articulos.map((item: any) => {
            return {
              simId: item.simId,
              iccid: item.iccid,
              planDays: parseInt(metadata.planDays, 10) || 30,
              rechargePlanId: parseInt(metadata.planId, 10),
              client: metadata.userId,
              planName: item.planName,
              unitName: item.unitName
            };
          });
        }

        //console.log('currentTransaction', currentTransaction);
        //console.log('sims de transacciondata', sims);//return;
        const planDays = parseInt(metadata.planDays, 10) || 30;
        const iccid = metadata.iccid || '';
        const simId = parseInt(metadata.simId, 10);
        const rechargePlanId = parseInt(metadata.planId, 10);
        const client = metadata.userId;
        const planName = metadata.username || this.planNombre || '';
       const clientId = metadata.clientId;


        //console.log('metaclientId', this.clientId);// // console.log('📋 Detalles extraídos del pago:', { simId, rechargePlanId, planDays, iccid, client, planName });

        try {
          // // console.log('🔄 Llamando a handleSim con los datos extraídos...');
          // // console.log('clientId en handleSim:', this.clientId);
          const simResult = await firstValueFrom(
            this.handleSimArray(sims)
          );

          // // console.log('✨ Resultado de handleSim:', simResult);

          // Actualizar detalles de la SIM en el componente
          this.paymentSuccess = true;
          this.successMessage = `Pago aprobado para el plan ${planName}.`;

          // Actualizar LocalStorage
          const currentTransaction = localStorage.getItem('currentTransaction');
          if (currentTransaction) {
            const updatedTransaction = { ...JSON.parse(currentTransaction), isFirstPost: this.isFirstPost };
            localStorage.setItem('currentTransaction', JSON.stringify(updatedTransaction));
            // // console.log('isFirstPost actualizado en currentTransaction:', this.isFirstPost);
          }

          // Limpiar datos de la transacción
          this.clearTransactionData();

          // Eliminar `session_id` de la URL
          this.router.navigate([], {
            replaceUrl: true,
            queryParams: {}
          });

        } catch (simError) {
          console.error('❌ Error en handleSim:', simError);
          this.paymentError = true;
          this.errorMessage = 'Error al actualizar la SIM después del pago.';
        }
      } else {
        console.error('❌ Pago no aprobado:', paymentVerification);
        this.paymentError = true;
        this.errorMessage = 'Pago no aprobado.';
      }
    } catch (error) {
      console.error('❌ Error en verificación de pago:', error);
      this.paymentError = true;
      this.errorMessage = 'Error al validar el pago.';
    }
  }


  private handleSimArray(sims: any[]): Observable<Sim[]> {
    const simsArray = sims.map((sim: any) => {
      return {
        simId: sim.simId,
        rechargePlanId: sim.rechargePlanId,
        days: sim.planDays,
        iccid: sim.iccid,
        //client: sim.client,
        planName: this.planData.name,
        paidDate: new Date().getTime().toString(),
        dueDate: new Date().getTime() + (sim.planDays * 24 * 60 * 60 * 1000).toString(),
        isFirstPost: this.isFirstPost,
        clientId: this.clientId,
        unitName: sim.unitName
      }

    });
    // // console.log('Llamando a handleSimarray con:', { simsArray });
    // // console.log('📤 Datos de SIM a enviar al servidor:', simsArray);

    return this.http.post<Sim[]>(`${environment.apiUrl}/sims/handle`, simsArray, this.getHttpOptions()).pipe(
      tap(updatedSim => {
        // // console.log('✅ SIM actualizada exitosamente:', updatedSim);
        // Actualiza el estado de tu componente si es necesario
      }),
      catchError(error => {
        console.error('❌ Error en la petición de handleSim:', error);
        this.paymentError = true;
        this.errorMessage = 'Error al actualizar la SIM después del pago.';
        return throwError(() => error);
      })
    );
  }
  




  // Método handleSim con logs adicionales
  private handleSim(simId: number, rechargePlanId: number, days: number, iccid: string, clientId: string, unitName: string): Observable<Sim> {
    // // console.log('handleSim llamado con:', { simId, rechargePlanId, days, clientId, unitName });
    const simData = {
      id: simId,
      rechargePlanId: rechargePlanId,
      days: days,
      iccid: iccid,
      isFirstPost: this.isFirstPost,
      planName: this.planName || '',
      clientId: this.clientId || '',
      unitName: this.unitName || '',

      //client: client,
      //planName: planName || this.planNombre || '',
      paidDate: new Date().getTime().toString(),
      dueDate: new Date().getTime() + (days * 24 * 60 * 60 * 1000).toString(),
      //distributorId: client
    };
    // // console.log('Llamando a handleSim con:', { simId, rechargePlanId, days, clientId, unitName });
    // // console.log('📤 Datos de SIM a enviar al servidor:', simData);

    return this.http.post<Sim>(`${environment.apiUrl}/sims/handle`, simData, this.getHttpOptions()).pipe(

      tap(updatedSim => {
        // // console.log('✅ SIM actualizada exitosamente:', updatedSim);
        // Actualiza el estado de tu componente si es necesario
      }),
      catchError(error => {
        console.error('❌ Error en la petición de handleSim:', error);
        this.paymentError = true;
        this.errorMessage = 'Error al actualizar la SIM después del pago.';
        return throwError(() => error);
      })
    );
  }

  private getHttpOptions() {
    const token = localStorage.getItem('authToken') || '';
    // // console.log('Token:', token);
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  private clearTransactionData() {
     localStorage.removeItem('currentTransaction');
     localStorage.removeItem('simsarray');
    localStorage.removeItem('selectedPlan');
    localStorage.removeItem('isFirstPost');
  }

  private initializeComponent(): Observable<any> {
    // Obtener el plan seleccionado nuevamente en caso de haber cambios
    const selectedPlan = this.simData.getSelectedPlan();
    if (selectedPlan) {
      this.days = selectedPlan.days;
      this.planName = selectedPlan.name;
      this.idplan = selectedPlan.id;
    }

    // Asegurarse de que tengamos un simId válido
    if (!this.simId && this.simDetails.length > 0) {
      this.simId = this.simDetails[0].id;
    }

    // Validar que tengamos los datos necesarios
    if (!this.simId || !this.numeroTransaccion || !this.monto || this.days <= 0 || !this.planName) {
      console.error('Datos faltantes:', {
        simId: this.simId,
        numeroTransaccion: this.numeroTransaccion,
        monto: this.monto,
        days: this.days,
        planName: this.planName
      });
      return EMPTY;
    }

    return from(this.getUserProfile()).pipe(
      //switchMap(() => this.validatePayment(this.numeroTransaccion, this.monto)),
      switchMap(() => this.validatePaymentStripe(this.numeroTransaccion)),
      switchMap(() => this.handleSim(this.simId, this.idplan, this.days, this.simDetails[0]?.iccid || '', this.clientId, this.unitName))
    );
  }

  // Cargar folios y números de línea desde localStorage
  private loadFoliosYLineNumbers() {
    const foliosYLineNumbersJSON = localStorage.getItem('foliosYLineNumbers');
    if (foliosYLineNumbersJSON) {
      this.foliosYLineNumbers = JSON.parse(foliosYLineNumbersJSON);
    }
  }

  // Capturar el estado de navegación
  private captureNavigationState() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.simDetails = navigation.extras.state['simDetails'] as Sim[];
      // // console.log('SimDetails:', this.simDetails);
      this.selectedSim = navigation.extras.state['sim'] as Sim;
      this.simId = this.selectedSim.id;
      // // console.log('Sim seleccionado:', this.selectedSim);
      // // console.log('SimID:', this.simId);
    }
  }

  // Suscribirse a los parámetros de la ruta
  private subscribeToRouteParams() {
    this.route.queryParams.subscribe(params => {
      this.numeroTransaccion = params['numeroTransaccion'] || '';
      this.monto = params['monto'] || '0';
      // // console.log('Monto y número de transacción:', this.monto, this.numeroTransaccion);

      if (params['folioMexPago']) {
        this.foliomexPago = parseInt(params['folioMexPago']);
      }

      this.validatePaymentStripe(this.numeroTransaccion);
      //  this.validatePayment(this.numeroTransaccion, this.monto);
      this.handleSim(this.simId, this.idplan, this.simDetails[0]?.days || 0, this.simDetails[0]?.iccid || '', this.clientId, this.unitName);
    });
  }

  // Obtener el perfil del usuario
  private async getUserProfile() {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const userData = await firstValueFrom(this.authService.getuserprofile());
        this.clientLevel = userData.clientlevel;
        // // console.log('Nivel del cliente:', this.clientLevel);
      } catch (error) {
        console.error('Error al obtener los datos del usuario', error);
      }
    }
  }

  async validatePaymentStripe(paymentIntentId: string) {
    try {
      // Usar firstValueFrom para convertir el Observable a Promise
      const paymentStatus = await firstValueFrom(
        this.stripeService.checkPaymentStatus(paymentIntentId)
      );

      if (paymentStatus.status === 'succeeded') {
        // Actualizar el estado del pago en tu backend
        await this.updatePaymentStatus(paymentIntentId, 'approved');

        // Actualizar la información de la SIM
        await this.handleApprovedPayment({
          transactionId: paymentIntentId,
          amount: paymentStatus.amount,
          status: 'approved'
        });

        alert('¡Pago completado con éxito!');
      } else {
        alert('El pago no pudo ser completado');
      }
    } catch (error) {
      console.error('Error al validar el pago:', error);
      alert('Error al validar el pago');
    }
  }

  // Procesar el pago
  private async processPayment(transaccion: string, monto: string, httpOptions: any): Promise<paymentDetails> {
    const url = `${environment.apiUrl}/recharge-plans-movements/mexpago`;
    const date = new Date();

    // Recuperar datos de la transacción
    const currentTransaction = localStorage.getItem('currentTransaction');
    const transactionData = currentTransaction ? JSON.parse(currentTransaction) : null;

    // Crear el objeto de datos para MexPago
    const data = {
      noTransaccion: transaccion,
      fecha: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      monto: monto,
      articulos: {
        articulos: transactionData?.articulos || [{
          descripcion: `Recarga ${this.planData.name}`,
          monto: monto
        }]
      },
      precargaDatos: {
        nombre: this.unitName || '',
        apPaterno: '',
        apMaterno: '',
        correo: '',
        celular: ''
      },
      enviarCorreo: "false",
      infoComercio: "true",
      lenguaje: "es"
    };

    try {
      // // // // console.log(


// // // // console.log('🚀 Datos enviados a MexPago:', {
// // //         url,
// // //         data,
// // //         headers: httpOptions.headers
// // //       }
// // // 
// // 
// );

      const response = await firstValueFrom(
        this.http.post<paymentDetails>(url, data, httpOptions).pipe(
          filter((event: any): event is paymentDetails => {
            return event && 'numeroAutorizacion' in event;
          }),
          tap((response: paymentDetails) => {
            // // // // console.log(


// // // // console.log('📦 Respuesta completa de MexPago:', {
// // //               numeroAutorizacion: response.numeroAutorizacion,
// // //               tipoTarjeta: response.tipoTarjeta,
// // //               banco: response.banco,
// // //               contrato: response.contrato,
// // //               folioMexPago: response.folioMexPago,
// // //               debitoCredito: response.debitoCredito,
// // //               idCargoDomiciliado: response.idCargoDomiciliado,
// // //               fecha: response.fecha,
// // //               monto: response.monto,
// // //               estatus: response.estatus,
// // //               noTransaccion: response.noTransaccion,
// // //               cargoDomiciliado: response.cargoDomiciliado,
// // //               tarjeta: response.tarjeta
// // //             }
// // // 
// // 
// );
          }),
          map((response: paymentDetails) => {
            if (!response) {
              throw new Error('Respuesta vacía de MexPago');
            }

            return {
              numeroAutorizacion: response.numeroAutorizacion || '',
              tipoTarjeta: response.tipoTarjeta || '',
              banco: response.banco || '',
              contrato: response.contrato || '',
              folioMexPago: response.folioMexPago || '',
              debitoCredito: response.debitoCredito || '',
              idCargoDomiciliado: response.idCargoDomiciliado || '',
              fecha: response.fecha || '',
              monto: response.monto || '',
              estatus: response.estatus || '',
              noTransaccion: response.noTransaccion || '',
              cargoDomiciliado: response.cargoDomiciliado || false,
              tarjeta: response.tarjeta || ''
            } as paymentDetails;
          })
        )
      );

      // // console.log('✅ Datos finales mapeados:', response);
      return response;

    } catch (error: unknown) {
      console.error('❌ Error en processPayment:', error);
      if (error instanceof Error) {
        throw new Error(`Error en el procesamiento del pago: ${error.message}`);
      } else {
        throw new Error('Error desconocido en el procesamiento del pago');
      }
    }
  }

  // Manejar el pago aprobado
  // private async handleApprovedPayment(payment: paymentDetails, token: string) {
  //   this.monto = payment.monto;
  //   this.formaPago = `${payment.tipoTarjeta} ${payment.tarjeta}`;

  //   const simId = await this.getSimId(payment.noTransaccion, token) || this.simDetails[0]?.id;
  //   if (simId) {
  //     this.simId = simId;
  //     await this.updateSimInformation(this.simId, this.idplan);
  //     await this.getSimDetails(this.simId);
  //   } else {
  //     alert('El pago no pudo ser procesado. Consultar a Soporte Técnico');
  //   }
  // }

  // Finalizar la transacción
  async endTransaccion() {
    try {
      // // console.log('💳 Iniciando el proceso de finalización de transacción...');

      // Limpiar datos de la transacción
      this.clearTransactionData();
      // // console.log('🧹 Datos de transacción limpiados.');

      // Obtener el token y nivel del cliente
      const token = localStorage.getItem('authToken');
      const clientLevel = localStorage.getItem('clientLevel') || this.clientLevel;
      // // console.log('🔑 Token:', token ? 'Existe' : 'No existe');
      // // console.log('⭐ Nivel del cliente:', clientLevel);

      if (!token) {
        console.error('❌ No se encontró token de autenticación');
        // Opcional: Redirigir al login si no hay token
        // await this.router.navigate(['/login']);
        return;
      }

      // Determinar la ruta de redirección basada en el nivel del cliente
      const routes: { [key: string]: string } = {
        '0': '/home',
        '1': '/permission',
        '2': '/dashboard/dashboard-distributor',
        '3': '/users/thanks-user',
        '4': '/validation'
      };

      const defaultRoute = '/lines/lines';
      const targetRoute = routes[clientLevel] || defaultRoute;

      // console.log('🔄 Ruta de redirección determinada:', targetRoute);

      // Limpiar el session_id antes de navegar
      this.clearSessionId();
      // // console.log('🧹 session_id limpiado antes de la navegación.');

      // // console.log('🚀 Redirigiendo a:', targetRoute);
      await this.router.navigate([targetRoute], { replaceUrl: true });
      
      // Agregar recarga de página después de la navegación
      window.location.reload();

      // Verificar si el session_id se ha limpiado después de la navegación
      const currentSessionId = this.getSessionId();
      // // console.log('🔍 session_id después de la navegación:', currentSessionId ? currentSessionId : 'No existe');

    } catch (error) {
      console.error('❌ Error al finalizar la transacción:', error);
      await this.router.navigate(['/lines/lines'], { replaceUrl: true });
      window.location.reload(); // También agregamos la recarga aquí para el caso de error
    }
  }

  // Obtener el ID de la SIM
  private async getSimId(noTransaccion: string, token: string): Promise<number | null> {
    const url = `${environment.apiUrl}${environment.apiRechargePlansMovementsUrl}/transaction/${noTransaccion}`;
    const httpOptions = this.getHttpOptions1(token);

    try {
      const response: any = await firstValueFrom(this.http.get(url, httpOptions));
      // // console.log('SimID obtenido:', response.simId);
      return response.simId;
    } catch (error) {
      console.error('Error al obtener el simId:', error);
      return null;
    }
  }

  // Obtener detalles de la SIM
  private async getSimDetails(simId: number) {
    const url = `${environment.apiUrl}${environment.apiSimsUrl}/${simId}`;
    const token = localStorage.getItem('authToken') || '';
    const httpOptions = this.getHttpOptions1(token);

    try {
      const simDetails = await firstValueFrom(this.http.get<Sim>(url, httpOptions));
      this.simDetails = [{ ...simDetails, isFirstPost: this.simDetails[0]?.isFirstPost }];
      // // console.log('Detalles de la SIM actualizada:', this.simDetails);
    } catch (error) {
      console.error('Error al obtener los detalles de la SIM:', error);
    }
  }

  // Actualizar información de la SIM
  async updateSimInformation(simId: number, rechargePlanId: number) {
    const url = `${environment.apiUrl}${environment.apiRechargePlansMovementsUrl}/update-sim`;
    const data = { simId, rechargePlanId };
    const token = localStorage.getItem('authToken') || '';
    const httpOptions = this.getHttpOptions1(token);

    try {
      const client = await firstValueFrom(this.http.patch(url, data, httpOptions));
      return client;
    } catch (error) {
      console.error('Error al actualizar la información de la SIM:', error);
      throw error;
    }
  }

  // Obtener opciones HTTP con token de autorización
  private getHttpOptions1(token: string) {
    return {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };
  }

  // Método auxiliar para asignar los datos del plan
  private assignPlan(plan: recharge_plan) {
    this.days = plan.days;
    this.planName = plan.name;
    this.idplan = plan.id;
  }

  private async updatePaymentStatus(paymentIntentId: string, status: string): Promise<void> {
    const token = localStorage.getItem('authToken') || '';
    const httpOptions = this.getHttpOptions1(token);

    try {
      // // console.log('Actualizando estado del pago:', { paymentIntentId, status });

      const response = await firstValueFrom(
        this.http.patch(
          `${environment.apiUrl}/recharge-plans-movements/payment-status/${paymentIntentId}`,
          { status },
          httpOptions
        ).pipe(
          catchError(error => {
            console.error('Error en la actualización del pago:', error);
            if (error.status === 500) {
              // // console.log('Reintentando actualización...');
              // Reintentar la petición una vez
              return this.http.patch(
                `${environment.apiUrl}/recharge-plans-movements/payment-status/${paymentIntentId}`,
                { status },
                httpOptions
              );
            }
            throw error;
          })
        )
      );

      // // console.log('Estado del pago actualizado:', response);
    } catch (error) {
      console.error('Error fatal actualizando estado del pago:', error);
      throw new Error('No se pudo actualizar el estado del pago');
    }
  }

  private async handleApprovedPayment(payment: any) {
    const token = localStorage.getItem('authToken') || '';

    if ('numeroAutorizacion' in payment) {
      // Flujo MexPago
      this.monto = payment.monto;
      this.formaPago = `${payment.tipoTarjeta} ${payment.tarjeta}`;
      const simId = await this.getSimId(payment.noTransaccion, token) || this.simDetails[0]?.id;

      if (simId) {
        this.simId = simId;
        await this.updateSimInformation(this.simId, this.idplan);
        await this.getSimDetails(this.simId);
      }
    } else {
      // Flujo Stripe
      this.monto = (payment.amount / 100); // Stripe usa centavos
      this.formaPago = 'Tarjeta (Stripe)';
      const simId = this.simDetails[0]?.id;

      if (simId) {
        this.simId = simId;
        await this.updateSimInformation(this.simId, this.idplan);
        await this.getSimDetails(this.simId);
      }
    }
  }

  async validatePayment(paymentIntentId: string) {
    try {
      // Convertir Observable a Promise y obtener el resultado
      const paymentStatus = await firstValueFrom(
        this.stripeService.checkPaymentStatus(paymentIntentId)
      );

      if (paymentStatus.status === 'succeeded') {
        await this.updatePaymentStatus(paymentIntentId, 'approved');
        await this.handleApprovedPayment({
          amount: paymentStatus.amount,
          metadata: paymentStatus.metadata
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error validando pago:', error);
      throw error;
    }
  }

  private async handleFailedPayment(paymentIntentId: string) {
    try {
      const movimientoData = {
        paymentId: paymentIntentId,
        simId: this.simId,
        userId: Number(this.transactionData?.userId),
        planName: this.planData.name,
        amount: this.monto,
        provider: 'STRIPE',
        transactionNumber: paymentIntentId,
        isFirstPost: this.transactionData?.isFirstPost || false,
        statusPago: 'noaprobado'
      };

      await firstValueFrom(this.authService.guardarMovimientoNoAprobado(movimientoData));
      // // console.log('Movimiento no aprobado guardado exitosamente');
    } catch (error) {
      console.error('Error al guardar movimiento no aprobado:', error);
      throw error;
    }
  }

  async verificarPago(paymentIntentId: string) {
    try {
      // Usar firstValueFrom para convertir Observable a Promise
      const paymentStatus: any = await firstValueFrom(
        this.stripeService.checkPaymentStatus(paymentIntentId)
      );

      // Ahora podemos acceder a las propiedades
      if (paymentStatus.status === 'succeeded') {
        await this.procesarPagoExitoso({
          amount: paymentStatus.amount,
          metadata: paymentStatus.metadata
        });
      }
    } catch (error) {
      console.error('Error al verificar pago:', error);
    }
  }

  private async procesarPagoExitoso(data: {
    amount: number;
    metadata?: any;
  }) {
    try {
      // // console.log('Pago exitoso:', data);
      // Implementa tu lógica de pago exitoso aquí
    } catch (error) {
      console.error('Error al procesar pago exitoso:', error);
    }
  }

  async verifyPayment(sessionId: string) {
    // // console.log('🔍 Iniciando verificación de pago Stripe:', sessionId);

    // Obtener los session_ids ya procesados
    const processedSessionIds = this.getProcessedSessionIds();
    // Verificar si el sessionId ya fue procesado
    if (processedSessionIds.includes(sessionId)) {
      // // console.log(`✅ El session_id ${sessionId} ya ha sido procesado previamente.`);
      return;
    }


    try {
      const paymentStatus = await firstValueFrom(
        this.stripeService.checkPaymentStatus(sessionId)
      );

      if (paymentStatus.status === 'succeeded') {
        // Actualizar el estado del pago en tu sistema
        // // console.log('Pago confirmado:', paymentStatus);
      } else {
        // // console.log('El pago aún no se ha completado:', paymentStatus.status);
      }
    } catch (error) {
      console.error('Error al verificar el pago:', error);
    }
  }

  /**
   * Función para obtener el ICCID usando simId
   * @param simId ID de la SIM
   */
  private async obtenerIccidPorSimId(simId: number): Promise<void> {
    try {
      const iccid = await firstValueFrom(this.getIccid(simId));
      if (iccid) {
        // // console.log('ICCID recuperado:', iccid);
        // Asignar el iccid a simDetails
        if (this.simDetails.length > 0) {
          this.simDetails[0].iccid = iccid;
        } else {
          // Si simDetails está vacío, recuperar la SIM nuevamente
          const sim = await firstValueFrom(this.simData.getApiCall<Sim>(`sims/${simId}`));
          this.simDetails = [sim];
        }
      } else {
        console.error('No se pudo recuperar el ICCID para simId:', simId);
      }
    } catch (error) {
      console.error('Error al obtener ICCID:', error);
    }
  }

  /**
   * Función que realiza la llamada HTTP para obtener el ICCID
   * @param simId ID de la SIM
   * @returns Observable<string> con el ICCID
   */
  private getIccid(simId: number): Observable<string> {
    const token = localStorage.getItem('authToken') || '';
    const httpOptions = {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      })
    };

    return this.http.get<{ iccid: string }>(`${environment.apiUrl}/sims/${simId}/iccid`, httpOptions).pipe(
      map(response => response.iccid),
      catchError(error => {
        console.error('Error al obtener ICCID desde el backend:', error);
        return throwError(() => new Error('No se pudo obtener el ICCID'));
      })
    );
  }

  private getProcessedSessionIds(): string[] {
    const processed = localStorage.getItem('processedSessionIds');
    return processed ? JSON.parse(processed) : [];
  }

  private addProcessedSessionId(sessionId: string): void {
    const processed = this.getProcessedSessionIds();
    processed.push(sessionId);
    localStorage.setItem('processedSessionIds', JSON.stringify(processed));
  }

  private getTransaction(sessionId: string): any {
    const transactions = localStorage.getItem('transactions');
    return transactions ? JSON.parse(transactions)[sessionId] : null;
  }

  private setTransaction(sessionId: string, data: any): void {
    const transactions = localStorage.getItem('transactions');
    const parsed = transactions ? JSON.parse(transactions) : {};
    parsed[sessionId] = data;
    localStorage.setItem('transactions', JSON.stringify(parsed));
  }

  private removeTransaction(sessionId: string): void {
    const transactions = localStorage.getItem('transactions');
    if (transactions) {
      const parsed = JSON.parse(transactions);
      delete parsed[sessionId];
      localStorage.setItem('transactions', JSON.stringify(parsed));
    }
  }

  displayProcessedSessionIds(): void {
    const processed = this.getProcessedSessionIds();
    // // console.log('✅ Session IDs Procesados:', processed);
    // Opcional: Asignar a una variable para mostrar en la plantilla
    this.processedSessionIds = processed;
  }

  // Método para obtener el session_id
  private getSessionId(): string | null {
    return localStorage.getItem('session_id');
  }

  // Método para limpiar el session_id
  private clearSessionId(): void {
    localStorage.removeItem('session_id');
    // Si el session_id está en la URL, también puedes limpiarlo
    this.removeSessionIdFromURL();
  }

  // Método para remover el session_id de la URL
  private removeSessionIdFromURL(): void {
    const url = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, url);
    // // console.log('🧹 session_id eliminado de la URL.');
  }
}
