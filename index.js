require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./db');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/company');
const branchRoutes = require('./routes/branch');
const authRoutes = require('./routes/auth');
const indicatorRoutes = require('./routes/indicator');
const inputDatRoutes = require('./routes/inputDats');
const mailRoutes = require('./routes/mail');

// Connect to database
connection();

const corsOptions = {
    credentials: true,
    origin: process.env.FRONTEND_ORIGIN
};

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/branch', branchRoutes);
app.use('/api/mail', mailRoutes);
app.use('/api/indicator', indicatorRoutes);
app.use('/api/inputDat', inputDatRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
