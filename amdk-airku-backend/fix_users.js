require('dotenv').config();
const mysql = require('mysql2/promise');

async function fixUsersTable() {
    console.log('Connecting to database...');
    const connection = await mysql.createConnection({
        host: process.env.MYSQLHOST || 'localhost',
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQLPASSWORD || '',
        database: process.env.MYSQLDATABASE || 'amdk_airku',
        port: process.env.MYSQLPORT || 3306,
        multipleStatements: true
    });

    try {
        console.log('Disabling foreign key checks...');
        await connection.query('SET FOREIGN_KEY_CHECKS=0');

        console.log('Dropping users table if exists to ensure clean state...');
        await connection.query('DROP TABLE IF EXISTS `users`');

        console.log('Creating users table...');
        const createTableSql = `
        CREATE TABLE \`users\` (
            \`id\` varchar(36) NOT NULL,
            \`name\` varchar(255) NOT NULL,
            \`email\` varchar(255) NOT NULL,
            \`password\` varchar(255) NOT NULL,
            \`role\` enum('Admin', 'Sales', 'Driver') NOT NULL,
            PRIMARY KEY (\`id\`)
        ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
        `;
        await connection.query(createTableSql);

        console.log('Inserting default users...');
        const insertUsersSql = `
        INSERT INTO \`users\` (\`id\`, \`name\`, \`email\`, \`password\`, \`role\`) VALUES 
        ('79d62b55-981c-4f76-9703-546701161a96', 'Admin Utama', 'admin@kuairku.com', '$2a$10$dlXt951R4zxdg5JmVdJfB.dx7qJPVV8fdhRVHE.dFh76aMDgnX.aS', 'Admin'),
        ('a4ce23ab-2e0f-4556-b958-1e3d907decb2', 'Sales Utama', 'sales@kuairku.com', '$2a$10$h7Rk09IM16.ElVnvDk4B5.Bnv.QE4YkGTeblVKdUutBwyoNZNs/jm', 'Sales'),
        ('a93c1c9f-a76e-4b67-bc20-a39fa22d9466', 'Driver Utama', 'driver@kuairku.com', '$2a$10$yBhhw9NiFYGZIfsAkiRa1ezxbondCX/RMiP5fvjOjj8D96ntcT/DK', 'Driver');
        `;
        await connection.query(insertUsersSql);

        console.log('Users table fixed and seeded successfully.');
    } catch (err) {
        console.error('Error fixing users table:', err);
    } finally {
        await connection.end();
    }
}

fixUsersTable();
