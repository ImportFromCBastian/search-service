import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyGuard } from '../shared/guards/api-key.guard';
import { Site, SiteSchema } from '../site/entities/site.entity';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { CrawlDocument, CrawlDocumentSchema } from './entities/document.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CrawlDocument.name, schema: CrawlDocumentSchema },
      { name: Site.name, schema: SiteSchema },
    ]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService, ApiKeyGuard],
  exports: [DocumentService],
})
export class DocumentModule {}
