import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma from './prisma.js';
import { validateJwtConfiguration } from './services/auth.service.js';

// Export the Express app so Vercel can invoke it as a serverless function.
export default app;

if (typeof module !== 'undefined' && module.exports) {
  module.exports = app;
  (module.exports as any).default = app;
}

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Validate required authentication configuration
    validateJwtConfiguration();

    // Test database connection
    await prisma.$connect();
    console.log(' Successfully connected to TerAuth database.');

    const server = app.listen(PORT, () => {
      console.log(` TerAuth API Server running on port ${PORT}`);
      console.log(` Health check: http://localhost:${PORT}/api/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\nReceived ${signal}. Shutting down gracefully...`);
      server.close(async () => {
        await prisma.$disconnect();
        console.log('Database disconnected. Process exiting.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start TerAuth server:', error);
    process.exit(1);
  }
}

// When deployed on Vercel serverless, Vercel invokes the exported app directly.
// In all other environments (local dev, Docker container, standalone VM), run bootstrap listener.
if (!process.env.VERCEL) {
  void bootstrap();
}
