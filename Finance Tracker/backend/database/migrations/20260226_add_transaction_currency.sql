-- Migration: Add currency support to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS exchange_rate DECIMAL(18, 6) DEFAULT 1.0;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS original_amount DECIMAL(18, 2);
