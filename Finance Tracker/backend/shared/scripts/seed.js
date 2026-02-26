require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const { pool } = require('../config/db');

const DEFAULT_CATEGORIES = [
    { name: 'Housing', icon: 'home', color: '#EF4444', type: 'expense' },
    { name: 'Food', icon: 'utensils', color: '#F59E0B', type: 'expense' },
    { name: 'Transportation', icon: 'car', color: '#3B82F6', type: 'expense' },
    { name: 'Entertainment', icon: 'play', color: '#8B5CF6', type: 'expense' },
    { name: 'Utilities', icon: 'bolt', color: '#10B981', type: 'expense' },
    { name: 'Shopping', icon: 'shopping-bag', color: '#EC4899', type: 'expense' },
    { name: 'Health', icon: 'heart', color: '#F87171', type: 'expense' },
    { name: 'Education', icon: 'graduation-cap', color: '#6366F1', type: 'expense' },
    { name: 'Investments', icon: 'trending-up', color: '#10B981', type: 'expense' },
    { name: 'Income', icon: 'dollar-sign', color: '#10B981', type: 'income' },
    { name: 'Savings', icon: 'piggy-bank', color: '#3B82F6', type: 'transfer' },
    { name: 'Miscellaneous', icon: 'help-circle', color: '#6B7280', type: 'expense' }
];

async function seed() {
    const client = await pool.connect();
    try {
        console.log('Starting seeding...');

        // 1. Seed Categories
        console.log('Seeding default categories...');
        for (const cat of DEFAULT_CATEGORIES) {
            await client.query(`
                INSERT INTO categories (name, icon, color, type, is_default)
                VALUES ($1, $2, $3, $4, $5)
                ON CONFLICT DO NOTHING;
            `, [cat.name, cat.icon, cat.color, cat.type, true]);
        }
        console.log('Categories seeded.');

        // 2. Optionally Create a Test User (Admin/Demo)
        // Check if any user exists
        const { rows: users } = await client.query('SELECT count(*) FROM users');
        if (parseInt(users[0].count) === 0) {
            console.log('No users found. Creating demo user...');
            const demoUserQuery = `
                INSERT INTO users (
                    email, password_hash, first_name, last_name, role, email_verified
                )
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id;
            `;
            // password is 'password123' hashed (mocking for seed)
            // In a real scenario, we should use bcrypt here, but for simple seeding:
            const demoUserId = '00000000-0000-0000-0000-000000000000'; // Specific UUID for demo? 
            // Or just let it generate one.
            const res = await client.query(demoUserQuery, [
                'demo@example.com',
                '$2b$10$YourHashedPasswordHere', // placeholder, user should change it
                'Demo',
                'User',
                'admin',
                true
            ]);
            console.log('Demo user created:', res.rows[0].id);
        }

        console.log('Seeding completed successfully.');
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

seed();
