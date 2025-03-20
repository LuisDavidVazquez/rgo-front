export interface editUser {
    id:       number;
    iccid:    string;
    unitName: string;
    imei:     string;
    gps:      string;
    userId:   number;
    isActive: boolean;
    simId:    number;
    clientId: number;
    user:     User;
    sims:     Sim[];
}

export interface Sim {
    id:               number;
    companyClient:    number;
    statusId:         number;
    status:           string;
    clientName:       string;
    name:             string;
    days:             number;
    paidDate:         Date;
    dueDate:          Date;
    rechargePlanId:   number;
    planName:         string;
    iccid:            string;
    imsi:             null;
    msisdn:           string;
    activationDate:   Date;
    lastStatusUpdate: Date;
    createdAt:        Date;
    updatedAt:        Date;
    clientId:         number;
    isFirstPost:      boolean;
}

export interface User {
    id:                 number;
    username:           string;
    clientLevel:        string;
    phone:              string;
    email:              string;
    password:           string;
    externalId:         null;
    permission:         string;
    createdAt:          Date;
    IsActive:           boolean;
    externalPlatformId: null;
    clientId:           number;
}