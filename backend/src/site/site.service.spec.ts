import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { SnapshotService } from '../snapshot/snapshot.service';
import { Site } from './entities/site.entity';
import { SiteService } from './site.service';

describe('SiteService', () => {
  let service: SiteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        {
          provide: getModelToken(Site.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: SnapshotService,
          useValue: {
            createInitialForSite: jest.fn(),
            findAllBySite: jest.fn(),
            deleteManyBySite: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SiteService>(SiteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
