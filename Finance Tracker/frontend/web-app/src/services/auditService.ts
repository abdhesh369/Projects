import api from './api';

export interface AuditLog {
    id: string;
    userId: string;
    action: string;
    resource: string;
    details: any;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
}

export const auditService = {
    async getMyLogs(limit: number = 50): Promise<AuditLog[]> {
        const response = await api.get('/api/audit/logs', { params: { limit } });
        return response.data;
    }
};
