import api from './api';
import { DashboardSummary, CategoryBreakdown, ChartDataPoint } from '../types';

export interface Insight {
    type: 'success' | 'warning' | 'info';
    category?: string;
    message: string;
    suggestion?: string;
}

export interface Forecast {
    forecastedAmount: number;
    confidence: 'high' | 'medium' | 'low';
    message?: string;
    basedOnMonths?: string[];
    nextMonth?: string;
}

export const analyticsService = {
    getSummary: async (dateRange?: string): Promise<DashboardSummary> => {
        const response = await api.get<DashboardSummary>('/api/analytics/summary', {
            params: dateRange ? { range: dateRange } : undefined
        });
        return response.data;
    },

    getInsights: async (): Promise<Insight[]> => {
        const response = await api.get<Insight[]>('/api/analytics/insights');
        return response.data;
    },

    getForecast: async (): Promise<Forecast> => {
        const response = await api.get<Forecast>('/api/analytics/forecast');
        return response.data;
    },

    getTrends: async (): Promise<any> => {
        const response = await api.get('/api/analytics/trends');
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
