export interface NewService {
    id: number;
    simId: number;
    serviceContractAppendiceId?: number;
    name?: string;
    tags?: string;
    observations?: string;
    userId?: number;
    status?: string;
    SupplierSimId?: number;
    iccid?: string;
    selected?: boolean;
    companyClientId?: number;
    planName?: string;
    lineId?: number;
    lineNumber?: string;
    imei?: string;
}