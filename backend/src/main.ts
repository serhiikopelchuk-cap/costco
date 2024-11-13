import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // For development purposes, enable CORS
  // Enable CORS
  app.enableCors({
    origin: [ 'http://localhost:3000', 'http://localhost' ], // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  });

  const config = new DocumentBuilder()
    .setTitle('Team Spend API')
    .setDescription('API for managing team spend records')
    .setVersion('1.0')
    .addTag('team-spend')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
