import React from 'react';
import styles from './Card.module.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    padding?: 'none' | 'sm' | 'md' | 'lg';
    hover?: boolean;
    gradient?: boolean;
    onClick?: () => void;
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}

interface CardBodyProps {
    children: React.ReactNode;
    className?: string;
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> & {
    Header: React.FC<CardHeaderProps>;
    Body: React.FC<CardBodyProps>;
    Footer: React.FC<CardFooterProps>;
} = ({
    children,
    className = '',
    padding = 'md',
    hover = true,
    gradient = false,
    onClick
}) => {
        return (
            <div
                className={`
        ${styles.card} 
        ${styles[`padding-${padding}`]} 
        ${hover ? styles.hover : ''} 
        ${gradient ? styles.gradient : ''}
        ${onClick ? styles.clickable : ''}
        ${className}
      `.trim()}
                onClick={onClick}
                role={onClick ? 'button' : undefined}
                tabIndex={onClick ? 0 : undefined}
            >
                {gradient && <div className={styles.gradientBorder} />}
                {children}
            </div>
        );
    };

const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '', action }) => (
    <div className={`${styles.header} ${className}`}>
        <div className={styles.headerContent}>{children}</div>
        {action && <div className={styles.headerAction}>{action}</div>}
    </div>
);

const CardBody: React.FC<CardBodyProps> = ({ children, className = '' }) => (
    <div className={`${styles.body} ${className}`}>{children}</div>
);

const CardFooter: React.FC<CardFooterProps> = ({ children, className = '' }) => (
    <div className={`${styles.footer} ${className}`}>{children}</div>
);

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;

export default Card;
