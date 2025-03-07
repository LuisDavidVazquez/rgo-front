export interface Notification {
    id: number;
    clientId: number;
    type: NotificationType;
    message: string;
    createdAt: Date;
    readAt: Date | null;
    expiresAt: Date | null;
    data: NotificationData;
}

enum NotificationType {
    LINE_EXPIRATION = 'LINE_EXPIRATION',
    INVOICE_DUE = 'INVOICE_DUE',
    SIM_ASSIGNMENT = 'SIM_ASSIGNMENT',
    ACCOUNT_UPDATE = 'ACCOUNT_UPDATE',
    // Otros tipos de notificaciones según sea necesario
}

interface NotificationData {
    // Datos específicos según el tipo de notificación
    lineNumber?: string;
    expirationDate?: Date;
    invoiceAmount?: number;
    simCount?: number;
    // Otros campos relevantes
}