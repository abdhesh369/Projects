-- Migration: Create report_schedules table
-- Date: 2026-02-26

CREATE TABLE IF NOT EXISTS report_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    frequency VARCHAR(20) NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
    format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'csv')),
    email VARCHAR(255) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    next_run_at TIMESTAMP WITH TIME ZONE,
    last_run_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_report_schedules_user_id ON report_schedules(user_id);
CREATE INDEX idx_report_schedules_next_run_at ON report_schedules(next_run_at) WHERE status = 'active';

-- Trigger for updated_at
CREATE TRIGGER update_report_schedules_updated_at 
BEFORE UPDATE ON report_schedules 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
