export const environment = {
  production: true,
  apiUrl: '',

  stripePublicKey: '',

  
  loginURL: '/auth/login',
  profileURL: '/auth/profile',
  PermisosURL: '/auth/profile',
  URLpermission: '/permissions',
  
  // Usuarios y clientes
  datosURL: '/users',
  apiBackUrluser: '/users',
  apiBackUrlclientesrastreogo: 'clients',
  clienteiccidUrl: '/client-iccids',
  clienteiccidUrlLines: 'client-iccids',
  apibackurlvalidacion: '/clients',
  clienteiccidUrl2: 'client-iccids',
  
  // Solicitudes y direcciones
  solicitudesUrl: '/client-registration-requests',
  apidireccionesUrl: '/addresses',
  apidatosfiscalesUrl: '/fiscal_details',
  apiSolicitudUrl: '/sim-requests',
  
  
  // Otros servicios
  apiRechargePlansMovementsUrl: '/recharge_plan_movements',
  apiSimsUrl: '/sims',

  // Servicios externos (mantener URL completa)
  SimsUrl: '',
  apiUrlSimService: '',

  // Servicio legacy
  apibackerpUrl: 'http://development-qasar-alb-1822586593.us-east-2.elb.amazonaws.com:5004/api-auth',
};

// Función auxiliar para construir URLs completas



export const { apiUrl, apiUrlSimService } = environment;



