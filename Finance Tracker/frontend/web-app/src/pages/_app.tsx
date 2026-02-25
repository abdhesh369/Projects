import type { AppProps } from 'next/app';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import '../styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function App({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                    <title>Finance Tracker</title>
                </Head>
                <main className={inter.className}>
                    <Component {...pageProps} />
                </main>
            </ThemeProvider>
        </AuthProvider>
    );
}
