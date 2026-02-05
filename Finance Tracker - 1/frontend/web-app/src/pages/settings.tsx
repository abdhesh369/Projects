import React, { useState } from 'react';
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
} from '@heroicons/react/24/outline';
import { Layout, Button, Card, Input } from '../components/common';
import styles from '../styles/Settings.module.css';

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
    { id: 'billing', icon: CreditCardIcon, title: 'Billing', description: 'Manage subscription and payments' },
    { id: 'appearance', icon: PaintBrushIcon, title: 'Appearance', description: 'Customize the app theme' },
];

export default function Settings() {
    const [activeSection, setActiveSection] = useState('profile');
    const [isDarkMode, setIsDarkMode] = useState(true);
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        budgetAlerts: true,
        weeklyReport: false,
    });

    const renderSection = () => {
        switch (activeSection) {
            case 'profile':
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>Profile Settings</h2>
                        <p className={styles.sectionDescription}>Manage your personal information and account details</p>

                        <div className={styles.avatarSection}>
                            <div className={styles.avatar}>
                                <span>JD</span>
                            </div>
                            <div className={styles.avatarActions}>
                                <Button variant="secondary" size="sm">Change Photo</Button>
                                <Button variant="ghost" size="sm">Remove</Button>
                            </div>
                        </div>

                        <div className={styles.formGrid}>
                            <Input label="First Name" defaultValue="John" />
                            <Input label="Last Name" defaultValue="Doe" />
                            <Input label="Email" type="email" defaultValue="john@example.com" />
                            <Input label="Phone" type="tel" defaultValue="+1 (555) 123-4567" />
                        </div>

                        <div className={styles.formActions}>
                            <Button variant="primary">Save Changes</Button>
                        </div>
                    </div>
                );

            case 'notifications':
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>Notification Preferences</h2>
                        <p className={styles.sectionDescription}>Choose how you want to receive notifications</p>

                        <div className={styles.toggleList}>
                            <div className={styles.toggleItem}>
                                <div className={styles.toggleInfo}>
                                    <span className={styles.toggleTitle}>Email Notifications</span>
                                    <span className={styles.toggleDescription}>Receive important updates via email</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={notifications.email}
                                        onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                            </div>

                            <div className={styles.toggleItem}>
                                <div className={styles.toggleInfo}>
                                    <span className={styles.toggleTitle}>Push Notifications</span>
                                    <span className={styles.toggleDescription}>Get real-time alerts on your device</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={notifications.push}
                                        onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                            </div>

                            <div className={styles.toggleItem}>
                                <div className={styles.toggleInfo}>
                                    <span className={styles.toggleTitle}>Budget Alerts</span>
                                    <span className={styles.toggleDescription}>Get notified when nearing budget limits</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={notifications.budgetAlerts}
                                        onChange={(e) => setNotifications({ ...notifications, budgetAlerts: e.target.checked })}
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                            </div>

                            <div className={styles.toggleItem}>
                                <div className={styles.toggleInfo}>
                                    <span className={styles.toggleTitle}>Weekly Report</span>
                                    <span className={styles.toggleDescription}>Receive weekly financial summaries</span>
                                </div>
                                <label className={styles.toggle}>
                                    <input
                                        type="checkbox"
                                        checked={notifications.weeklyReport}
                                        onChange={(e) => setNotifications({ ...notifications, weeklyReport: e.target.checked })}
                                    />
                                    <span className={styles.toggleSlider} />
                                </label>
                            </div>
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
                                className={`${styles.themeOption} ${!isDarkMode ? styles.active : ''}`}
                                onClick={() => setIsDarkMode(false)}
                            >
                                <SunIcon className={styles.themeIcon} />
                                <span>Light</span>
                            </button>
                            <button
                                className={`${styles.themeOption} ${isDarkMode ? styles.active : ''}`}
                                onClick={() => setIsDarkMode(true)}
                            >
                                <MoonIcon className={styles.themeIcon} />
                                <span>Dark</span>
                            </button>
                        </div>

                        <div className={styles.colorSection}>
                            <h3 className={styles.colorTitle}>Accent Color</h3>
                            <div className={styles.colorOptions}>
                                {['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'].map((color) => (
                                    <button
                                        key={color}
                                        className={`${styles.colorOption} ${color === '#6366F1' ? styles.selected : ''}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                );

            case 'security':
                return (
                    <div className={styles.sectionContent}>
                        <h2 className={styles.sectionTitle}>Security</h2>
                        <p className={styles.sectionDescription}>Manage your password and security settings</p>

                        <Card className={styles.securityCard}>
                            <div className={styles.securityItem}>
                                <div className={styles.securityInfo}>
                                    <span className={styles.securityTitle}>Password</span>
                                    <span className={styles.securityDescription}>Last changed 30 days ago</span>
                                </div>
                                <Button variant="secondary" size="sm">Change</Button>
                            </div>
                        </Card>

                        <Card className={styles.securityCard}>
                            <div className={styles.securityItem}>
                                <div className={styles.securityInfo}>
                                    <span className={styles.securityTitle}>Two-Factor Authentication</span>
                                    <span className={styles.securityDescription}>Add an extra layer of security</span>
                                </div>
                                <Button variant="secondary" size="sm">Enable</Button>
                            </div>
                        </Card>

                        <Card className={styles.securityCard}>
                            <div className={styles.securityItem}>
                                <div className={styles.securityInfo}>
                                    <span className={styles.securityTitle}>Active Sessions</span>
                                    <span className={styles.securityDescription}>Manage your logged-in devices</span>
                                </div>
                                <Button variant="secondary" size="sm">View</Button>
                            </div>
                        </Card>
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

                                <button className={`${styles.navItem} ${styles.danger}`}>
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
