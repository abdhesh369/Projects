const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

router.get('/summary', reportController.getSummaryReport);
router.get('/export', reportController.getExport);

module.exports = router;
