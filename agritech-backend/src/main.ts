import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend (Vite dev server)
  app.enableCors({
    origin: [
      'http://localhost:5173',   // Vite dev server
      'http://localhost:4173',   // Vite preview
      'http://localhost:3001',   // Alternative port
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
  });

  // Enable class-validator DTOs globally
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Global API prefix
  app.setGlobalPrefix('api/v1');

  await app.listen(process.env.PORT ?? 3000);
  console.log(`🌾 AgriConnect API running on http://localhost:${process.env.PORT ?? 3000}/api/v1`);
}
bootstrap();
