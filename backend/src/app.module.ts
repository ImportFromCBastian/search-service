import { Module } from '@nestjs/common';
// import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DocumentModule } from './document/document.module';
import { SiteModule } from './site/site.module';
import { SnapshotModule } from './snapshot/snapshot.module';

@Module({
  imports: [
    SiteModule,
    SnapshotModule,
    DocumentModule,
    // MongooseModule.forRoot('mongodb://localhost/nest'),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
