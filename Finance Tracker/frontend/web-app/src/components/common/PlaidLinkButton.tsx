import React, { useState, useEffect, useCallback } from 'react';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';
import { Button } from './Button';
import { LinkIcon } from '@heroicons/react/24/outline';
import { plaidService } from '../../services/plaidService';

interface PlaidLinkButtonProps {
    onSuccessCallback?: () => void;
}

export const PlaidLinkButton: React.FC<PlaidLinkButtonProps> = ({ onSuccessCallback }) => {
    const [linkToken, setLinkToken] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const generateToken = async () => {
            setIsGenerating(true);
            try {
                const token = await plaidService.createLinkToken();
                setLinkToken(token);
            } catch (err) {
                console.error("Error generating Plaid link token:", err);
                setError("Failed to initialize bank linking.");
            } finally {
                setIsGenerating(false);
            }
        };

        generateToken();
    }, []);

    const onSuccess = useCallback<PlaidLinkOnSuccess>(async (publicToken, metadata) => {
        try {
            const institutionId = metadata.institution?.institution_id || "unknown_id";
            const institutionName = metadata.institution?.name || "Unknown Bank";

            await plaidService.exchangePublicToken(publicToken, institutionId, institutionName);
            if (onSuccessCallback) {
                onSuccessCallback();
            }
        } catch (err) {
            console.error("Failed to exchange public token", err);
            alert('Failed to securely link bank account.');
        }
    }, [onSuccessCallback]);

    const config: PlaidLinkOptions = {
        token: linkToken!,
        onSuccess,
        // Optional parameters can be added here
    };

    const { open, ready } = usePlaidLink(config);

    if (error) {
        return <Button variant="secondary" disabled>{error}</Button>;
    }

    return (
        <Button
            variant="primary"
            leftIcon={<LinkIcon />}
            onClick={() => open()}
            disabled={!ready || !linkToken || isGenerating}
            isLoading={isGenerating}
        >
            Link Bank Account
        </Button>
    );
};
