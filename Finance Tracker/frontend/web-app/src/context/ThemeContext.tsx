import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const [theme, setTheme] = useState<Theme>('dark');

    useEffect(() => {
        if (user && user.preferences?.theme) {
            setTheme(user.preferences.theme as Theme);
        } else {
            // Check local storage or system preference if no user
            const savedTheme = localStorage.getItem('theme') as Theme | null;
            if (savedTheme) {
                setTheme(savedTheme);
            } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
                setTheme('light');
            }
        }
    }, [user]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
