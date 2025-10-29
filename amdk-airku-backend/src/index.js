require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const User = require('./models/userModel');
const bcrypt = require('bcryptjs');

// Import routes
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const storeRoutes = require('./routes/stores');
const vehicleRoutes = require('./routes/vehicles');
const orderRoutes = require('./routes/orders');
const routeRoutes = require('./routes/routes');
const visitRoutes = require('./routes/visits');
const surveyRoutes = require('./routes/surveys');
const salesVisitRoutes = require('./routes/salesVisitRoutes');
const shipmentRoutes = require('./routes/shipments');

const app = express();

// Middleware
app.use(cors({ 
  origin: 'http://localhost:5173',
  credentials: true
}));
// Tingkatkan batas ukuran payload menjadi 5MB untuk unggahan gambar
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));


// --- Admin Seeder Function ---
const seedAdminAccount = async (connection) => {
    try {
        const adminEmail = 'admin@kuairku.com';
        const defaultPassword = '123';
        
        const existingAdmin = await User.findByEmail(adminEmail);

        if (!existingAdmin) {
            console.log(`Admin user '${adminEmail}' not found. Creating one with default password...`);
            await User.create({
                name: 'Admin Utama',
                email: adminEmail,
                role: 'Admin',
                password: defaultPassword
            });
            console.log(`Admin user '${adminEmail}' created successfully.`);
        } else {
            // This part handles the case where the user might have manually inserted 
            // a plain-text password, causing bcrypt.compare to fail.
            const isMatch = await bcrypt.compare(defaultPassword, existingAdmin.password);
            if (!isMatch && existingAdmin.password === defaultPassword) {
                console.log(`Password for '${adminEmail}' is not hashed. Fixing...`);
                const hashedPassword = await bcrypt.hash(defaultPassword, 10);
                await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, existingAdmin.id]);
                console.log(`Password for '${adminEmail}' has been securely updated.`);
            }
        }
    } catch (err) {
        // Avoid crashing the server for a seeding error, but log it.
        console.error('An error occurred during the admin account seeding process:', err);
    }
};

// Test database connection and seed admin on startup
pool.getConnection()
    .then(async conn => {
        console.log('Successfully connected to database.');
        
        // Run the seeder to ensure the admin account is usable
        await seedAdminAccount(conn);
        
        conn.release();
    })
    .catch(err => {
        console.error('Error connecting to database:', err.stack);
    });

// Define API routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/sales-routes', salesVisitRoutes);
app.use('/api/shipments', shipmentRoutes);


// Simple test route
app.get('/', (req, res) => {
    res.send('AMDK Airku Backend is running!');
});

// Global error handlers
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
