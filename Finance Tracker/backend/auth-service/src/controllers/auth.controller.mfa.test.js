process.env.JWT_SECRET = 'test-secret-key-that-is-long-enough-for-test';
process.env.REFRESH_SECRET = 'test-refresh-key-that-is-long-enough-for-test';

const authController = require('./auth.controller');
const mfaService = require('../services/mfa.service');
const User = require('../models/user.model');

// Mock dependencies
jest.mock('../services/mfa.service', () => ({
    getPendingSecret: jest.fn(),
    verifyCode: jest.fn(),
    clearPendingSecret: jest.fn(),
    generateSecret: jest.fn(),
    enroll: jest.fn()
}));
jest.mock('../models/user.model', () => ({
    update: jest.fn(),
    findById: jest.fn(),
    findByEmail: jest.fn()
}));
jest.mock('../models/session.model', () => ({
    ensureTable: jest.fn().mockResolvedValue()
}));
jest.mock('../models/refresh-token.model', () => ({}));

describe('Auth Controller - MFA', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            user: { id: 1 },
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    it('should verify MFA successfully when code is valid and pending secret exists', async () => {
        req.body.code = '123456';

        mfaService.getPendingSecret.mockResolvedValue('test-secret');
        mfaService.verifyCode.mockResolvedValue(true);
        User.update.mockResolvedValue({});
        mfaService.clearPendingSecret.mockResolvedValue();

        await authController.verifyMFA(req, res);

        expect(mfaService.getPendingSecret).toHaveBeenCalledWith(1);
        expect(mfaService.verifyCode).toHaveBeenCalledWith(1, '123456', 'test-secret');
        expect(User.update).toHaveBeenCalledWith(1, { mfa_enabled: true, mfa_secret: 'test-secret' });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({ message: 'MFA verified and enabled successfully' });
    });

    it('should fail MFA verification if pending secret is expired', async () => {
        req.body.code = '123456';

        mfaService.getPendingSecret.mockResolvedValue(null);

        await authController.verifyMFA(req, res);

        expect(mfaService.getPendingSecret).toHaveBeenCalledWith(1);
        expect(mfaService.verifyCode).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'MFA setup session expired. Please restart setup.' });
    });
});
