const express = require('express');
const router = express.Router();
const auditController = require('../controllers/audit.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.post('/logs', auditController.createLog);
router.get('/logs', auditController.getMyLogs);
router.post('/purge', auditController.purge);

module.exports = router;
