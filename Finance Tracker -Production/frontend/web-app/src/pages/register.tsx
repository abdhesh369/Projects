import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserIcon, EnvelopeIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { Button, Input, Card } from '../components/common';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/Auth.module.css';

const registerSchema = z.object({
    firstName: z.string().min(2, 'First name is required'),
    lastName: z.string().min(2, 'Last name is required'),
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function Register() {
    const { register: registerUser } = useAuth();
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        setError,
    } = useForm<RegisterFormData>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterFormData) => {
        try {
            await registerUser(data);
        } catch (error) {
            setError('root', {
                message: 'Registration failed. Please try again.',
            });
        }
    };

    return (
        <>
            <Head>
                <title>Sign Up | Finance Tracker</title>
                <meta name="description" content="Create a new finance tracker account" />
            </Head>

            <div className={styles.container}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Create Account</h1>
                        <p className={styles.subtitle}>Start tracking your financial journey today</p>
                    </div>

                    <Card className={styles.authCard}>
                        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                            <div className={styles.row}>
                                <Input
                                    label="First Name"
                                    placeholder="John"
                                    leftIcon={<UserIcon />}
                                    error={errors.firstName?.message}
                                    {...register('firstName')}
                                />
                                <Input
                                    label="Last Name"
                                    placeholder="Doe"
                                    leftIcon={<UserIcon />}
                                    error={errors.lastName?.message}
                                    {...register('lastName')}
                                />
                            </div>

                            <Input
                                label="Email"
                                type="email"
                                placeholder="john@example.com"
                                leftIcon={<EnvelopeIcon />}
                                error={errors.email?.message}
                                {...register('email')}
                            />

                            <Input
                                label="Password"
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
                                Sign Up
                            </Button>
                        </form>

                        <div className={styles.footer}>
                            <p>
                                Already have an account?{' '}
                                <Link href="/login" className={styles.link}>
                                    Sign in
                                </Link>
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
}
