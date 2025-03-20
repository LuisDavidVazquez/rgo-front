

export interface RechargeplanMovement {
    id:                    number;
    createdAt:             Date;
    updatedAt:             Date;
    simId:                 number;
    userId:                number;
    planName:              string;
    rechargePlanId:        number;
    paymentStatus:         string;
    transactionNumber:     string;
    paymentId:             string;
    isFirstPost:           boolean;
    stripePaymentIntentId: null;
    stripeCustomerId:      null;
    clientSecret:          null;
    paymentMethodId:       null;
    currency:              string;
    paymentMetadata?:       PaymentMetadata;
    refunded:              boolean;
    paymentProvider:       string;
    amount:                string;
    userType:              string;
    sim:                   Sim;
    user:                  User | null;
    client:                Client | null;

}

export interface Client {
    id?: number;
    name: string;
}

export interface Sim {
    id:               number;
    status:           string;
    clientName:       string;
    name:             string;
    days:             number;
    dueDate:          Date;
    planName:         string;
    iccid:            string;
    msisdn:           string;
    activationDate:   Date;
    lastStatusUpdate: Date;
    isFirstPost:      boolean;
}

export interface PaymentMetadata {
    planId:            number;
    planDays:          number;
    planName:          string;
    simsCount:         number;
    totalAmount:       number;
    transactionNumber: string;
}
export interface User {
    username: string;
}


export interface Meta {
    totalItems:   number;
    itemsPerPage: number;
    totalPages:   number;
    currentPage:  number;
}
