import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { cleanupOpenApiDoc, ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ZodValidationPipe());

  const config = new DocumentBuilder()
    .setTitle('Search Service API')
    .setDescription('Motor de búsqueda y crawling web multi-tenant con extracción configurable')
    .setVersion('0.0.1')
    .addTag('sites', 'Gestión de sitios web y sus configuraciones de crawler')
    .addTag('snapshots', 'Ejecuciones y estados históricos de rastreo')
    .addTag('documents', 'Consulta y búsqueda de documentos indexados')
    .addTag('crawl-logs', 'Trazabilidad y logs técnicos del crawler')
    .addApiKey({ type: 'apiKey', name: 'x-api-key', in: 'header' }, 'api-key')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  cleanupOpenApiDoc(document);

  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
