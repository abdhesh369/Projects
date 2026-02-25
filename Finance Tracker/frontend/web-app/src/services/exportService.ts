import api from './api';

export const exportService = {
    async exportTransactions(format: 'csv' | 'pdf', startDate: string, endDate: string): Promise<void> {
        try {
            const response = await api.get('/api/reporting/export', {
                params: { format, startDate, endDate },
                responseType: 'blob'
            });

            // Create a Blob from the PDF/CSV Stream
            const file = new Blob([response.data], {
                type: format === 'csv' ? 'text/csv' : 'application/pdf'
            });

            // Build a URL from the file
            const fileURL = URL.createObjectURL(file);

            // Create a temp <a> tag to download file
            const link = document.createElement('a');
            link.href = fileURL;
            link.download = `transactions_${startDate}_to_${endDate}.${format}`;
            document.body.appendChild(link);
            link.click();

            // Cleanup
            link.parentNode?.removeChild(link);
            URL.revokeObjectURL(fileURL);
        } catch (error) {
            console.error(`[ExportService] Failed to export ${format}:`, error);
            throw new Error(`Failed to export ${format} report.`);
        }
    }
};
