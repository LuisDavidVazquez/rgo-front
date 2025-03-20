export const environment = {
  production: false,
  stripePublicKey: 'pk_test_51QK1pBHSXtUd0XqZ3BFasRUBMMY05VrKCLMUNRcxsuR1BzHsNgDnzpY1PzqCNnHw2M0zmGgrDrQ32P12BFREoVWl00G6HtcS7W',

  // Autenticación y perfil
  apiUrl: 'http://localhost:5006',
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
  apiUrlSimService: '',
  
  // Servicios externos (mantener URL completa)
  SimsUrl: 'https://authconnectivity.qasar.app/api-auth/auth/singIn',
  
  // Servicio legacy (si aún se usa)
  apibackerpUrl: 'http://localhost:5004/api-auth'
};
export const {apiUrl, apiUrlSimService} = environment;
