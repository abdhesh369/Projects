import api from './api';
import { DashboardSummary, CategoryBreakdown, ChartDataPoint } from '../types';

export const analyticsService = {
    getSummary: async (dateRange?: string): Promise<DashboardSummary> => {
        const response = await api.get<DashboardSummary>('/api/analytics/summary', {
            params: dateRange ? { range: dateRange } : undefined
        });
        return response.data;
    },

    getCategoryBreakdown: async (dateRange?: string): Promise<CategoryBreakdown[]> => {
        const response = await api.get<CategoryBreakdown[]>('/api/analytics/category-breakdown', {
            params: dateRange ? { range: dateRange } : undefined
        });
        return response.data;
    },

    getSpendingTrend: async (dateRange?: string): Promise<ChartDataPoint[]> => {
        const response = await api.get<ChartDataPoint[]>('/api/analytics/spending-trend', {
            params: dateRange ? { range: dateRange } : undefined
        });
        return response.data;
    },

    getIncomeVsExpenses: async (dateRange?: string): Promise<any[]> => {
        const response = await api.get('/api/analytics/income-vs-expenses', {
            params: dateRange ? { range: dateRange } : undefined
        });
        return response.data;
    },

    getBalanceTrend: async (): Promise<ChartDataPoint[]> => {
        const response = await api.get<ChartDataPoint[]>('/api/analytics/balance-trend');
        return response.data;
    },
};
