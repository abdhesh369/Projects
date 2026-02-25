-- Migration: Add plaid_transaction_id to transactions table
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS plaid_transaction_id VARCHAR(255);
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_plaid_id ON transactions(plaid_transaction_id);
