const logger = require('../../../shared/utils/logger');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'finance-tracker-super-secret-key-change-in-production';

// Map of userId -> Set of socket IDs
const userSockets = new Map();

let io = null;

const realtimeService = {
    /**
     * Initialize Socket.IO on the given HTTP server.
     */
    init(httpServer) {
        io = new Server(httpServer, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });

        // Authentication middleware for WebSocket connections
        io.use((socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.query.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }

            try {
                const decoded = jwt.verify(token, JWT_SECRET);
                socket.userId = decoded.id;
                next();
            } catch (err) {
                next(new Error('Invalid token'));
            }
        });

        io.on('connection', (socket) => {
            const userId = socket.userId;
            logger.info(`[Realtime] User ${userId} connected (socket: ${socket.id})`);

            // Track the user's socket
            if (!userSockets.has(userId)) {
                userSockets.set(userId, new Set());
            }
            userSockets.get(userId).add(socket.id);

            socket.join(`user:${userId}`);

            // Handle disconnection
            socket.on('disconnect', () => {
                logger.info(`[Realtime] User ${userId} disconnected (socket: ${socket.id})`);
                const sockets = userSockets.get(userId);
                if (sockets) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) {
                        userSockets.delete(userId);
                    }
                }
            });

            // Handle marking notifications as read from client
            socket.on('mark_read', (notificationId) => {
                logger.info(`[Realtime] User ${userId} marked notification ${notificationId} as read`);
            });
        });

        logger.info('[Realtime] Socket.IO initialized');
        return io;
    },

    /**
     * Send a real-time notification to a specific user.
     */
    sendToUser(userId, event, data) {
        if (!io) {
            console.warn('[Realtime] Socket.IO not initialized');
            return;
        }
        io.to(`user:${userId}`).emit(event, data);
        logger.info(`[Realtime] Sent "${event}" to user ${userId}`);
    },

    /**
     * Send a notification alert to a user (convenience method).
     */
    sendNotificationAlert(userId, notification) {
        this.sendToUser(userId, 'notification', {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            type: notification.type || 'info',
            timestamp: new Date().toISOString(),
        });
    },

    /**
     * Send a budget alert to a user.
     */
    sendBudgetAlert(userId, budget) {
        this.sendToUser(userId, 'budget_alert', {
            category: budget.category,
            spent: budget.spent,
            limit: budget.limit,
            percentage: Math.round((budget.spent / budget.limit) * 100),
            timestamp: new Date().toISOString(),
        });
    },

    /**
     * Broadcast to all connected clients.
     */
    broadcast(event, data) {
        if (!io) return;
        io.emit(event, data);
    },

    /**
     * Check if a user is online.
     */
    isUserOnline(userId) {
        return userSockets.has(userId) && userSockets.get(userId).size > 0;
    },

    /**
     * Get the Socket.IO instance.
     */
    getIO() {
        return io;
    }
};

module.exports = realtimeService;
