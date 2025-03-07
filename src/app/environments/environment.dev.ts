//http://development-qasar-alb-1822586593.us-east-2.elb.amazonaws.com:5006

export const environment = {
  production: false,
  apiUrl: 'http://localhost:5006',
  stripePublicKey: 'pk_test_51QK1pBHSXtUd0XqZ3BFasRUBMMY05VrKCLMUNRcxsuR1BzHsNgDnzpY1PzqCNnHw2M0zmGgrDrQ32P12BFREoVWl00G6HtcS7W',

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
  SimsUrl: 'https://authconnectivity.qasar.app/api-auth/auth/singIn',
  apiUrlSimService: '',

  // Servicio legacy
  apibackerpUrl: 'http://development-qasar-alb-1822586593.us-east-2.elb.amazonaws.com:5004/api-auth',
};

// Función auxiliar para construir URLs completas



export const { apiUrl, apiUrlSimService } = environment;



