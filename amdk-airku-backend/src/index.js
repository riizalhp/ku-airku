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

const app = express();

// Disable ETag caching to ensure fresh data on every request
app.disable('etag');

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'https://ku-airku.vercel.app',
  'https://ku-airku-production.up.railway.app'
];

// CORS middleware
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200
};

// Pasang di paling atas sebelum route
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Tangani preflight di semua route

// Middleware parser
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));

// Tambahan: manual handler untuk semua OPTIONS (backup)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

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
      const isMatch = await bcrypt.compare(defaultPassword, existingAdmin.password);
      if (!isMatch && existingAdmin.password === defaultPassword) {
        console.log(`Password for '${adminEmail}' is not hashed. Fixing...`);
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        await connection.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, existingAdmin.id]);
        console.log(`Password for '${adminEmail}' has been securely updated.`);
      }
    }
  } catch (err) {
    console.error('An error occurred during the admin account seeding process:', err);
  }
};

// --- Test Database Connection & Seed Admin ---
pool.getConnection()
  .then(async (conn) => {
    console.log('Successfully connected to database.');
    await seedAdminAccount(conn);
    conn.release();
  })
  .catch((err) => {
    console.error('Error connecting to database:', err.stack);
  });

// --- API Routes ---
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

// --- Test Route ---
app.get('/', (req, res) => {
  res.send('AMDK Airku Backend is running!');
});

// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
