require('dotenv').config({ path: require('path').join(__dirname, '../../../.env') });
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

async function migrate() {
    const client = await pool.connect();
    try {
        console.log('Starting migrations...');

        // 1. Create migration table if not exists
        await client.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id SERIAL PRIMARY KEY,
                filename VARCHAR(255) UNIQUE NOT NULL,
                applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // 2. Read migration files
        const migrationsDir = path.join(__dirname, '../../../database/postgresql/migrations');
        if (!fs.existsSync(migrationsDir)) {
            console.error(`Migration directory not found: ${migrationsDir}`);
            process.exit(1);
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        // 3. Get applied migrations
        const { rows: appliedRows } = await client.query('SELECT filename FROM schema_migrations');
        const appliedFiles = new Set(appliedRows.map(r => r.filename));

        // 4. Run new migrations
        for (const file of files) {
            if (!appliedFiles.has(file)) {
                console.log(`Applying migration: ${file}`);
                const filePath = path.join(migrationsDir, file);
                const sql = fs.readFileSync(filePath, 'utf8');

                // Using a transaction for each file
                await client.query('BEGIN');
                try {
                    await client.query(sql);
                    await client.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
                    await client.query('COMMIT');
                    console.log(`Successfully applied ${file}`);
                } catch (err) {
                    await client.query('ROLLBACK');
                    console.error(`Error applying ${file}:`, err);
                    throw err;
                }
            } else {
                console.log(`Skipping already applied migration: ${file}`);
            }
        }

        console.log('All migrations completed successfully.');
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    } finally {
        client.release();
        // Since this might be part of a larger script later, 
        // we might not want to end the pool here if we re-use it,
        // but for a standalone script it's good practice.
        await pool.end();
    }
}

migrate();
