const webhookService = {
    async handleWebhook(payload) {
        console.log(`[Banking] Received Webhook: ${payload.webhook_type}`);

        switch (payload.webhook_type) {
            case 'TRANSACTIONS':
                console.log(`[Banking] Handling transaction update for item ${payload.item_id}`);
                // Notify transaction-service to sync
                break;
            case 'ITEM':
                console.log(`[Banking] Handling item error/update for item ${payload.item_id}`);
                break;
            default:
                console.log(`[Banking] Unhandled webhook type: ${payload.webhook_type}`);
        }

        return { received: true };
    }
};

module.exports = webhookService;
