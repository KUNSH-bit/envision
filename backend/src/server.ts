
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

import {prisma} from './prisma.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Basic backend test
app.get('/', (req, res) => {
  res.json({message: 'DevSetup backend is running!'});
});

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({status: 'OK', message: 'Backend is healthy'});
});

// Database connection test
app.get('/api/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.json({status: 'OK', message: 'PostgreSQL connection successful!'});
  } catch (error) {
    console.error('Database connection failed:', error);

    res.status(500).json(
        {status: 'ERROR', message: 'Could not connect to PostgreSQL'});
  }
});

app.listen(PORT, () => {
  console.log(`DevSetup backend running on port ${PORT}`);
});
