import api from './api';
import { DashboardSummary, CategoryBreakdown, ChartDataPoint } from '../types';

export const analyticsService = {
    getSummary: async (): Promise<DashboardSummary> => {
        const response = await api.get<DashboardSummary>('/analytics/summary');
        return response.data;
    },

    getCategoryBreakdown: async (): Promise<CategoryBreakdown[]> => {
        const response = await api.get<CategoryBreakdown[]>('/analytics/category-breakdown');
        return response.data;
    },

    getSpendingTrend: async (): Promise<ChartDataPoint[]> => {
        const response = await api.get<ChartDataPoint[]>('/analytics/spending-trend');
        return response.data;
    },
};
