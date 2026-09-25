import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CrawlLogService } from '../crawl-log/crawl-log.service';
import { CrawlerService } from '../crawler/crawler.service';
import { DocumentService } from '../document/document.service';
import { SiteService } from '../site/site.service';
import { Snapshot } from './entities/snapshot.entity';
import { SnapshotService } from './snapshot.service';

describe('SnapshotService', () => {
  let service: SnapshotService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotService,
        {
          provide: getModelToken(Snapshot.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: SiteService,
          useValue: {
            findOne: jest.fn(),
            updateLastSnapshot: jest.fn(),
          },
        },
        {
          provide: CrawlerService,
          useValue: {
            enqueueCrawlJob: jest.fn(),
          },
        },
        {
          provide: DocumentService,
          useValue: {
            deleteManyBySnapshot: jest.fn(),
          },
        },
        {
          provide: CrawlLogService,
          useValue: {
            deleteManyBySnapshot: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SnapshotService>(SnapshotService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
