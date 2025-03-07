export interface Clientwhithdetails {
    id:                 number;
    name:               string;
    clientLevel:        string;
    phone:              string;
    email:              string;
    password:           string;
    permission:         string;
    externalId:         null;
    isActive:           boolean;
    externalPlatformId: number;
    fiscalDetails:      FiscalDetail[];
    addresses:          Address[];
}

export interface Address {
    id:             number;
    state:          string;
    street:         string;
    postalCode:     number;
    number:         null;
    neighborhood:   null;
    city:           string;
    country:        string;
    clientId:       number;
    createdAt:      Date;
    updatedAt:      Date;
    innerNumber:    null;
    externalNumber: null;
    isFiscalData:   boolean;
}

export interface FiscalDetail {
    id:              number;
    personType:      string;
    rfc:             string;
    clientId:        number;
    businessName:    null;
    fiscalRegime:    null;
    cdfiUsage:       null;
    paymentMethod:   null;
    paymentForm:     null;
    paymentCurrency: string;
}