import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // For development purposes, enable CORS
  // Enable CORS
  app.enableCors({
    origin: [ 'http://localhost:3000', 'http://localhost:3001', 'http://localhost' ], // Allow requests from this origin
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allow these HTTP methods
    credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  });

  const config = new DocumentBuilder()
    .setTitle('Total Cost of Ownership API')
    .setDescription('API for managing team spend records and authentication')
    .setVersion('1.0')
    .addTag('team-spend')
    .addTag('Authentication')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // Log application URL and port
  const url = await app.getUrl();
  console.log(`🚀 Application is running on: ${url}`);
  console.log(`📝 API documentation available at: ${url}/api`);
}
bootstrap();
