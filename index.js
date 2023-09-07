require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const connection = require('./db');
const userRoutes = require('./routes/users');
const authRoutes = require('./routes/auth');
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
app.use('/api/mail', mailRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
