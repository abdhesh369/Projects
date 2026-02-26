import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LockClosedIcon, CheckCircleIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../components/common';
import api from '../services/api';
import styles from '../styles/Auth.module.css';

const resetPasswordSchema = z.object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const router = useRouter();
    const { token } = router.query;
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ResetPasswordData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    const onSubmit = async (data: ResetPasswordData) => {
        if (!token) {
            setError('Invalid or missing reset token.');
            return;
        }

        try {
            await api.post('/api/auth/reset-password', {
                token,
                newPassword: data.password,
            });
            setIsSuccess(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reset password. The link may have expired.');
        }
    };

    if (!token && router.isReady) {
        return (
            <div className={styles.container}>
                <Card className={styles.authCard}>
                    <p className={styles.errorText}>Invalid reset link. Please request a new one.</p>
                    <Link href="/forgot-password">
                        <Button variant="secondary" fullWidth>Request New Link</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Create New Password | Finance Tracker</title>
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>New Password</h1>
                        <p className={styles.subtitle}>Create a secure password for your account</p>
                    </div>

                    <Card className={styles.authCard}>
                        {isSuccess ? (
                            <div className={styles.successState}>
                                <div className={styles.successIcon}>
                                    <CheckCircleIcon />
                                </div>
                                <h3>Password Reset!</h3>
                                <p>Your password has been successfully updated.</p>
                                <Link href="/login">
                                    <Button variant="primary" fullWidth className={styles.backButton}>
                                        Proceed to Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                                {error && <div className={styles.errorMessage}>{error}</div>}

                                <Input
                                    label="New Password"
                                    type="password"
                                    placeholder="••••••••"
                                    leftIcon={<LockClosedIcon />}
                                    error={errors.password?.message}
                                    {...register('password')}
                                />

                                <Input
                                    label="Confirm Password"
                                    type="password"
                                    placeholder="••••••••"
                                    leftIcon={<LockClosedIcon />}
                                    error={errors.confirmPassword?.message}
                                    {...register('confirmPassword')}
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    isLoading={isSubmitting}
                                    className={styles.submitButton}
                                >
                                    Reset Password
                                </Button>

                                <div className={styles.footerLink}>
                                    <Link href="/login" className={styles.backLink}>
                                        <ArrowLeftIcon className={styles.smallIcon} />
                                        <span>Back to Login</span>
                                    </Link>
                                </div>
                            </form>
                        )}
                    </Card>
                </div>
            </div>
        </>
    );
}
