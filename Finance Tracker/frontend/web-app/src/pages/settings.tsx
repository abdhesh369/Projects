import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
    UserCircleIcon,
    BellIcon,
    ShieldCheckIcon,
    CreditCardIcon,
    PaintBrushIcon,
    ArrowRightOnRectangleIcon,
    ChevronRightIcon,
    SunIcon,
    MoonIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { Layout, Button, Card, Input } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/userService';
import { auditService, AuditLog } from '../services/auditService';
import styles from '../styles/Settings.module.css';
import { formatDistanceToNow, format } from 'date-fns';

interface SettingsSection {
    id: string;
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
}

const sections: SettingsSection[] = [
    { id: 'profile', icon: UserCircleIcon, title: 'Profile', description: 'Manage your personal information' },
    { id: 'notifications', icon: BellIcon, title: 'Notifications', description: 'Configure notification preferences' },
    { id: 'security', icon: ShieldCheckIcon, title: 'Security', description: 'Password and authentication settings' },
    { id: 'activity', icon: ClipboardDocumentListIcon, title: 'Activity Logs', description: 'View your recent account activity' },
    { id: 'billing', icon: CreditCardIcon, title: 'Billing', description: 'Manage subscription and payments' },
    { id: 'appearance', icon: PaintBrushIcon, title: 'Appearance', description: 'Customize the app theme' },
];

export default function Settings() {
    const { user, logout } = useAuth();
    const { theme, setTheme } = useTheme();
    const [activeSection, setActiveSection] = useState('profile');
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [notifications, setNotifications] = useState<Record<string, boolean>>(
        typeof user?.preferences?.notifications === 'object'
            ? user.preferences.notifications as Record<string, boolean>
            : {
                email: true,
                push: true,
                budgetAlerts: true,
                weeklyReport: false,
            }
    );
    const [isSaving, setIsSaving] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName);
            setLastName(user.lastName);
        }
    }, [user]);

    useEffect(() => {
        if (activeSection === 'activity') {
            fetchAuditLogs();
        }
    }, [activeSection]);

    const fetchAuditLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const logs = await auditService.getMyLogs();
            if (Array.isArray(logs)) {
                setAuditLogs(logs);
            } else if (logs && typeof logs === 'object' && 'data' in logs) {
                setAuditLogs((logs as any).data);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            await userService.updateProfile({ firstName, lastName });
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Failed to update profile:', error);
            alert('Failed to update profile.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleUpdateTheme = async (newTheme: 'dark' | 'light') => {
        try {
            setTheme(newTheme); // Optimistic update
            await userService.updatePreferences({ theme: newTheme });
        } catch (error) {
            console.error('Failed to update theme:', error);
            // Revert on failure (simplified here)
        }
    };

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>Profile Settings</h2>
                        <p className={styles.sectionDescription}>Manage your personal information and account details</p>

                        <div className={styles.avatarSection}>
                            <div className={styles.avatar}>
                                <span>{firstName?.[0]}{lastName?.[0]}</span>
                            </div>
                            <div className={styles.avatarActions}>
                                <Button variant="secondary" size="sm">Change Photo</Button>
                                <Button variant="ghost" size="sm">Remove</Button>
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <Input
                                label="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <Input
                                label="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            <Input label="Email" type="email" value={user?.email || ''} disabled />
                        </div>

                        <div className={styles.formActions}>
                            <Button
                                variant="primary"
                                onClick={handleSaveProfile}
                                isLoading={isSaving}
                            >
                                Save Changes
                            </Button>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>Notification Preferences</h2>
                        <p className={styles.sectionDescription}>Choose how you want to receive notifications</p>

                        <div className={styles.toggleList}>
                            {Object.entries(notifications).map(([key, value]) => (
                                <div key={key} className={styles.toggleItem}>
                                    <div className={styles.toggleInfo}>
                                        <span className={styles.toggleTitle}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                                        <span className={styles.toggleDescription}>Receive updates via {key}</span>
                                    </div>
                                    <label className={styles.toggle}>
                                        <input
                                            type="checkbox"
                                            checked={!!value}
                                            onChange={async (e) => {
                                                const newNotifs = { ...notifications, [key]: e.target.checked };
                                                setNotifications(newNotifs);
                                                await userService.updatePreferences({ notifications: newNotifs });
                                            }}
                                        />
                                        <span className={styles.toggleSlider} />
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'appearance':
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>Appearance</h2>
                        <p className={styles.sectionDescription}>Customize how the app looks</p>

                        <div className={styles.themeSelector}>
                            <button
                                className={`${styles.themeOption} ${theme === 'light' ? styles.active : ''}`}
                                onClick={() => handleUpdateTheme('light')}
                            >
                                <SunIcon className={styles.themeIcon} />
                                <span>Light</span>
                            </button>
                            <button
                                className={`${styles.themeOption} ${theme === 'dark' ? styles.active : ''}`}
                                onClick={() => handleUpdateTheme('dark')}
                            >
                                <MoonIcon className={styles.themeIcon} />
                                <span>Dark</span>
                            </button>
                        </div>
                    </div>
                );

            case 'activity':
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>Activity Logs</h2>
                        <p className={styles.sectionDescription}>View your recent security and account activity</p>

                        <div className={styles.logList}>
                            {isLoadingLogs ? (
                                <p>Loading logs...</p>
                            ) : auditLogs.length === 0 ? (
                                <p>No recent activity found.</p>
                            ) : (
                                auditLogs.map(log => (
                                    <div key={log.id} className={styles.logItem}>
                                        <div className={styles.logHeader}>
                                            <span className={styles.logAction}>{log.action.replace(/_/g, ' ')}</span>
                                            <span className={styles.logTime}>
                                                {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className={styles.logDetails}>
                                            <p>Resource: <span className={styles.logResource}>{log.resource}</span></p>
                                            <p className={styles.logIp}>IP: {log.ipAddress}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                );

            default:
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>{sections.find(s => s.id === activeSection)?.title}</h2>
                        <p className={styles.sectionDescription}>This section is coming soon.</p>
                    </div>
                );
        }
    };

    return (
        <>
            <Head>
                <title>Settings | Finance Tracker</title>
                <meta name="description" content="Manage your account settings and preferences" />
            </Head>

            <Layout>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Settings</h1>
                        <p className={styles.subtitle}>Manage your account and preferences</p>
                    </div>

                    <div className={styles.settingsLayout}>
                        {/* Sidebar */}
                        <Card className={styles.sidebar} padding="sm">
                            <nav className={styles.nav}>
                                {sections.map((section) => (
                                    <button
                                        key={section.id}
                                        className={`${styles.navItem} ${activeSection === section.id ? styles.active : ''}`}
                                        onClick={() => setActiveSection(section.id)}
                                    >
                                        <section.icon className={styles.navIcon} />
                                        <div className={styles.navText}>
                                            <span className={styles.navTitle}>{section.title}</span>
                                            <span className={styles.navDescription}>{section.description}</span>
                                        </div>
                                        <ChevronRightIcon className={styles.navArrow} />
                                    </button>
                                ))}

                                <div className={styles.navDivider} />

                                <button
                                    className={`${styles.navItem} ${styles.danger}`}
                                    onClick={logout}
                                >
                                    <ArrowRightOnRectangleIcon className={styles.navIcon} />
                                    <div className={styles.navText}>
                                        <span className={styles.navTitle}>Log Out</span>
                                    </div>
                                </button>
                            </nav>
                        </Card>

                        {/* Content */}
                        <Card className={styles.content}>
                            {renderSection()}
                        </Card>
                    </div>
                </div>
            </Layout>
        </>
    );
}
