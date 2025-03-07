export interface Clientsims {
    // total: number;
    // pages:number;
    sims: Sim[];
    id: number;
    imei: string;
    unitname: string;
    userId: number;
    user: User;
    gps: string;
}

export interface solicituddeSim {
    id: number;
    // Añade aquí más propiedades según la estructura de tu cliente
    datosFiscales: any;
    direccion: any;
}

export interface DireccionEnvio {
    nombre: string;
    calle: string;
    colonia: string;
    codigoPostal: string;
    estado: string;
    municipio: string;
    clienteId: number;
    cantidadSimsSolicitadas: number;
}

export interface User {
    IsActive: boolean;
    clientlevel: number;
    createdAt: string;
    email: string;
    externalId?: string;
    externalPlatformId?: number;
    id: number;
    idPadre: number;
    password: string;
    permission: string;
    phone: string;
    username: string;
    clientId: number;
    gps: string;
}

export interface SimStatus {
    id: number;
    iccid: string;
    planName: string;
    gps: string;
    imei: string;
    status: string;
    dueDate: string;
    name: string;
    clientId?: number; // Añadido como opcional
    simId?: number; // Añadido como opcional
    activationDate?: string;
    // Añade cualquier otra propiedad que pueda ser necesaria
}

export interface UserWithSims {
    id: number;
    username: string;
    email: string;
    phone: string;
    sims: SimStatus[]; // Asegúrate de que esto sea SimStatus[]
    totalSims: number;
    lastActivityDate: Date;
    simsCount: {
        total: number;
        suspended: number;
    };
}

export interface Sim {
    id: number;
    iccid: string;
    name?: string;
    clientId: string; // Asegrate de que esta propiedad esté definida
    // dataPlan: number;
    //  coveragePlan: number;
    status?: string;
    //  tags?: string;
    imei?: string;
    simId: number;
    selected?: boolean;
    lineNumber?: string;
    lineId?: number;
    planName?: string;
    endpointId?: string;
    msisdn?: string | null;
    imsi?: string | null;
    //  MB?: string | void;
    paidDate?: string;
    rechargePlan?: number;
    dueDate?: string;
    // SupplierSimId?: number;
    rechargePlanId?: number;
    gps?: string;
    days?: number;
    client?: string;
    isFirstPost?: boolean;
    companyClient?: number;
    activationDate?: string;
}

export interface SolicitudDeSim {
    id: number;
    calle: string;
    clienteId: number;
    colonia: string;
    codigoPostal: string;
    nombre?: string;
    estado: string;
    municipio: string;
    statusSolicitud: string;
    cantidadSimsSolicitadas: number;
}
