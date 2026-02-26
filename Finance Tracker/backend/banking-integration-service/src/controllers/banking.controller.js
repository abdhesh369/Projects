const logger = require('../../../shared/utils/logger');
const auditLogger = require('../../../shared/utils/audit-logger');
const connectionService = require('../services/connection.service');
const encryptionService = require('../services/encryption.service');
const webhookService = require('../services/webhook.service');
const syncWorker = require('../workers/sync.worker');

const bankingController = {
    async getLinkToken(req, res) {
        try {
            const userId = req.user.id;
            const token = await connectionService.createLinkToken(userId);
            res.status(200).json(token);
        } catch (error) {
            logger.error('[Banking] getLinkToken error:', error.message);
            res.status(500).json({ error: 'Failed to generate link token' });
        }
    },

    async handlePublicToken(req, res) {
        try {
            const { publicToken } = req.body;
            const userId = req.user.id;
            const tokens = await connectionService.exchangePublicToken(userId, publicToken);

            // Encrypt access token before storing
            const encryptedAccessToken = encryptionService.encrypt(tokens.access_token);

            await auditLogger.log(userId, 'LINK_ACCOUNT', 'BANKING', tokens.item_id, {
                publicTokenShort: publicToken.substring(0, 10) + '...'
            }, req.ip);

            // Trigger initial sync in the background
            syncWorker.runFullSync(encryptedAccessToken, userId).catch(err => {
                logger.error('[Banking] Background sync failed:', err.message);
            });

            res.status(200).json({
                message: 'Account linked successfully. Initial sync in progress.',
                itemId: tokens.item_id,
            });
        } catch (error) {
            logger.error('[Banking] handlePublicToken error:', error.message);
            res.status(500).json({ error: 'Failed to link account' });
        }
    },

    async manualSync(req, res) {
        try {
            const userId = req.user.id;
            const { encryptedAccessToken, cursor } = req.body;

            if (!encryptedAccessToken) {
                return res.status(400).json({ error: 'encryptedAccessToken is required' });
            }

            const result = await syncWorker.runFullSync(encryptedAccessToken, userId, cursor);
            res.status(200).json(result);
        } catch (error) {
            logger.error('[Banking] manualSync error:', error.message);
            res.status(500).json({ error: 'Failed to sync accounts' });
        }
    },

    async processWebhook(req, res) {
        try {
            const signature = req.headers['plaid-verification'];
            if (!signature) {
                return res.status(401).json({ error: 'Missing webhook signature' });
            }

            // Verify signature
            const isValid = await webhookService.verifyWebhook(signature, req.body);
            if (!isValid) {
                logger.warn('[Banking] Rejecting invalid webhook signature');
                return res.status(403).json({ error: 'Invalid webhook signature' });
            }

            logger.info('[Banking] Webhook signature verified, processing payload...');

            await auditLogger.log(null, 'WEBHOOK_RECEIVED', 'BANKING', req.body.item_id || 'unknown', {
                type: req.body.webhook_type,
                code: req.body.webhook_code
            }, req.ip);

            const result = await webhookService.handleWebhook(req.body);
            res.status(200).json(result);
        } catch (error) {
            logger.error('[Banking] Webhook error:', error.message);
            res.status(500).json({ error: 'Failed to process webhook' });
        }
    }
};

module.exports = bankingController;
