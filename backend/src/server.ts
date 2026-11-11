
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.json({message: 'DevSetup backend is running!'});
});

// Health check route
app.get('/api/health', (req, res) => {
  res.json({status: 'OK', message: 'Backend is healthy'});
});

app.listen(PORT, () => {
  console.log(`DevSetup backend running on port ${PORT}`);
});
