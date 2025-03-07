export interface Clients {
    id?: number;
    email?: string;
    name: string;
    level?: number;
    tagSassd?: string;
    status?: string;
    invoiceDate: Date;
    quantitySims?: number;
    mainPhone?: string;
    score?: number;
    idPreferredCurrency?: number;
    idLanguage?: number;
    idUserSales?: number;
    idFatherCompanyClient?: number;
    responsible_user_id: number;
    group_id?: number;
    webPage?: string;
    created_by?: Date;
    updated_by?: Date;
    idCompanyKommo?: number;
    languageId?: number;
    preferredCurrencyId?: number;
    userSalesId?: number;
    fatherCompanyClientId?: number;
    address?: string;
    isActive: boolean;
    created_at?: Date;
    updated_at?: Date;
    country?: Country;
}

export interface ClienteIccid {
    iccid: string;
    unitName: string;
    imei?: string;
    gps: string;
    userId?: number;
    simId: number;
    clientId: number;
    username: string;
}

interface Country {
    id: number;
}
