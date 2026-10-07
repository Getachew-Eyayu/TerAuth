import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma from './prisma.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
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

bootstrap();
