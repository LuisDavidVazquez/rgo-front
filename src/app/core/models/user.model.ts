export interface Users {
    id?: number;
    name: string;
    email: string;
    phone: string;
    expiredLines?: number;
    totalLines?: number;
    clientId?: number;
}
