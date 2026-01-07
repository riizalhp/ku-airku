require('dotenv').config();
const fs = require('fs');
const mysql = require('mysql2/promise');
const path = require('path');

async function seed() {
    console.log('Starting seed process...');
    
    // Explicitly read the SQL file from the known location
    const sqlPath = path.resolve('d:\\ku-airku-master\\ku-airku-master\\amdk_airku_db.sql');
    
    if (!fs.existsSync(sqlPath)) {
        console.error(`SQL file not found at: ${sqlPath}`);
        process.exit(1);
    }

    const connection = await mysql.createConnection({
        host: process.env.MYSQLHOST || 'localhost',
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || '',
        database: process.env.MYSQLDATABASE || 'amdk_airku',
        port: process.env.MYSQLPORT || 3306,
        multipleStatements: true
    });

    console.log('Connected to database.');

    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log(`Read SQL file (${sql.length} bytes). Executing...`);

    try {
        await connection.query(sql);
        console.log('Database seeded successfully.');
    } catch (err) {
        console.error('Error seeding database:', err);
        process.exit(1);
    } finally {
        await connection.end();
    }
}

seed();
