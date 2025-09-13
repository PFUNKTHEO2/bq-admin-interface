import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import datasetsRouter from './routes/datasets';

// Load environment variables
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Register API routes ONLY under /api prefix
app.use('/api', datasetsRouter);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// 404 handler for unmatched routes
app.use('*', (req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

export default app;