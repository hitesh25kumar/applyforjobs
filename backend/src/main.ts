import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as express from 'express';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { ValidationPipe } from './common/validation.pipe';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configuredCorsOrigins = process.env.CORS_ORIGINS
    ?.split(',')
    .map((origin) => origin.trim())
    .filter(Boolean) || ['http://localhost:5173', 'http://localhost:5174'];
  const corsOrigins = [
    ...new Set([...configuredCorsOrigins, 'https://applyforjobs.web.app']),
  ];

  // Enable CORS for frontend
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
  });

  // Increase body size limit for file uploads
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());

  // Health check endpoint
  app.use('/health', (req: express.Request, res: express.Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    });
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}. Gracefully shutting down...`);
    await app.close();
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  const port = Number(process.env.PORT) || 3001;
  await app.listen(port, '0.0.0.0');
  logger.log(`Application is running on port ${port}`);
  logger.log(`Health check available at /health`);
}
bootstrap();

