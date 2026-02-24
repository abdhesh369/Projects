import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../components/common';
import styles from '../styles/Auth.module.css';

const forgotPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
    const [isSent, setIsSent] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const onSubmit = async (data: ForgotPasswordData) => {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        console.log('Reset password for:', data.email);
        setIsSent(true);
    };

    return (
        <>
            <Head>
                <title>Reset Password | Finance Tracker</title>
                <meta name="description" content="Reset your password" />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Reset Password</h1>
                        <p className={styles.subtitle}>Enter your email to receive recovery instructions</p>
                    </div>

                    <Card className={styles.authCard}>
                        {isSent ? (
                            <div className={styles.successState}>
                                <div className={styles.successIcon}>
                                    <EnvelopeIcon />
                                </div>
                                <h3>Check your email</h3>
                                <p>We've sent password reset instructions to your email address.</p>
                                <Link href="/login">
                                    <Button variant="secondary" fullWidth className={styles.backButton}>
                                        Back to Login
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                                <Input
                                    label="Email"
                                    type="email"
                                    placeholder="john@example.com"
                                    leftIcon={<EnvelopeIcon />}
                                    error={errors.email?.message}
                                    {...register('email')}
                                />

                                <Button
                                    type="submit"
                                    variant="primary"
                                    fullWidth
                                    size="lg"
                                    isLoading={isSubmitting}
                                    className={styles.submitButton}
                                >
                                    Send Reset Link
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
