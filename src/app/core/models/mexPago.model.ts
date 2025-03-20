import { v4 as uuidv4 } from 'uuid';


export interface Articulo {
    descripcion: string;
    monto: string;
  }
  
export interface PrecargaDatos {
    nombre: string;
    apPaterno: string;
    apMaterno: string;
    correo: string;
    celular: string;
  }
  
export interface Payload {
    articulos: {
      articulos: Articulo[];
    };
    
  }
  
export interface RequestData {
    monto: string;
    noTransaccion: string;
    llave: string;
    fecha: string;
    articulos: Payload;
    precargaDatos: PrecargaDatos;
    enviarCorreo: string;
    infoComercio: string;
    lenguaje: string;
  }

  function createRequestData(
    monto: string, 
    articulos: Payload, 
    precargaDatos: PrecargaDatos): RequestData {
    return {
      monto: monto,
      noTransaccion: uuidv4(), // Llamada correcta a la función dentro de la implementación
      llave: 'tu_llave_aquí',
      fecha: new Date().toISOString(),
      articulos: articulos,
      precargaDatos: precargaDatos,
      enviarCorreo: 'false',
      infoComercio: 'true',
      lenguaje: 'es'
    };
  }
  