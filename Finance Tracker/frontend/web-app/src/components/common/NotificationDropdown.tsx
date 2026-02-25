import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckIcon } from '@heroicons/react/24/outline';
import { notificationService } from '../../services/notificationService';
import { AppNotification } from '../../types';
import styles from './NotificationDropdown.module.css';
import { formatDistanceToNow } from 'date-fns';

export const NotificationDropdown: React.FC = () => {
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            if (Array.isArray(data)) {
                setNotifications(data);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Optional: Polling every 60s
        const intervalId = setInterval(fetchNotifications, 60000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleMarkAsRead = async (id: string) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className={styles.container} ref={dropdownRef}>
            <button
                className={styles.notificationButton}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle notifications"
            >
                <BellIcon className={styles.icon} />
                {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>Notifications</h3>
                    </div>

                    <div className={styles.list}>
                        {notifications.length === 0 ? (
                            <div className={styles.empty}>
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`${styles.item} ${!notification.is_read ? styles.unread : ''}`}
                                >
                                    <div className={styles.content}>
                                        <h4 className={styles.itemTitle}>{notification.title}</h4>
                                        <p className={styles.itemMessage}>{notification.message}</p>
                                        <span className={styles.timestamp}>
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                        </span>
                                    </div>
                                    {!notification.is_read && (
                                        <button
                                            className={styles.markReadBtn}
                                            onClick={() => handleMarkAsRead(notification.id)}
                                            title="Mark as read"
                                        >
                                            <CheckIcon className={styles.checkIcon} />
                                        </button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
