import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    HomeIcon,
    CreditCardIcon,
    BanknotesIcon,
    ChartBarIcon,
    FlagIcon,
    DocumentChartBarIcon,
    Cog6ToothIcon,
    Bars3Icon,
    XMarkIcon,
    BellIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { NotificationDropdown } from './NotificationDropdown';
import styles from './Layout.module.css';

interface LayoutProps {
    children: React.ReactNode;
}

interface NavItem {
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

const navigation: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: HomeIcon },
    { name: 'Transactions', href: '/transactions', icon: CreditCardIcon },
    { name: 'Accounts', href: '/accounts', icon: BanknotesIcon },
    { name: 'Budgets', href: '/budgets', icon: ChartBarIcon },
    { name: 'Goals', href: '/goals', icon: FlagIcon },
    { name: 'Reports', href: '/reports', icon: DocumentChartBarIcon },
];

const bottomNav: NavItem[] = [
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
];

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isActive = (href: string) => {
        if (href === '/') {
            return router.pathname === '/';
        }
        return router.pathname.startsWith(href);
    };

    return (
        <div className={styles.layout}>
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className={styles.overlay}
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
                <div className={styles.sidebarHeader}>
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logoIcon}>
                            <BanknotesIcon />
                        </div>
                        <span className={styles.logoText}>FinanceTracker</span>
                    </Link>
                    <button
                        className={styles.closeSidebar}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <XMarkIcon />
                    </button>
                </div>

                <nav className={styles.nav}>
                    <ul className={styles.navList}>
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className={styles.navIcon} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>

                    <ul className={styles.navList}>
                        {bottomNav.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`${styles.navLink} ${isActive(item.href) ? styles.active : ''}`}
                                    onClick={() => setSidebarOpen(false)}
                                >
                                    <item.icon className={styles.navIcon} />
                                    <span>{item.name}</span>
                                </Link>
                            </li>
                        ))}
                        <li>
                            <button className={styles.navLink}>
                                <ArrowRightOnRectangleIcon className={styles.navIcon} />
                                <span>Logout</span>
                            </button>
                        </li>
                    </ul>
                </nav>

                <div className={styles.userCard}>
                    <div className={styles.userAvatar}>
                        <span>JD</span>
                    </div>
                    <div className={styles.userInfo}>
                        <span className={styles.userName}>John Doe</span>
                        <span className={styles.userEmail}>john@example.com</span>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className={styles.main}>
                {/* Header */}
                <header className={styles.header}>
                    <button
                        className={styles.menuButton}
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon />
                    </button>

                    <div className={styles.headerRight}>
                        <NotificationDropdown />
                    </div>
                </header>

                {/* Page content */}
                <main className={styles.content}>
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
