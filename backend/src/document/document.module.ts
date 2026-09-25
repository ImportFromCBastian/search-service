import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ApiKeyGuard } from '../shared/guards/api-key.guard';
import { SiteModule } from '../site/site.module';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { CrawlDocument, CrawlDocumentSchema } from './entities/document.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CrawlDocument.name, schema: CrawlDocumentSchema }]),
    forwardRef(() => SiteModule),
  ],
  controllers: [DocumentController],
  providers: [DocumentService, ApiKeyGuard],
  exports: [DocumentService],
})
export class DocumentModule {}
