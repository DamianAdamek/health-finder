import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // <--- 1. IMPORT
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration - allow frontend requests
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, Accept',
    credentials: false, // We use Authorization header, not cookies
  });

  // Opcjonalnie: Prefiks globalny (np. localhost:3000/api/users)
  // app.setGlobalPrefix('api'); 

  // --- 2. KONFIGURACJA SWAGGERA ---
  const config = new DocumentBuilder()
    .setTitle('Health Finder API')
    .setDescription('System zarządzania siłownią i rezerwacjami')
    .setVersion('1.0')
    .addBearerAuth() // <--- Włącza przycisk "Authorize" w Swaggerze
    .build();

  const document = SwaggerModule.createDocument(app, config);
  
  // Dostęp pod adresem /api-docs (lub po prostu /api)
  SwaggerModule.setup('api', app, document);
  // -------------------------------

  // Global validation pipe: validates DTOs, strips unknown props and auto-transforms
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  await app.listen(3000);
}
bootstrap();