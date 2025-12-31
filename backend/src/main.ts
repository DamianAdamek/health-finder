import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'; // <--- 1. IMPORT
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Opcjonalnie: Prefiks globalny (np. localhost:3000/api/users)
  // app.setGlobalPrefix('api'); 

  // --- 2. KONFIGURACJA SWAGGERA ---
  const config = new DocumentBuilder()
    .setTitle('Health Finder API')
    .setDescription('System zarządzania siłownią i rezerwacjami')
    .setVersion('1.0')
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