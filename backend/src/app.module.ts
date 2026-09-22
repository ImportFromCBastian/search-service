import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateEnv } from './config/env.validation';
import { CrawlLogModule } from './crawl-log/crawl-log.module';
import { CrawlerModule } from './crawler/crawler.module';
import { DocumentModule } from './document/document.module';
import { SiteModule } from './site/site.module';
import { SnapshotModule } from './snapshot/snapshot.module';

@Module({
  imports: [
    // 1. Configuración global validada con Zod
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),

    // 2. Conexión MongoDB validada e inyectada con ConfigService
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),

    // 3. Conexión Redis para BullMQ
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('REDIS_HOST', '127.0.0.1'),
          port: configService.get<number>('REDIS_PORT', 6379),
        },
      }),
      inject: [ConfigService],
    }),

    // 4. Módulos de dominio
    SiteModule,
    SnapshotModule,
    DocumentModule,
    CrawlLogModule,
    CrawlerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
