-- Migration: Add currency column to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS currency VARCHAR(3) DEFAULT 'USD';

CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);
