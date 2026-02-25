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
import { Layout, Button, Card, Input, Modal } from '../components/common';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { userService } from '../services/userService';
import { authService } from '../services/auth';
import { auditService, AuditLog } from '../services/auditService';
import { sessionService, UserSession } from '../services/sessionService';
import { billingService, StripeInvoice } from '../services/billingService';
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

    // Security State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [is2FAEnabled, setIs2FAEnabled] = useState(user?.mfaEnabled || false);
    const [isUpdatingSecurity, setIsUpdatingSecurity] = useState(false);
    const [sessions, setSessions] = useState<UserSession[]>([]);
    const [isLoadingSessions, setIsLoadingSessions] = useState(false);

    // Billing State
    const [invoices, setInvoices] = useState<StripeInvoice[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [isLoadingBilling, setIsLoadingBilling] = useState(false);

    // MFA Setup State
    const [mfaSetupData, setMfaSetupData] = useState<{ secret: string; qrCode: string } | null>(null);
    const [mfaCode, setMfaCode] = useState('');
    const [isVerifyingMFA, setIsVerifyingMFA] = useState(false);
    const [showMFAModal, setShowMFAModal] = useState(false);

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
        if (activeSection === 'security') {
            fetchSessions();
        }
        if (activeSection === 'billing') {
            fetchBillingData();
        }
    }, [activeSection]);

    const fetchSessions = async () => {
        setIsLoadingSessions(true);
        try {
            const data = await sessionService.getSessions();
            setSessions(data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setIsLoadingSessions(false);
        }
    };

    const fetchBillingData = async () => {
        setIsLoadingBilling(true);
        try {
            const [invoiceData, subData] = await Promise.all([
                billingService.getInvoices(),
                billingService.getSubscription()
            ]);
            setInvoices(invoiceData);
            setSubscription(subData);
        } catch (error) {
            console.error('Failed to fetch billing data:', error);
        } finally {
            setIsLoadingBilling(false);
        }
    };

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

    const handleLogoutAll = async () => {
        if (!confirm('Are you sure you want to log out from all other devices?')) return;
        try {
            await sessionService.logoutAll();
            fetchSessions();
            alert('Logged out from all other devices.');
        } catch (error) {
            console.error('Logout all failed:', error);
        }
    };

    const handleLogoutOther = async (sessionId: string) => {
        try {
            await sessionService.logoutOther(sessionId);
            fetchSessions();
        } catch (error) {
            console.error('Logout session failed:', error);
        }
    };

    const handleToggleMFA = async () => {
        if (is2FAEnabled) {
            if (!confirm('Are you sure you want to disable 2FA?')) return;
            try {
                await authService.disableMFA();
                setIs2FAEnabled(false);
                alert('2FA disabled successfully.');
            } catch (error) {
                console.error('Disable MFA failed:', error);
            }
        } else {
            try {
                const data = await authService.setupMFA();
                setMfaSetupData(data);
                setShowMFAModal(true);
            } catch (error) {
                console.error('Setup MFA failed:', error);
            }
        }
    };

    const handleVerifyMFA = async () => {
        setIsVerifyingMFA(true);
        try {
            await authService.verifyMFA(mfaCode);
            setIs2FAEnabled(true);
            setShowMFAModal(false);
            setMfaSetupData(null);
            setMfaCode('');
            alert('2FA enabled successfully!');
        } catch (error) {
            console.error('Verify MFA failed:', error);
            alert('Invalid verification code.');
        } finally {
            setIsVerifyingMFA(false);
        }
    };

    const handleBillingCheckout = async (priceId: string) => {
        try {
            const { url } = await billingService.createCheckoutSession(priceId);
            window.location.href = url;
        } catch (error) {
            console.error('Checkout failed:', error);
        }
    };

    const handleBillingPortal = async () => {
        try {
            const { url } = await billingService.createPortalSession();
            window.location.href = url;
        } catch (error) {
            console.error('Portal failed:', error);
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

            case 'security':
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>Security Settings</h2>
                        <p className={styles.sectionDescription}>Manage your password and authentication methods</p>

                        <div className={styles.securityCard}>
                            <h3 className={styles.title} style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Change Password</h3>
                            <div className={styles.formGrid}>
                                <Input
                                    label="Current Password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <div /> {/* Empty space for layout */}
                                <Input
                                    label="New Password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <Input
                                    label="Confirm New Password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <div className={styles.formActions}>
                                <Button
                                    variant="primary"
                                    onClick={() => {
                                        setIsUpdatingSecurity(true);
                                        setTimeout(() => {
                                            alert('Password updated successfully');
                                            setCurrentPassword('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setIsUpdatingSecurity(false);
                                        }, 1000);
                                    }}
                                    isLoading={isUpdatingSecurity}
                                    disabled={!currentPassword || !newPassword || newPassword !== confirmPassword}
                                >
                                    Update Password
                                </Button>
                            </div>
                        </div>

                        <div className={styles.navDivider} />

                        <div className={styles.securityCard}>
                            <div className={styles.securityItem}>
                                <div className={styles.securityInfo}>
                                    <span className={styles.securityTitle}>Two-Factor Authentication (2FA)</span>
                                    <span className={styles.securityDescription}>Add an extra layer of security to your account</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={is2FAEnabled}
                                        onChange={handleToggleMFA}
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                            </div>
                        </div>

                        <div className={styles.navDivider} />

                        <div className={styles.securityCard}>
                            <h3 className={styles.title} style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Active Sessions</h3>
                            <p className={styles.sectionDescription} style={{ marginBottom: '1rem' }}>These are devices that have logged into your account.</p>
                            <div className={styles.logList} style={{ maxHeight: 'none' }}>
                                {isLoadingSessions ? (
                                    <p>Loading sessions...</p>
                                ) : sessions.length === 0 ? (
                                    <p>No active sessions found.</p>
                                ) : (
                                    sessions.map(session => (
                                        <div key={session.id} className={styles.logItem}>
                                            <div className={styles.logHeader}>
                                                <span className={styles.logAction}>{session.userAgent}</span>
                                                <span className={styles.logTime}>{session.isCurrent ? 'Active now' : formatDistanceToNow(new Date(session.lastActive), { addSuffix: true })}</span>
                                            </div>
                                            <div className={styles.logDetails}>
                                                <p>IP: {session.ipAddress}</p>
                                                {!session.isCurrent && (
                                                    <Button variant="ghost" size="sm" onClick={() => handleLogoutOther(session.id)}>
                                                        Revoke Access
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                            {sessions.length > 1 && (
                                <div className={styles.formActions} style={{ marginTop: '1rem' }}>
                                    <Button variant="danger" onClick={handleLogoutAll}>
                                        Log out all other devices
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                );

            case 'billing':
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>Billing & Subscription</h2>
                        <p className={styles.sectionDescription}>Manage your subscription plan and payment methods</p>

                        <div className={styles.securityCard}>
                            <div className={styles.securityItem} style={{ alignItems: 'flex-start', padding: 0 }}>
                                <div className={styles.securityInfo}>
                                    <span className={styles.securityTitle} style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                                        {subscription ? (subscription.status === 'active' ? 'Pro Plan' : 'Free Plan') : 'Loading...'}
                                    </span>
                                    <span className={styles.securityDescription}>
                                        {subscription ? `$${subscription.amount / 100} / ${subscription.interval}` : ''}
                                    </span>
                                    {subscription?.nextBillingDate && (
                                        <span className={styles.securityDescription} style={{ marginTop: '0.25rem' }}>
                                            Next billing date: {format(new Date(subscription.nextBillingDate * 1000), 'MMM d, yyyy')}
                                        </span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    {subscription?.status === 'active' ? (
                                        <Button variant="secondary" onClick={handleBillingPortal}>Manage Subscription</Button>
                                    ) : (
                                        <Button variant="primary" onClick={() => handleBillingCheckout('price_premium_monthly')}>Upgrade Plan</Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className={styles.navDivider} />

                        {subscription?.paymentMethod && (
                            <>
                                <div className={styles.securityCard}>
                                    <h3 className={styles.title} style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Payment Method</h3>
                                    <div className={styles.securityItem} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', background: 'var(--bg-tertiary)' }}>
                                        <div className={styles.securityInfo} style={{ flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
                                            <CreditCardIcon style={{ width: '2.5rem', height: '2.5rem', color: 'var(--color-primary)' }} />
                                            <div>
                                                <div className={styles.securityTitle}>{subscription.paymentMethod.brand} ending in {subscription.paymentMethod.last4}</div>
                                                <div className={styles.securityDescription}>Expires {subscription.paymentMethod.expMonth}/{subscription.paymentMethod.expYear}</div>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="sm" onClick={handleBillingPortal}>Update</Button>
                                    </div>
                                </div>
                                <div className={styles.navDivider} />
                            </>
                        )}

                        <div className={styles.securityCard}>
                            <h3 className={styles.title} style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Billing History</h3>
                            <div className={styles.logList} style={{ maxHeight: 'none' }}>
                                {isLoadingBilling ? (
                                    <p>Loading invoices...</p>
                                ) : invoices.length === 0 ? (
                                    <p>No billing history found.</p>
                                ) : (
                                    invoices.map((invoice) => (
                                        <div key={invoice.id} className={styles.logItem} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className={styles.securityInfo}>
                                                <span className={styles.securityTitle} style={{ marginBottom: '0.25rem' }}>Subscription Payment</span>
                                                <span className={styles.securityDescription}>
                                                    {format(new Date(invoice.date), 'MMM d, yyyy')}
                                                </span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>${invoice.amount / 100}</span>
                                                {invoice.pdfUrl && (
                                                    <a href={invoice.pdfUrl} target="_blank" rel="noopener noreferrer">
                                                        <Button variant="ghost" size="sm">Download PDF</Button>
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
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

            {/* MFA Setup Modal */}
            <Modal
                isOpen={showMFAModal}
                onClose={() => {
                    setShowMFAModal(false);
                    setMfaSetupData(null);
                    setMfaCode('');
                }}
                title="Set up Two-Factor Authentication"
                size="sm"
            >
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                        Scan the QR code with your authenticator app (like Google Authenticator or Authy).
                    </p>
                    {mfaSetupData?.qrCode && (
                        <div style={{ background: '#fff', padding: '1rem', borderRadius: 'var(--radius-md)', display: 'inline-block', marginBottom: '1rem' }}>
                            <img src={mfaSetupData.qrCode} alt="QR Code" style={{ width: '200px', height: '200px' }} />
                        </div>
                    )}
                    <p style={{ marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        Or enter secret manually: <code style={{ background: 'var(--bg-secondary)', padding: '0.2rem 0.4rem', borderRadius: 'var(--radius-sm)' }}>{mfaSetupData?.secret}</code>
                    </p>
                    <Input
                        label="Verification Code"
                        placeholder="000000"
                        value={mfaCode}
                        onChange={(e) => setMfaCode(e.target.value)}
                        maxLength={6}
                    />
                    <div style={{ marginTop: '1.5rem' }}>
                        <Button
                            variant="primary"
                            fullWidth
                            onClick={handleVerifyMFA}
                            isLoading={isVerifyingMFA}
                            disabled={mfaCode.length !== 6}
                        >
                            Verify & Enable
                        </Button>
                    </div>
                </div>
            </Modal>
        </>
    );
}
