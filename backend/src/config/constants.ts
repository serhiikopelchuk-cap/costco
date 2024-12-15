import { config } from 'dotenv';

// Load environment variables
config();

export const {
  NODE_ENV = 'development',
  FRONTEND_URL = 'http://localhost:3001',
  BACKEND_URL = 'http://localhost:3000',
  JWT_SECRET = 'your-secret-key',
} = process.env;

export const isDevelopment = NODE_ENV === 'development';