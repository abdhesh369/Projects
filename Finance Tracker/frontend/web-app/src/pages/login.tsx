import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../components/common';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Auth.module.css';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
    const { login } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormData) => {
        try {
            await login(data);
        } catch (error) {
            setError('root', {
                message: 'Invalid email or password',
            });
        }
    };

    return (
        <>
            <Head>
                <title>Login | Finance Tracker</title>
                <meta name="description" content="Login to your finance tracker account" />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Welcome Back</h1>
                        <p className={styles.subtitle}>Sign in to continue managing your finances</p>
                    </div>

                    <Card className={styles.authCard}>
                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                            <Input
                                label="Email"
                                type="email"
                                placeholder="john@example.com"
                                leftIcon={<EnvelopeIcon />}
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <div className={styles.passwordWrapper}>
                                <Input
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    leftIcon={<LockClosedIcon />}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />
                                <Link href="/forgot-password" className={styles.forgotPassword}>
                                    Forgot password?
                                </Link>
                            </div>

                            {errors.root && (
                                <div className={styles.errorAlert}>{errors.root.message}</div>
                            )}

                            <Button
                                type="submit"
                                variant="primary"
                                fullWidth
                                size="lg"
                                isLoading={isSubmitting}
                                className={styles.submitButton}
                            >
                                Sign In
                            </Button>
                        </form>

                        <div className={styles.footer}>
                            <p>
                                Don't have an account?{' '}
                                <Link href="/register" className={styles.link}>
                                    Sign up
                                </Link>
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
