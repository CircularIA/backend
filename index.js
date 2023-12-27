import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import { config } from 'dotenv';
import compression from 'compression';
//Routes
import userRoutes from './routes/users.js';
import companyRoutes from './routes/company.js';

const branchRoutes = require('./routes/branch');
const authRoutes = require('./routes/auth').default;
const indicatorRoutes = require('./routes/indicator');
const inputDatRoutes = require('./routes/inputDats');
const mailRoutes = require('./routes/mail');


//Define the environment
const app = express();
app.use(compression({
    level: 6,
    threshold: 0,
    filter: (req, res) => {
        if (req.headers['x-no-compression']) return false;
        return compression.filter(req, res);
    }
}));


const corsOptions = {
    credentials: true,
    origin: process.env.FRONTEND_URL,
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

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
