import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { recharge_plan } from '../../../core/models/plans.model';
import { RequestData, Articulo, PrecargaDatos, Payload } from '../../../core/models/mexPago.model';
//import { apiUrl } from '../routes';
import { Sim } from '../../../core/models/sim.model';
import { SimsDataService } from '../../../core/services/sims-data.service';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { EMPTY } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { NavigationExtras } from '@angular/router';
import { StripeService } from '../../../core/services/stripe.service';
import { firstValueFrom } from 'rxjs';
import { loadStripe } from '@stripe/stripe-js';
import { environment } from '../../../environments/environment';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';



@Component({
  standalone: true,
  imports: [

    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
  ],
  selector: 'app-line-details',
  templateUrl: './line-details.component.html',
  styleUrls: ['./line-details.component.css'],
  providers: [StripeService]
})
export class LineDetailsComponent implements OnInit {
  numeroTransaccion: string = '';
  numeroAutorizacion: string = '';
  errorMessage: string = '';
  isUser: boolean = false;

  private _unitName: string | null = null;

  get unitName(): string | null {
    return this._unitName || localStorage.getItem('unitName');
  }

  set unitName(value: string | null) {
    this._unitName = value;
    if (value) {
      localStorage.setItem('unitName', value);
    }
  }
  navigateToPayment() {
    const selectedPlan = this.plans[this.selectedOptionIndex];

    if (!selectedPlan) {
      console.error('No hay plan seleccionado');
      return;
    }
    // console.log('rechargeUserId', localStorage.getItem('rechargeUserId'))
    const rechargeUserId = localStorage.getItem('rechargeUserId');

    // Generar un número de transacción único
    const numeroTransaccion = this.generateUniqueTransactionId();

    // Guardar el ID en localStorage
    localStorage.setItem('currentUserId', this.Id.toString());


    const transactionData = {
      simId: this.simId,
      plan: selectedPlan,
      planName: selectedPlan.name,
      numeroTransaccion: numeroTransaccion, // Utilizar el número de transacción generado
      monto: selectedPlan.amount,
      userId: rechargeUserId,
      iccid: this.sims[0]?.iccid || '',
      isFirstPost: this.isFirstPost,
      unitName: this.unitName
    };

    // // console.log('Guardando datos de transacción en LocalStorage:', transactionData);
    localStorage.setItem('currentTransaction', JSON.stringify(transactionData));

    const navigationExtras: NavigationExtras = {
      queryParams: {
        simId: this.simId.toString(),
        monto: selectedPlan.amount.toString(),
        numeroTransaccion: this.numeroTransaccion,
        numeroAutorizacion: this.numeroAutorizacion,
        planId: selectedPlan.id.toString(),
        days: selectedPlan.days.toString(),
        planName: selectedPlan.name,
        userId: rechargeUserId,
        isFirstPost: this.isFirstPost.toString()
      },
      state: {
        simDetails: this.sims,
        planDetails: selectedPlan,
        userId: rechargeUserId,
        currentUserId: this.Id
      }
    };

    this.router.navigate(['/payment'], navigationExtras);
  }
  // Método para generar un ID único para la transacción
  generateUniqueTransactionId(): string {
    return 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }

  artsString: string[] = []
  loading = false;
  //unitName: string | null = null;
  unitNamelocal: string | null = null;
  name: string | null = null; // Añadir esta línea
  simId: number = 0; // Declarar simId como una propiedad de la clase
  userId: number = 0; // Declarar userId como una propiedad de la clase

  constructor(
    private route: ActivatedRoute,
    private simsData: SimsDataService,
    private authService: AuthService,
    private stripeService: StripeService,
    private router: Router) {
    // Intentar recuperar unitName del localStorage al iniciar
    const lastSimDetails = localStorage.getItem('lastSimDetails');
    if (lastSimDetails) {
      const details = JSON.parse(lastSimDetails);
      this.unitName = details.unitName || null;
    }
  }

  http = inject(HttpClient);
  plans: recharge_plan[] = [];
  articulos: Articulo[] = [];
  sims: Sim[] = [];
  sim: Sim | null = null;

  arts: string[] = [];
  // Nuevo array para almacenar los folios y los lineNumbers
  foliosYLineNumbers: { folio: string; }[] = [];
  idplan!: number;
  precargaDatos!: PrecargaDatos;
  requestMexPago!: RequestData;
  theadHidden: boolean = true;
  selectedOptionIndex: number = -1;
  unitname: string | null = null;
  //////////////////////////////////////////////////////////////////////////
  ///esto para traer e unse name en el banner
  userName!: string | null; // Definimos la propiedad userName aquí
  Id: number = 0;
  monto: number = 0; // Añade esta línea



  // Agregar nuevo campo para el método de pago
  selectedPaymentMethod: 'STRIPE' | 'MEXPAGO' = 'STRIPE';

  processing = false;
  stripe: any;
  elements: any;
  selectedPlan: any;
  requestPayment: {
    monto: number;
    articulos?: Array<{
      descripcion: string;
      monto: string;
    }>;
  } = {
      monto: 0,
      articulos: []
    };

  // Agregar la propiedad isFirstPost
  isFirstPost: boolean = false;

  // Definir la propiedad card
  private card: any;

  stripeError: boolean = false;

  planName: string = '';
  clientId: string = '';
  companyClient: string = '';
  simsarray: Sim[] = [];

  permission: string = "";
  isUserAuthorized: boolean = false;

  ngOnInit(): void {
    this.isUser = localStorage.getItem('isUser') ? localStorage.getItem('isUser') === 'true' : false;

    this.simsarray = JSON.parse(localStorage.getItem('simsarray') || '[]');
    // console.log('simsarray', this.simsarray)

      this.userName = localStorage.getItem("userName")
    // console.log('userName que esta en el local storage en ngOnInit', this.userName)
    this.recuperarDatosDesdeLocalStorage(); // Llamada a la función de recuperación

    // Suscribirse al selectedSim$ para obtener el selectedSimId
    this.simsData.selectedSim$.subscribe(simId => {
      if (simId !== null) {
        this.simId = simId;
        // // console.log('selectedSimId actualizado:', this.simId);
        // Aquí puedes cargar los detalles de la SIM si es necesario
        this.loadSimById(this.simId.toString());
      } else {
        // // console.log('No hay selectedSimId almacenado.');
        // Opcional: Manejar el caso donde no hay selectedSimId
        this.loadAllSims();
      }
    });

    //// // console.log('Client ID:', this.clientId);
    // // console.log('Unit Name:', this.unitName);
    // console.log('clientId', this.clientId)
    // console.log('companyClient', this.companyClient)
    this.clientId = localStorage.getItem('ID') || '';

    // this.companyClient = localStorage.getItem('companyClient') || '';
    // Agregar logs para verificar los queryParams
    this.route.queryParams.subscribe(params => {
      // // console.log('QueryParams recibidos:', params);

      const iccid = params['iccid'];
      this.simId = parseInt(params['simId']) || 0;
      this.userId = parseInt(params['userId']) || 0;
      this.unitName = params['unitname'];
      if (this.unitName) {
        localStorage.setItem('unitName', this.unitName);
       // console.log('unitName guardado en local storage', this.unitName)
      }
      // console.log('unitNamede params', this.unitName)

      this.isFirstPost = params['isFirstPost']
      this.clientId = params['clientId'] || this.clientId;
      this.companyClient = params['companyClient'] || this.companyClient;
      // console.log('clientId', this.clientId)
      // console.log('companyClient', this.companyClient)
      // Guardar los parámetros en localStorage como respaldo
      if (iccid && this.simId && this.userId && this.unitName) {
        // // console.log('Guardando datos de queryParams en localStorage');
        localStorage.setItem('lastSimDetails', JSON.stringify({
          iccid,
          simId: this.simId,
          userId: this.userId,
          unitName: this.unitName,
          isFirstPost: this.isFirstPost,
          clientId: this.userId,
          companyClient: this.companyClient
        }));
      }

      // Cargar los datos necesarios
      if (this.simId) {
        // // console.log('Cargando SIM con ID desde queryParams:', this.simId);
        this.loadSimById(this.simId.toString());
      } else {
        // // console.log('No se encontró simId en queryParams, buscando en fuentes alternativas');
        this.loadSimFromAlternativeSources();
      }
    });

    // Obtener parámetros de la URL y estado
    this.route.queryParams.pipe(
      switchMap(params => {
        const clientId = params['clientId'] || this.clientId;
        // // console.log('clientId recibido en queryParams:', clientId);
        const companyClient = params['companyClient'] || this.companyClient;
        // // console.log('companyClient recibido en queryParams:', companyClient);
        const urlSimId = params['simId'] ? parseInt(params['simId']) : null;
        const storedSimId = this.simsData.getSelectedSimId();
        this.simId = urlSimId || storedSimId || 0;

        if (this.simId) {
          return this.simsData.getApiCall<Sim>(`sims/${this.simId}`);
        }
        return EMPTY;
      })
    ).subscribe({
      next: (sim: Sim) => {
        this.sims = [sim];
        this.simsData.setSimDetails(this.sims);
        this.simsData.setSelectedSimId(sim.id);
        this.loadPlanDetails();
      },
      error: (error) => {
        console.error('Error al cargar la SIM:', error);
      }
    });

    // Recuperar el objeto SIM del estado de la ruta
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state && navigation.extras.state['clientId'] && navigation.extras.state['companyClient']) {
      const sim = navigation.extras.state['sim'] as Sim;
      // // console.log('SIM from state:', sim);
      this.clientId = navigation.extras.state['clientId'];
      this.companyClient = navigation.extras.state['companyClient'];
      // // console.log('clientId from state:', this.clientId);
      // // console.log('companyClient from state:', this.companyClient);
      // Aquí puedes usar el objeto SIM como necesites
    }



    // Recuperar userId y isFirstPost del estado de la ruta o localStorage
    this.userId = history.state.userId || this.Id;
    this.isFirstPost = history.state.isFirstPost || this.isFirstPost;
    // // console.log('userId del estado de la ruta:', this.userId);
    // // console.log('isFirstPost del estado de la ruta:', this.isFirstPost);

    //this.userName = localStorage.getItem("USERDATA")
    //this.Id = parseInt(localStorage.getItem("ID"))
    this.Id = parseInt(localStorage.getItem('ID') ?? "0")


    //console.log(this.Id, 'este es id')
    // console.log(this.unitName, 'este es unitName')
    // console.log(this.planName, 'este es planName')
    // console.log(this.userName, 'este es userName')
    //  console.log(this.username, 'este es username')
    // console.log(this.name, 'este es name')
    // const userData = JSON.parse(localStorage.getItem('USERDATA') || '{}');
    //this.userId = userData.id || null;


    /////////////////////////////////////////////////////////////////
    // Obtener el token de autenticación del almacenamiento local
    const token = localStorage.getItem('authToken');

    // Si hay un token, obtenemos los datos del usuario
    if (token) {

      this.authService.getuserprofile().subscribe(
        userData => {
          // Precarga los datos del usuario
         // console.log("userData", JSON.stringify(userData))
          this.precargaDatos = {
            // Verificar cada campo y asignar un valor por defecto si es necesario
            nombre: userData.name || this.userName || "Nombre",
            apPaterno: userData.apPaterno || "Apellido Paterno",
            apMaterno: userData.apMaterno || "Apellido Materno",
            correo: userData.email || "correo@ejemplo.com",
            celular: userData.celular || "6641234567"
          };

          // Extraer el valor de 'permission'
          this.permission = userData.permission || "";

          // // console.log("Estos son datos precargados", this.precargaDatos);
          // // console.log("Permiso del usuario:", this.permission);

       
        },
        error => {
          console.error('Error al obtener los datos del usuario', error);
          // Asignar valores predeterminados en caso de error
          this.precargaDatos = {
            nombre: "Nombre",
            apPaterno: "Apellido Paterno",
            apMaterno: "Apellido Materno",
            correo: "correo@ejemplo.com",
            celular: "6641234567"
          };
          this.permission = "";
          this.isUserAuthorized = false;
        }
      );
    }




    this.getPlans();

    // Recuperar los datos compartidos de SimsDataService
    // this.simsData.getSharedSims().subscribe(
    //   (sims: Sim[]) => {
    //     this.sims = sims.filter(sim => sim.id === this.simId);
    //     // // console.log('datos recuperados de sims lines details:', this.sims);
    //     const idParam = this.route.snapshot.queryParamMap.get('id');
    //     const name = this.route.snapshot.queryParamMap.get('name') ?? ''; // Asigna una cadena vacía si name es null
    //     const amount = this.route.snapshot.queryParamMap.get('amount');
    //     const days = this.route.snapshot.queryParamMap.get('days')

    //     // Obtener el simId de la ruta o del servicio SimsDataService
    //     const simIdParam = this.route.snapshot.queryParamMap.get('simId');
    //     // // console.log(simIdParam, 'esto es el simIdParam');
    //     this.simId = simIdParam ? parseInt(simIdParam) : sims[0]?.id || 0;

    //     if (idParam && amount && days) {
    //       this.plans = [{
    //         id: parseInt(idParam),
    //         name: name, // Ahora name siempre será una cadena
    //         amount: parseInt(amount),
    //         days: parseInt(days)
    //       }];
    //       this.selectedOptionIndex = 0
    //       console.log('PLANES')
    //       console.log(this.plans)
    //       this.mexPago()
    //     }
    //   },
    //   error => {
    //     console.error('Error al obtener los datos de los sims', error);
    //   }
    // );

    // Recuperar los datos compartidos de SimsDataService
    // Recuperar el ID de la SIM seleccionada desde localStorage
    const sharedSims = this.simsData.getSharedSims2().length > 0 ? this.simsData.getSharedSims2() : null;
    const selectedSimId = sharedSims ? sharedSims[0].id : localStorage.getItem('selectedSimId');

    if (selectedSimId) {
      this.simsData.getApiCall<Sim>(`sims/${selectedSimId}`).subscribe(
        (sim: Sim) => {
          this.sims = [sim];
          // // console.log('SIM recuperada:', this.sims);
          this.simId = sim.id;
          this.unitName = sim.name || '';
          this.loadPlanDetails();
          this.simsData.setSimId(sim.id.toString()); // Guardar el simId en el servicio
          // // console.log('simId establecido en line-details:', sim.id.toString()); // Añadir log para depuración

        },
        error => {
          console.error('Error al obtener la SIM seleccionada', error);
        }
      );
    } else {
      console.error('No se proporcionó un ID de SIM válido');
      this.loadSimById(this.simId.toString());
    }

    // Inicializar isFirstPost basado en los datos de la transacción
    // // console.log('🔍 Cargando datos de transacción desde localStorage');

    const currentTransaction = localStorage.getItem('currentTransaction');
    if (currentTransaction) {
      const transactionData = JSON.parse(currentTransaction);
      // // console.log('🔍 Datos de transacción recuperados:', transactionData);
      this.isFirstPost = transactionData.isFirstPost || false;
      // // console.log('isFirstPost recuperado de currentTransaction:', this.isFirstPost);
      this.unitName = transactionData.unitName || '';
      // // console.log('unitName recuperado de currentTransaction:', this.unitName);
    }

    // Inicializar la tarjeta si estás usando Stripe Elements
    this.initializeCard();

    // Obtener planName desde los parámetros de la ruta
    this.route.queryParams.subscribe(params => {
      this.planName = params['planName'] || 'Nombre del Plan no disponible';
    });

    // Recuperar username y clientId desde localStorage
  //  this.userName = localStorage.getItem('username');
    const storedClientId = localStorage.getItem('clientId');
    if (storedClientId) {
      this.clientId = storedClientId;
    }

  //  // // console.log('Username recuperado:', this.userName);
    // // console.log('ClientId recuperado:', this.clientId);
  }

  private loadSimFromAlternativeSources(): void {
    // // console.log('Buscando datos en fuentes alternativas');

    // 1. Primero intentar obtener del estado de navegación (más reciente)
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras.state) {
      const simData = navigation.extras.state['simDetails'];
      // // console.log('Datos encontrados en estado de navegación:', simData);
      if (simData && simData.length > 0) {
        this.sims = simData;
        this.simId = simData[0].id;
        this.unitName = simData[0].name || this.unitName;
        this.isFirstPost = simData[0].isFirstPost || false; // Asignar isFirstPost

        this.loadPlanDetails();
        return;
      }
    }

    // 2. Intentar obtener de lastSimDetails en localStorage
    const lastSimDetails = localStorage.getItem('lastSimDetails');
    if (lastSimDetails) {
      const details = JSON.parse(lastSimDetails);
      // // console.log('Datos encontrados en localStorage:', details);
      if (details.simId) {
        this.simId = details.simId;
        this.userId = details.userId;
        this.unitName = details.unitName || this.unitName;
        this.isFirstPost = details.isFirstPost || false; // Asignar isFirstPost
        this.loadSimById(this.simId.toString());
        return;
      }
    }

    // 3. Intentar obtener de currentTransaction
    const storedTransaction = localStorage.getItem('currentTransaction');
    if (storedTransaction) {
      const transactionData = JSON.parse(storedTransaction);
      // // console.log('Datos encontrados en currentTransaction:', transactionData);
      if (transactionData.simId) {
        this.simId = transactionData.simId;
        this.unitName = transactionData.username || this.unitName;
        this.isFirstPost = transactionData.isFirstPost // Asignar isFirstPost
        this.loadSimById(this.simId.toString());
        return;
      }
    }



    // // console.log('No se encontraron datos en ninguna fuente alternativa');
    // this.loadAllSims();   //esta es la linea que se debe comentar para que funcione el loadSimFromAlternativeSources
  }

  loadSimById(simId: string): void {
    // // console.log('Iniciando loadSimById con simId:', simId);

    if (simId) {
      this.simsData.getApiCall<Sim>(`sims/${simId}`).subscribe({
        next: (sim: Sim) => {
          if (!sim) {
            console.error('La SIM recibida es null');
            return;
          }

          if (!sim.iccid) {
            console.error('Error: La SIM obtenida no contiene ICCID.');
            alert('Error: La SIM obtenida no contiene ICCID.');
            return;
          }

          this.sims = [sim];
          // // console.log('SIM recuperada:', this.sims);
          this.simId = sim.id;
          this.unitName = this.unitName || sim.name || '';
          this.loadPlanDetails();

          // Guardar el simId en el servicio
          this.simsData.setSelectedSimId(sim.id);
        },
        error: (error) => {
          console.error('Error al obtener la SIM:', error);

          // Si falla, intentar usar los datos de queryParams directamente
          const lastDetails = localStorage.getItem('lastSimDetails');
          if (lastDetails) {
            const details = JSON.parse(lastDetails);
            this.simId = details.simId;
            this.unitName = details.unitName;
            this.isFirstPost = details.isFirstPost;
            console.log('Usando datos de respaldo:', details);
            this.loadPlanDetails();
          }
        }
      });
    } else {
      console.error('No se proporcionó un ID de SIM válido');
      this.loadSimFromAlternativeSources();
    }
  }

  loadAllSims(): void {
    this.simsData.getSharedSims().subscribe(
      (sims: Sim[]) => {
        if (sims.length > 0) {
          this.sims = sims;
          // // console.log('loadAllsims Datos recuperados de sims lines details:', this.sims);
          this.simId = this.sims[0].id;
          this.unitName = this.sims[0].name || '';

          // Guardar el simId del primer SIM en el servicio
          this.simsData.setSelectedSimId(this.simId);
        } else {
          // // console.log('No se encontraron SIMs');
          // Realizar una búsqueda por SIM si no se encuentran Sims compartidos
          this.loadSimById(this.simId.toString());
        }
        this.loadPlanDetails();
      },
      error => {
        console.error('Error al obtener los datos de los sims', error);
        // this.loadSimById();
      }
    );
  }


  loadPlanDetails() {
    const idParam = this.route.snapshot.queryParamMap.get('id');
    const name = this.route.snapshot.queryParamMap.get('name') ?? '';
    const amount = this.route.snapshot.queryParamMap.get('amount');
    const days = this.route.snapshot.queryParamMap.get('days');
    const isFirstPost = this.route.snapshot.queryParamMap.get('isFirstPost');
    if (idParam && amount && days) {
      this.plans = [{
        id: parseInt(idParam),
        name: name,
        amount: parseInt(amount),
        days: parseInt(days)
      }];
      this.selectedOptionIndex = 0;
      // // console.log('PLANES', this.plans);
      this.pagoRastreoGo();
    } else {
      // Cargar planes por defecto o mostrar un mensaje
      // // console.log('No se proporcionaron detalles del plan en la URL');
    }










    // this.sims = this.simsData.getSharedSims();
    // const idParam = this.route.snapshot.queryParamMap.get('id');
    // const name = this.route.snapshot.queryParamMap.get('name') ?? ''; // Asigna una cadena vacía si name es null
    // const amount = this.route.snapshot.queryParamMap.get('amount');
    // const days = this.route.snapshot.queryParamMap.get('days')

    // // Obtener el simId de la ruta o del servicio SimsDataService
    // const simIdParam = this.route.snapshot.queryParamMap.get('simId');
    // // // console.log(simIdParam, 'esto es el simIdParam');
    // this.simId = simIdParam ? parseInt(simIdParam) : this.simsData.getSharedSims()[0]?.id || 0;


    // if (idParam && amount && days) {
    //   this.plans = [{
    //     id: parseInt(idParam),
    //     name: name, // Ahora name siempre será una cadena
    //     amount: parseInt(amount),
    //     days: parseInt(days)
    //   }];
    //   this.selectedOptionIndex = 0
    //   console.log('PLANES')
    //   console.log(this.plans)
    //   this.mexPago()
    // }


  }
  /////////////////////////////prueba
  // Suponiendo que este es un método que modifica 'arts'
  updateArts(newArt: string) {
    // // console.log("este es el articulo", newArt);
    this.artsString.push(newArt);
    // // console.log("artsString después de push:", this.artsString);
    // this.arts.push(newArt);


    // Mover los console.log aquí
    // // console.log("Nuevo artículo agregado a artsString:", newArt);
    // // console.log("Nuevo artículo agregado a arts:", this.arts[this.arts.length - 1]);
    // // console.log("Nuevo artículo agregado a articulos:", this.articulos[this.articulos.length - 1]);
    // Actualizar artsString cada vez que cambie arts
    // this.artsString = this.arts.join(', '); ////esto es para que los alticulos salgan on formato si corchetes
  }
  ///////////////////////////////////////////////////////

  async getPlans() {

    const url = 'recharge-plans/'
    this.simsData.getApiCall<recharge_plan[]>(url).subscribe(
      (data) => {
        console.log(data)
        // Aquí, 'data' contendrá la lista de SIMs como se especifica en la anotación de tipo.
        this.plans = data
      },
      (error) => {
        alert(error.errorMessage)
      }
    );
  }
  // selectedOptionIndex: number = -1;

  selectOption(index: number): void {
    this.selectedOptionIndex = index;
    const selectedPlan = this.plans[index];

    // Almacenar el plan seleccionado en 'selectedPlan' para uso interno
    this.selectedPlan = selectedPlan;


    // Verificar que haya SIMs seleccionadas
    if (this.simsarray.length === 0) {
      alert('Por favor, selecciona al menos una SIM para recargar.');
      return;
    }
    // Calcular el monto total sumando los montos de todas las SIMs
    this.requestPayment.monto = this.simsarray.reduce((total, sim) => {
      return total + selectedPlan.amount;
    }, 0);


   // console.log(this.requestPayment.monto, 'esto es el monto')
    // Guardar el plan seleccionado en LocalStorage
    const planSeleccionado = {
      id: selectedPlan.id,
      name: selectedPlan.name,
      amount: selectedPlan.amount,
      days: selectedPlan.days
    };
    localStorage.setItem('selectedPlan', JSON.stringify(planSeleccionado));

    // Almacenar el plan seleccionado en 'currentTransaction' para mantener consistencia
    localStorage.setItem('currentTransaction', JSON.stringify({
      plan: selectedPlan,
      monto: selectedPlan.amount * this.simsarray.length,
      username: this.unitName,
      articulos: this.simsarray.map(sim => ({
        simId: sim.id,
        descripcion: `Recarga ${selectedPlan.days} días para SIM ${sim.iccid}`,
        monto: selectedPlan.amount.toString(),
        folio: this.foliosYLineNumbers,
        iccid: sim.iccid,
        unitName: sim.name,
        planName: selectedPlan.name
        
      })),
      isFirstPost: this.isFirstPost // Asegurarse de incluir 'isFirstPost'
    }));

     console.log('Plan seleccionado y almacenado en LocalStorage:', planSeleccionado);
  }


  callLogoutFromLines() {//para hacer loguth
    this.authService.logout();

  }


  getCurrentDateTimeForFolio(): string {
    const now = new Date();
    const year = now.getFullYear().toString().padStart(4, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Meses comienzan desde 0
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return day + month + year + hours + minutes + seconds;
  }

  // Método para generar el folio basado en la fecha y hora
  generateFolio(): string {
    // Obtener la fecha y hora en el formato deseado
    const dateTimeString = this.getCurrentDateTimeForFolio();
    // Generar el número de secuencia o identificador único (esto es un ejemplo simple)
    const sequenceNumber = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
    // Combinarlos para formar el folio
    return dateTimeString + sequenceNumber;
  }













  // requestMexPago!: RequestData;
  // theadHidden: boolean = true;

  /*mexPago() {
    if (this.selectedOptionIndex != -1) {
      let total: number = 0;
      const folio = this.generateFolio(); // Generar folio
      this.foliosYLineNumbers = []; // Reiniciar el array para los nuevos datos
      localStorage.setItem('selectedOptionIndex', this.selectedOptionIndex.toString());

      for (let sim of this.sims) {
        total += this.plans[this.selectedOptionIndex].amount;

        // Agregar el folio y el lineNumber al array
        this.foliosYLineNumbers.push({ folio });

        // Preparar artículos para MexPago
        const articulos = this.sims.map(sim => ({
          descripcion: `Recarga ${this.plans[this.selectedOptionIndex].days} días `,
          monto: this.plans[this.selectedOptionIndex].amount.toString()
        }));

        this.updateArts(` Recarga: ${this.plans[this.selectedOptionIndex].days} días, monto: ${this.plans[this.selectedOptionIndex].amount.toString()}$ `);
        this.arts.push(`{"descripcion": "Recarga ${this.plans[this.selectedOptionIndex].days} días ", "monto":"${this.plans[this.selectedOptionIndex].amount.toString()} "}`);

        this.articulos.push({
          descripcion: "Recarga " + this.plans[this.selectedOptionIndex].days + " días ",
          monto: this.plans[this.selectedOptionIndex].amount.toString()
        });
      }

      // Verificar que el array de artículos no esté vacío
      if (this.articulos.length === 0) {
        console.error('El array de artículos está vacío');
        alert('No se encontraron artículos para enviar.');
        return;
      }
      // Guardar el arreglo de foliosYLineNumbers en localStorage
      localStorage.setItem('foliosYLineNumbers', JSON.stringify(this.foliosYLineNumbers));

      const date = new Date();
      const payload: Payload = {
        articulos: {
          articulos: this.articulos,
        }
      };

      this.requestMexPago = {
        monto: total.toString(),
        noTransaccion: folio,
        llave: "eyJsbGF2ZSI6Ijg1OTdiNjk2LTc3YzgtNDU0ZC1hZTJmLWRhZWFmNzNmOGZhOCIsImlkT25saW5lIjoiNjFjYTUyZGQtYTM1Yi00YjNjLTlkZjctMDA4ZGYyZTBiZDE0In0=",
        fecha: date.toString(),
        articulos: payload,
        precargaDatos: this.precargaDatos,
        enviarCorreo: "false",
        infoComercio: "true",
        lenguaje: "es"
      };

      // Asegurarse de que el folio tenga un máximo de 25 dígitos
      this.requestMexPago.noTransaccion = folio.substring(0, 25);
      this.simsData.setPlanDetails(this.plans[this.selectedOptionIndex]);
      this.theadHidden = !this.theadHidden;

      // Obtener el token desde el local storage
      const token = localStorage.getItem('authToken') || '';

      let userId = this.route.snapshot.queryParams['userId'] || this.Id;

      if (this.isUser) {
        userId = this.Id;
      } else {
        userId = this.route.snapshot.queryParams['userId'];
      }

      const movimientoNoAprobado = {
        paymentId: folio,
        simId: this.sims[0]?.id || this.simId,
        userId: userId,
        planName: this.plans[this.selectedOptionIndex].name,
        amount: this.plans[this.selectedOptionIndex].amount,
        provider: this.selectedPaymentMethod,
        transactionNumber: folio,
        isFirstPost: this.isFirstPost,
        statusPago: 'noaprobado',
      };

      // Llamar al servicio para guardar el movimiento no aprobado
      this.authService.guardarMovimientoNoAprobado(movimientoNoAprobado).subscribe({
        next: response => {
          // Realizar la llamada a MexPago
          this.simsData.postApiCall('url-de-mexpago', this.requestMexPago).subscribe(
            (mexPagoResponse: any) => {
              this.numeroTransaccion = mexPagoResponse.numeroTransaccion;
              this.numeroAutorizacion = mexPagoResponse.numeroAutorizacion;
              this.navigateToPayment();
            },
            (error) => {
              console.error('Error en la llamada a MexPago:', error);
            }
          );
        },
        error: error => {
          console.error('Error al guardar el movimiento no aprobado:', error);
        }
      });

      // Verificar que 'iccid' esté presente
      if (!this.sims[0]?.iccid) {
        console.error('Error: ICCID está vacío en la SIM seleccionada.');
        return;
      }

      const transactionData = {
        simId: this.sims[0]?.id || this.simId,
        userId: localStorage.getItem('rechargeUserId') || this.userId || this.Id,
        plan: this.plans[this.selectedOptionIndex],
        numeroTransaccion: folio,
        monto: this.plans[this.selectedOptionIndex].amount,
        iccid: this.sims[0]?.iccid,
        username: localStorage.getItem('USERDATA'),
        articulos: this.articulos,
        isFirstPost: this.isFirstPost
      };

      localStorage.setItem('currentTransaction', JSON.stringify(transactionData));

      const navigationExtras: NavigationExtras = {
        queryParams: {
          simId: this.simId.toString(),
          monto: this.plans[this.selectedOptionIndex].amount.toString(),
          numeroTransaccion: folio,
          planId: this.plans[this.selectedOptionIndex].id.toString(),
          days: this.plans[this.selectedOptionIndex].days.toString(),
          planName: this.plans[this.selectedOptionIndex].name,
          isFirstPost: this.isFirstPost.toString()
        },
        state: {
          simDetails: this.sims,
          planDetails: this.plans[this.selectedOptionIndex],
          transactionData: transactionData
        }
      };

      this.router.navigate(['/payment'], navigationExtras);
    } else {
      alert('Es necesario seleccionar un Plan de recarga');
    }
  }*/






  

  pagoRastreoGo() {
    if (this.selectedOptionIndex != -1) {
      let total: number = 0;
      const folio = this.generateFolio(); // Generar folio
      this.foliosYLineNumbers = []; // Reiniciar el array para los nuevos datos
      localStorage.setItem('selectedOptionIndex', this.selectedOptionIndex.toString());

      // // console.log("sims:", this.sims);
      // // console.log("plans:", this.plans);
      // // console.log("simsarray:", this.simsarray);

      // Log de datos iniciales
      console.log('📊 Datos iniciales:', {
    //    folio,
        total,
        selectedPlan: this.plans[this.selectedOptionIndex],
        sims: this.simsarray
      });

      for (let sim of this.simsarray) {
        total += this.plans[this.selectedOptionIndex].amount;


        // Agregar el folio y el lineNumber al array
        this.foliosYLineNumbers.push({ folio });

        // Preparar artículos para MexPago
        const articulos = this.simsarray.map(sim => ({
          descripcion: `Recarga ${this.plans[this.selectedOptionIndex].days} días `,
          monto: this.plans[this.selectedOptionIndex].amount.toString()
        }));

        // // console.log('🛍️ Artículos preparados:', articulos);


        this.updateArts(` Recarga: ${this.plans[this.selectedOptionIndex].days} días, monto: ${this.plans[this.selectedOptionIndex].amount.toString()}$ `);
        this.arts.push(`{"descripcion": "Recarga ${this.plans[this.selectedOptionIndex].days} días ", "monto":"${this.plans[this.selectedOptionIndex].amount.toString()} "}`);

        this.articulos.push({
          descripcion: "Recarga " + this.plans[this.selectedOptionIndex].days + " días ",
          monto: this.plans[this.selectedOptionIndex].amount.toString()
        });
      }

      // Verificar que el array de artículos no esté vacío
      if (this.articulos.length === 0) {
        console.error('El array de artículos está vacío');
        alert('No se encontraron artículos para enviar.');
        return;
      }
      // Guardar el arreglo de foliosYLineNumbers en localStorage
      localStorage.setItem('foliosYLineNumbers', JSON.stringify(this.foliosYLineNumbers));

      const date = new Date();
      const payload: Payload = {
        articulos: {
          articulos: this.articulos,
        }
      };

      this.requestMexPago = {
        monto: total.toString(),
        noTransaccion: folio,
        //noTransaccion: folio.toString(),
        llave: "eyJsbGF2ZSI6Ijg1OTdiNjk2LTc3YzgtNDU0ZC1hZTJmLWRhZWFmNzNmOGZhOCIsImlkT25saW5lIjoiNjFjYTUyZGQtYTM1Yi00YjNjLTlkZjctMDA4ZGYyZTBiZDE0In0=",
        fecha: date.toString(),
        articulos: payload,
        precargaDatos: this.precargaDatos,
        enviarCorreo: "false",
        infoComercio: "true",
        lenguaje: "es"
      };

      // Asegurarse de que el folio tenga un máximo de 25 dígitos
      this.requestMexPago.noTransaccion = folio.substring(0, 25);
      this.simsData.setPlanDetails(this.plans[this.selectedOptionIndex]);
      this.theadHidden = !this.theadHidden;

      // Obtener el token desde el local storage
      const token = localStorage.getItem('authToken') || '';

    //  console.log('Datos a enviar:', {
    //    paymentId: folio,
    //    simId: this.sims[0]?.id || this.simId, // Obtener el simId de la ruta o del servicio SimsDataService
    //    userId: this.route.snapshot.queryParams['userId'] || this.userId || this.Id, // Primero buscar en queryParams, luego userId, finalmente Id
    //    planName: this.plans[this.selectedOptionIndex].name,
    //    rechargePlanId: this.plans[this.selectedOptionIndex].id,
    //    days: this.plans[this.selectedOptionIndex].days,
    //    transactionNumber: folio.toString(),
    //    statusPago: 'noaprobado',
    //    isFirstPost: this.isFirstPost,
    //    simsarray: this.simsarray,
    //    userType: this.permission
      //});


    //  console.log(this.route.snapshot.queryParams['userId'], 'esto es el userId params')
    //  console.log(Number(localStorage.getItem('rechargeUserId')), 'esto es el userId local storage')
    //  console.log(this.userId, 'esto es el userId directo userid')
    //  console.log(this.Id, 'esto es el Id directo id')
      // Preparar datos para guardar como no aprobado

      let userId = this.route.snapshot.queryParams['userId'] || this.Id;

      if (this.isUser) {
        userId = this.Id;
      } else {
        userId = this.route.snapshot.queryParams['userId'];
      }

      const movimientoNoAprobado = {
        paymentId: folio,
        simId: this.sims[0]?.id || this.simId,
        userId: userId, //this.route.snapshot.queryParams['userId'], // || Number(localStorage.getItem('rechargeUserId')) || this.userId || this.Id,
        planName: this.plans[this.selectedOptionIndex].name,
        amount: this.plans[this.selectedOptionIndex].amount,
        provider: this.selectedPaymentMethod,
        transactionNumber: folio,
        isFirstPost: this.isFirstPost,
        statusPago: 'noaprobado',
        simsarray: this.simsarray,
        permission: this.permission
      };
      //console.log(movimientoNoAprobado, 'esto es movimiento no aprobado')

      // Llamar al servicio para guardar el movimiento no aprobado
      this.authService.guardarMovimientoNoAprobado(movimientoNoAprobado).subscribe({
        next: response => {
          setTimeout(() => {
            this.numeroTransaccion = '';
            this.numeroAutorizacion = '';
            this.navigateToPayment(); 
          }, 999999999); // 5 segundos de retraso antes de la redirección
        },
        error: error => {
          console.error('Error al guardar el movimiento no aprobado:', error);
        }
      });

      // Verificar que 'iccid' esté presente
      if (!this.sims[0]?.iccid) {
        console.error('Error: ICCID está vacío en la SIM seleccionada.');
        // alert('Error: ICCID no está disponible para la SIM seleccionada.');
        return;
      }

      const transactionData = {
        simId: this.sims[0]?.id || this.simId,
        userId: localStorage.getItem('rechargeUserId') || this.userId || this.Id,
        plan: this.plans[this.selectedOptionIndex],
        numeroTransaccion: folio,
        monto: this.plans[this.selectedOptionIndex].amount,
        iccid: this.sims[0]?.iccid,  // Asegúrate de incluir 'iccid'
        username: localStorage.getItem('USERDATA'),
        articulos: this.articulos,
        isFirstPost: this.isFirstPost,
        permission: this.permission
      };

      // Log para verificar 'iccid'
       console.log('💾 Datos de transacción a guardar:', transactionData);

      localStorage.setItem('currentTransaction', JSON.stringify(transactionData));

      // Modificar navigationExtras para incluir todos los datos necesarios
      const navigationExtras: NavigationExtras = {
        queryParams: {
          simId: this.simId.toString(),
          monto: this.plans[this.selectedOptionIndex].amount.toString(),
          numeroTransaccion: folio,
          planId: this.plans[this.selectedOptionIndex].id.toString(),
          days: this.plans[this.selectedOptionIndex].days.toString(),
          planName: this.plans[this.selectedOptionIndex].name,
          isFirstPost: this.isFirstPost.toString(),
          permission: this.permission
        },
        state: {
          simDetails: this.sims,
          planDetails: this.plans[this.selectedOptionIndex],
          transactionData: transactionData
        }
      };

      this.router.navigate(['/payment'], navigationExtras);
    } else {
      alert('Es necesario seleccionar un Plan de recarga');
    }
  }

  // Modificar el método mexPago para manejar múltiples proveedores
  async processPayment() {
    if (this.selectedOptionIndex != -1) {
      const folio = this.generateFolio();
      const selectedPlan = this.plans[this.selectedOptionIndex];
      const userId = Number(localStorage.getItem('rechargeUserId')) || this.userId;

      // Crear movimiento no aprobado con todos los campos requeridos
      const movimientoNoAprobado = {
        paymentId: folio,
        simId: this.simId,
        userId: userId,
        planName: selectedPlan.name,
        amount: selectedPlan.amount,
        provider: this.selectedPaymentMethod,
        transactionNumber: folio,
        isFirstPost: this.isFirstPost,
        statusPago: 'noaprobado',
        rechargePlanId: selectedPlan.id,
        permission: this.permission
      };

      try {
        // Guardar movimiento inicial
        await this.authService.guardarMovimientoNoAprobado(movimientoNoAprobado).toPromise();

        // Resto del código...
        const paymentData = {
          provider: this.selectedPaymentMethod,
          amount: selectedPlan.amount,
          simId: this.simId,
          userId: userId,
          planName: selectedPlan.name,
          isFirstPost: this.isFirstPost,
          folio: folio,
          currency: 'mxn',
          metadata: {
            planId: selectedPlan.id,
            folio: folio,
            simId: this.simId,
            userId: userId,
            planName: selectedPlan.name,
            isFirstPost: this.isFirstPost,
            currency: 'mxn',
            metadata: {
              planId: selectedPlan.id,
              transactionNumber: folio
            },
            permission: this.permission
          }
        };

        // Continuar con el procesamiento del pago...
      } catch (error) {
        console.error('Error al guardar movimiento no aprobado:', error);
        throw error;
      }
    }
  }


  async processPayment2() {
    if (this.selectedOptionIndex != -1) {
      const folio = this.generateFolio();
      const selectedPlan = this.plans[this.selectedOptionIndex];
      const userId = Number(localStorage.getItem('rechargeUserId')) || this.userId;

      // Crear movimiento no aprobado con todos los campos requeridos
      const movimientoNoAprobado = {
        paymentId: folio,
        simId: this.simId,
        userId: userId,
        planName: selectedPlan.name,
        amount: selectedPlan.amount,
        provider: this.selectedPaymentMethod,
        transactionNumber: folio,
        isFirstPost: this.isFirstPost,
        statusPago: 'noaprobado',
        rechargePlanId: selectedPlan.id,
        permission: this.permission
      };

      try {
        // Guardar movimiento inicial
        await this.authService.guardarMovimientoNoAprobado(movimientoNoAprobado).toPromise();

        // Resto del código...
        const paymentData = {
          provider: this.selectedPaymentMethod,
          amount: selectedPlan.amount,
          simId: this.simId,
          userId: userId,
          planName: selectedPlan.name,
          isFirstPost: this.isFirstPost,
          folio: folio,
          currency: 'mxn',
          metadata: {
            planId: selectedPlan.id,
            folio: folio,
            simId: this.simId,
            userId: userId,
            planName: selectedPlan.name,
            isFirstPost: this.isFirstPost,
            currency: 'mxn',
            metadata: {
              planId: selectedPlan.id,
              transactionNumber: folio
            },
            permission: this.permission
          }
        };

        // Continuar con el procesamiento del pago...
      } catch (error) {
        console.error('Error al guardar movimiento no aprobado:', error);
        throw error;
      }
    }
  }

  async processStripePayment2() {
    if (this.processing) return;

    this.processing = true;
     console.log('LineDetails: Iniciando procesamiento de pago con Stripe');

    try {
      // Validar plan seleccionado
      if (this.selectedOptionIndex === -1 || !this.plans[this.selectedOptionIndex]) {
        throw new Error('Por favor selecciona un plan válido');
      }

      const selectedPlan = this.plans[this.selectedOptionIndex];

      // Obtener datos de la ruta
      const routeParams = this.route.snapshot.queryParams;
      // // console.log('Datos de la ruta:', routeParams);

      // Validación específica del monto
      if (!this.requestPayment.monto || isNaN(this.requestPayment.monto) || this.requestPayment.monto <= 0) {
        console.error('Monto inválido:', this.requestPayment.monto);
        throw new Error('El monto del plan no es válido');
      }

      // Convertir el monto a centavos y asegurar que sea un entero
      const amountInCents = Math.round(this.requestPayment.monto * 100);
     console.log('Monto calculado:', {
       original: this.requestPayment.monto,
       inCents: amountInCents
     });

      if (!amountInCents || amountInCents <= 0) {
        throw new Error(`Monto inválido: ${this.requestPayment.monto}`);
      }

      // Obtener datos de la SIM desde múltiples fuentes
      const simData = {
        id: this.simsarray[0]?.id || this.simId,
        iccid: this.simsarray[0]?.iccid || routeParams['iccid'] || '',
        name: this.unitName || routeParams['unitname'] || '',
        //  lineNumber: this.sims?.[0]?.lineNumber || routeParams['lineNumber'] || '',
        clientId: localStorage.getItem('clientId'),
        companyClient: localStorage.getItem('companyClient')
      };
     console.log(simData, 'esto es simData de processStripePayment2')
      // Obtener userId desde múltiples fuentes
      const userId = parseInt(routeParams['userId']) || this.Id ||
        parseInt(localStorage.getItem('ID') || '0') ||
        parseInt(localStorage.getItem('rechargeUserId') || '0');



      // Log detallado de todos los datos relevantes
    //  console.log('Datos completos para el pago:', {
        // Datos del Plan
        //plan: {
        //  id: selectedPlan.id,
        //  name: selectedPlan.name,
        //  amount: selectedPlan.amount,
        //  amountInCents,
        //  days: selectedPlan.days
        //},
        // Datos de la SIM
        //sim: this.simsarray.map(sim => ({
        //  id: sim.id,
        //  iccid: sim.iccid, 
        //  name: sim.name,
        //  // lineNumber: sim.lineNumber,
        //  clientId: simData.clientId,
        //  companyClient: simData.companyClient
        //})),
        // Datos del Usuario
        //user: {
        //  id: userId,
        //  storedId: this.Id,
        //  localStorageId: localStorage.getItem('ID'),
        //  rechargeUserId: localStorage.getItem('rechargeUserId')

        //},
        //rechargemovement: {
        //  transactionNumber: this.foliosYLineNumbers[0].folio
        //},

        // Datos de la Ruta
        //routeParams,
        // Datos adicionales
        //additional: {
        //  clientId: localStorage.getItem('clientId'),
        //  authToken: !!localStorage.getItem('authToken')
        //}
      //});

      const metadata = this.simsarray.map(sim => ({
        simId: sim.id.toString(),
        planId: selectedPlan.id.toString(), 
        userId: userId.toString(),
        iccid: sim.iccid,
        planDays: selectedPlan.days.toString(),
        originalAmount: selectedPlan.amount.toString(),
        simName: sim.name || '',
        transactionNumber: this.foliosYLineNumbers[0].folio || ''
      }));
     console.log(metadata, 'esto es metadata de processStripePayment2')
      const productdata = this.simsarray.map(sim => ({
        name: `${selectedPlan.name || 'Plan de Recarga'} - ${sim.name || 'Línea'}`,
        description: `Recarga ${selectedPlan.days} días`
      }));
     console.log(productdata, 'esto es productdata de processStripePayment2')

      const items = this.simsarray.map(sim => ({
        price_data: {
          currency: 'mxn',
          unit_amount: selectedPlan.amount, // Asegurarse de que sea un número
          product_data: {
            name: `${selectedPlan.name || 'Plan de Recarga'} - ${sim.name || 'Línea'}`,
            description: `Recarga ${selectedPlan.days} días`,
            metadata: {
              simId: sim.id,
              iccid: sim.iccid,
              simName: sim.name,
              amount: selectedPlan.amount
            }

          }
        },
        quantity: 1
      }));
     console.log(items, 'esto es items de processStripePayment2')
      // Preparar datos para el checkout con la estructura específica de Stripe
   

      // Crear un objeto para almacenar la información de las SIMs
    const simsMetadata = {
    };
    // Agregar cada SIM al objeto de metadata
    for (let i = 0; i < this.simsarray.length; i++) {
      const sim = this.simsarray[i];
      (simsMetadata as Record<string, string>)[`sim_${i + 1}`] = JSON.stringify({
        simId: sim.id,
        iccid: sim.iccid,
        simName: sim.name,
        amount: selectedPlan.amount
      });
    }
    // Crear el objeto final de metadata
    const metadatafinal = {
      planId: selectedPlan.id,
      planDays: selectedPlan.days,
      planName: selectedPlan.name,
      transactionNumber: this.foliosYLineNumbers[0].folio,
      totalAmount: this.requestPayment.monto,
      simsCount: this.simsarray.length,
     // ...simsMetadata
    };
    // Crear el objeto final de metadata
    const checkoutData = {
      metadata: metadatafinal,
      line_items: items,
    };

      // Validación adicional
      if (isNaN(checkoutData.line_items[0].price_data.unit_amount)) {
        throw new Error(`Monto inválido: ${selectedPlan.amount}`);
      }

  //    console.log('Verificación final del monto:', {
  //      original: selectedPlan.amount,
  //      finalAmount: checkoutData.line_items[0].price_data.unit_amount,
  //      isNumber: typeof checkoutData.line_items[0].price_data.unit_amount === 'number',
  //      isInteger: Number.isInteger(checkoutData.line_items[0].price_data.unit_amount)
  //    });

      // // console.log('Datos preparados para Stripe:', JSON.stringify(checkoutData, null, 2));

      const response = await firstValueFrom(
        this.stripeService.redirectToCheckout(checkoutData)
      ).catch(error => {
        console.error('Error detallado en la llamada a Stripe:', {
          error,
          message: error.message,
          status: error.status,
          response: error.error
        });
        throw error;
      });

      // // console.log('✅ Respuesta de Stripe recibida:', JSON.stringify(response, null, 2));

      if (!response || !response.id) {
        throw new Error('No se recibió una respuesta válida del servidor de Stripe');
      }


      const sessionId = response.id;
      // // console.log('🔑 session_id generado:', sessionId);

      // Preparar datos de la transacción
      const transactionData = this.simsarray.map(simData => ({
        simId: simData.id,
        planId: selectedPlan.id,
        userId: userId,
        monto: selectedPlan.amount,
        iccid: simData.iccid,
        planName: selectedPlan.name,
        simName: simData.name,
        isFirstPost: this.isFirstPost,
        transactionNumber: this.foliosYLineNumbers
      }));
    //  console.log(transactionData, 'esto es transactionData de line details')
      this.setTransaction(sessionId, transactionData);
      // // console.log('🗃 Transacción guardada para session_id:', sessionId);

      localStorage.setItem('session_id', sessionId);
      // // console.log('🔒 session_id guardado en localStorage.');

      const stripe = await loadStripe(environment.stripePublicKey);
      if (!stripe) {
        throw new Error('No se pudo inicializar Stripe');
      }

      const result = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (result.error) {
        console.error('❌ Error en redirectToCheckout:', result.error);
        throw new Error(result.error.message);
      }

    } catch (error: any) {
      console.error('❌ LineDetails: Error en processStripePayment', {
        error,
        message: error.message,
        stack: error.stack
      });
      // Mostrar el error en la interfaz de usuario
      this.errorMessage = `Error al procesar el pago: ${error.message || 'Por favor, intenta nuevamente.'}`;
      alert(this.errorMessage);
    } finally {
      this.processing = false;
      // // console.log('⏳ Proceso de pago finalizado.');
    }
  }


  async processStripePayment() {
    if (this.processing) return;

    this.processing = true;
    // // console.log('LineDetails: Iniciando procesamiento de pago con Stripe');

    try {
      // Validar plan seleccionado
      if (this.selectedOptionIndex === -1 || !this.plans[this.selectedOptionIndex]) {
        throw new Error('Por favor selecciona un plan válido');
      }

      const selectedPlan = this.plans[this.selectedOptionIndex];

      // Obtener datos de la ruta
      const routeParams = this.route.snapshot.queryParams;
      // // console.log('Datos de la ruta:', routeParams);

      // Validación específica del monto
      if (!selectedPlan.amount || isNaN(selectedPlan.amount) || selectedPlan.amount <= 0) {
        console.error('Monto inválido:', selectedPlan.amount);
        throw new Error('El monto del plan no es válido');
      }

      // Convertir el monto a centavos y asegurar que sea un entero
      const amountInCents = Math.round(selectedPlan.amount * 100);
     // console.log('Monto calculado:', {
     //   original: selectedPlan.amount,
     //   inCents: amountInCents
     // });

      if (!amountInCents || amountInCents <= 0) {
        throw new Error(`Monto inválido: ${selectedPlan.amount}`);
      }

      // Obtener datos de la SIM desde múltiples fuentes
      const simData = {
        id: this.simId || parseInt(routeParams['simId']) || 0,
        iccid: this.sims?.[0]?.iccid || routeParams['iccid'] || '',
        name: this.unitName || routeParams['unitname'] || '',
        //  lineNumber: this.sims?.[0]?.lineNumber || routeParams['lineNumber'] || '',
        clientId: localStorage.getItem('clientId'),
        companyClient: localStorage.getItem('companyClient')
      };

      // Obtener userId desde múltiples fuentes
      const userId = parseInt(routeParams['userId']) || this.Id ||
        parseInt(localStorage.getItem('ID') || '0') ||
        parseInt(localStorage.getItem('rechargeUserId') || '0');



      // Log detallado de todos los datos relevantes
      //console.log('Datos completos para el pago:', {
        // Datos del Plan
       // plan: {
       //   id: selectedPlan.id,
       //   name: selectedPlan.name,
       //   amount: selectedPlan.amount,
       //   amountInCents,
       //   days: selectedPlan.days
       // },
        // Datos de la SIM
       // sim: {
       //   id: simData.id,
       //   iccid: simData.iccid,
       //   name: simData.name,
       //   // lineNumber: simData.lineNumber,
       //   clientId: simData.clientId,
       //   companyClient: simData.companyClient
       // },
        // Datos del Usuario
        //user: {
        //  id: userId,
        //  storedId: this.Id,
        //  localStorageId: localStorage.getItem('ID'),
        //  rechargeUserId: localStorage.getItem('rechargeUserId')

        //},
        //rechargemovement: {
        //  transactionNumber: this.foliosYLineNumbers[0].folio
        //},

        // Datos de la Ruta
        //routeParams,
        // Datos adicionales
        //additional: {
        //  clientId: localStorage.getItem('clientId'),
        //  authToken: !!localStorage.getItem('authToken')
        //}
      //});

      // Preparar datos para el checkout con la estructura específica de Stripe
      const checkoutData = {
        line_items: [{
          price_data: {
            currency: 'mxn',
            unit_amount: Number(selectedPlan.amount), // Asegurarse de que sea un número
            product_data: {
              name: `${selectedPlan.name || 'Plan de Recarga'} - ${simData.name || 'Línea'}`,
              description: `Recarga ${selectedPlan.days} días`
            }
          },
          quantity: 1
        }],
        metadata: {
          simId: simData.id.toString(),
          planId: selectedPlan.id.toString(),
          userId: userId.toString(),
          iccid: simData.iccid,
          planDays: selectedPlan.days.toString(),
          originalAmount: selectedPlan.amount.toString(),
          //  lineNumber: simData.lineNumber || '',
          simName: simData.name || '',
          transactionNumber: this.foliosYLineNumbers[0].folio || '',

        }
      };

      // Validación adicional
      if (isNaN(checkoutData.line_items[0].price_data.unit_amount)) {
        throw new Error(`Monto inválido: ${selectedPlan.amount}`);
      }

      //console.log('Verificación final del monto:', {
      //  original: selectedPlan.amount,
      //  finalAmount: checkoutData.line_items[0].price_data.unit_amount,
      //  isNumber: typeof checkoutData.line_items[0].price_data.unit_amount === 'number',
      //  isInteger: Number.isInteger(checkoutData.line_items[0].price_data.unit_amount)
      //});

      // // console.log('Datos preparados para Stripe:', JSON.stringify(checkoutData, null, 2));

      const response = await firstValueFrom(
        this.stripeService.redirectToCheckout(checkoutData)
      ).catch(error => {
        console.error('Error detallado en la llamada a Stripe:', {
          error,
          message: error.message,
          status: error.status,
          response: error.error
        });
        throw error;
      });

      // // console.log('✅ Respuesta de Stripe recibida:', JSON.stringify(response, null, 2));

      if (!response || !response.id) {
        throw new Error('No se recibió una respuesta válida del servidor de Stripe');
      }


      const sessionId = response.id;
      // // console.log('🔑 session_id generado:', sessionId);

      // Preparar datos de la transacción
      const transactionData = {
        simId: simData.id,
        planId: selectedPlan.id,
        userId: userId,
        monto: selectedPlan.amount,
        iccid: simData.iccid,
        planName: selectedPlan.name,
        //  lineNumber: simData.lineNumber,
        simName: simData.name,
        isFirstPost: this.isFirstPost,
        transactionNumber: this.foliosYLineNumbers
      };

      this.setTransaction(sessionId, transactionData);
      // // console.log('🗃 Transacción guardada para session_id:', sessionId);

      localStorage.setItem('session_id', sessionId);
      // // console.log('🔒 session_id guardado en localStorage.');

      const stripe = await loadStripe(environment.stripePublicKey);
      if (!stripe) {
        throw new Error('No se pudo inicializar Stripe');
      }

      const result = await stripe.redirectToCheckout({
        sessionId: sessionId
      });

      if (result.error) {
        console.error('❌ Error en redirectToCheckout:', result.error);
        throw new Error(result.error.message);
      }

    } catch (error: any) {
      console.error('❌ LineDetails: Error en processStripePayment', {
        error,
        message: error.message,
        stack: error.stack
      });
      // Mostrar el error en la interfaz de usuario
      this.errorMessage = `Error al procesar el pago: ${error.message || 'Por favor, intenta nuevamente.'}`;
      alert(this.errorMessage);
    } finally {
      this.processing = false;
      // // console.log('⏳ Proceso de pago finalizado.');
    }
  }

  // Método para actualizar los datos de la tarjeta
  updateCard(cardData: any) {
    this.card = cardData;
  }

  // Inicializar la tarjeta si estás usando Stripe Elements
  private initializeCard() {
    // Aquí inicializas la tarjeta según tu implementación
    // Por ejemplo, si usas Stripe Elements:
    this.card = {
      number: '',
      exp_month: '',
      exp_year: '',
      cvc: ''
    };
  }

  // Método para obtener los session_ids procesados
  private getProcessedSessionIds(): string[] {
    const processed = localStorage.getItem('processedSessionIds');
    return processed ? JSON.parse(processed) : [];
  }

  // Método para agregar un session_id a los procesados
  private addProcessedSessionId(sessionId: string): void {
    const processed = this.getProcessedSessionIds();
    processed.push(sessionId);
    localStorage.setItem('processedSessionIds', JSON.stringify(processed));
  }

  // Método para obtener una transacción específica
  private getTransaction(sessionId: string): any {
    const transactions = localStorage.getItem('transactions');
    return transactions ? JSON.parse(transactions)[sessionId] : null;
  }

  // Método para guardar una transacción asociada a un session_id
  private setTransaction(sessionId: string, data: any): void {
    const transactions = localStorage.getItem('transactions');
    const parsed = transactions ? JSON.parse(transactions) : {};
    parsed[sessionId] = data;
    localStorage.setItem('transactions', JSON.stringify(parsed));
  }

  // Método para eliminar una transacción específica
  private removeTransaction(sessionId: string): void {
    const transactions = localStorage.getItem('transactions');
    if (transactions) {
      const parsed = JSON.parse(transactions);
      delete parsed[sessionId];
      localStorage.setItem('transactions', JSON.stringify(parsed));
    }
  }
  /**
   * Recupera los datos almacenados en localStorage y los asigna a las propiedades del componente.
   * Solo actúa si existen datos previamente guardados.
   */
  private recuperarDatosDesdeLocalStorage(): void {
    const transactionData = localStorage.getItem('currentTransaction');
    if (transactionData) {
      const datos = JSON.parse(transactionData);
       console.log('🔍 Datos recuperados desde localStorage:', datos);
      

      // Asignar los datos recuperados a las propiedades correspondientes
      this.simId = datos.simId || this.simId;
      // console.log(this.simId, 'este es simId desde lines')
      this.userId = parseInt(datos.userId) || this.userId;
      // console.log(this.userId, 'este es userId que  desde lines')
      this.unitName = datos.unitName || this.unitName;
      // console.log(this.unitName, 'este es unitName desde lines')
      this.isFirstPost = datos.isFirstPost || this.isFirstPost;
      this.name = datos.name || this.name;
      // console.log(this.name, 'este es name desde lines')
      this.foliosYLineNumbers = datos.foliosYLineNumbers || this.foliosYLineNumbers;
      // console.log(this.foliosYLineNumbers, 'este es foliosYLineNumbers desde lines')



      // Opcional: Navegar a la página de pago automáticamente
      // this.navigateToPayment();
    } else {
      // // console.log('📄 No se encontraron datos en localStorage para "currentTransaction".');
    }
  }

  // Método para seleccionar una SIM
  seleccionarSim(simId: number): void {
    this.simsData.setSelectedSimId(simId);
    // Otros procesos asociados a la selección de SIM
  }

}





