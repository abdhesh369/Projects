CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    icon VARCHAR(50),
    color VARCHAR(7) DEFAULT '#000000',
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_name ON categories(name);

-- Default categories
INSERT INTO categories (name, icon, color, type, is_default) VALUES
('Salary', 'salary', '#4ade80', 'income', TRUE),
('Freelance', 'freelance', '#34d399', 'income', TRUE),
('Investments', 'investments', '#fbbf24', 'income', TRUE),
('Rent', 'rent', '#ef4444', 'expense', TRUE),
('Groceries', 'groceries', '#f97316', 'expense', TRUE),
('Utilities', 'utilities', '#3b82f6', 'expense', TRUE),
('Transport', 'transport', '#8b5cf6', 'expense', TRUE),
('Entertainment', 'entertainment', '#ec4899', 'expense', TRUE),
('Health', 'health', '#10b981', 'expense', TRUE),
('Dining', 'dining', '#f59e0b', 'expense', TRUE),
('Shopping', 'shopping', '#6366f1', 'expense', TRUE),
('Other', 'other', '#94a3b8', 'expense', TRUE);
