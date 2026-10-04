import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { SiteService } from '../site/site.service';
import { DocumentService } from './document.service';
import { CrawlDocument } from './entities/document.entity';

describe('DocumentService', () => {
  let service: DocumentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentService,
        {
          provide: getModelToken(CrawlDocument.name),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            countDocuments: jest.fn(),
            deleteMany: jest.fn(),
          },
        },
        {
          provide: SiteService,
          useValue: {
            findById: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<DocumentService>(DocumentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('search', () => {
    it('should return empty items when user has no sites with published snapshots', async () => {
      const mockSiteService = (service as any).siteService;
      mockSiteService.findAllByUser = jest
        .fn()
        .mockResolvedValue([{ _id: 'site1', name: 'Site 1', publishedSnapshotId: null }]);

      const result = await service.search(new Types.ObjectId(), {
        q: 'nest',
        page: 1,
        limit: 10,
      } as any);

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should find documents and extract snippets when published snapshot exists', async () => {
      const siteId = new Types.ObjectId();
      const snapshotId = new Types.ObjectId();
      const mockSiteService = (service as any).siteService;
      mockSiteService.findAllByUser = jest
        .fn()
        .mockResolvedValue([{ _id: siteId, name: 'Mi Sitio', publishedSnapshotId: snapshotId }]);

      const mockDoc = {
        _id: new Types.ObjectId(),
        name: 'Guía de NestJS',
        url: 'https://example.com/guide',
        description: 'Aprende cómo usar NestJS para construir APIs robustas con TypeScript.',
        siteId,
        snapshotId,
        createdAt: new Date('2026-10-04T12:00:00Z'),
      };

      const mockModel = (service as any).documentModel;
      mockModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([mockDoc]),
              }),
            }),
          }),
        }),
      });
      mockModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.search(new Types.ObjectId(), {
        q: 'NestJS',
        page: 1,
        limit: 10,
      } as any);

      expect(result.total).toBe(1);
      expect(result.items.length).toBe(1);
      expect(result.items[0].siteName).toBe('Mi Sitio');
      expect(result.items[0].name).toBe('Guía de NestJS');
      expect(result.items[0].snippet).toBeDefined();
      expect(result.items[0].snippet?.match).toBe('NestJS');
    });

    it('should return empty list when no documents match the query', async () => {
      const siteId = new Types.ObjectId();
      const snapshotId = new Types.ObjectId();
      const mockSiteService = (service as any).siteService;
      mockSiteService.findAllByUser = jest
        .fn()
        .mockResolvedValue([{ _id: siteId, name: 'Mi Sitio', publishedSnapshotId: snapshotId }]);

      const mockModel = (service as any).documentModel;
      mockModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        }),
      });
      mockModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(0),
      });

      const result = await service.search(new Types.ObjectId(), {
        q: 'termino_inexistente',
        page: 1,
        limit: 10,
      } as any);

      expect(result).toEqual({
        items: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });

    it('should calculate totalPages accurately for multi-page search results', async () => {
      const siteId = new Types.ObjectId();
      const snapshotId = new Types.ObjectId();
      const mockSiteService = (service as any).siteService;
      mockSiteService.findAllByUser = jest
        .fn()
        .mockResolvedValue([{ _id: siteId, name: 'Mi Sitio', publishedSnapshotId: snapshotId }]);

      const mockDocs = Array.from({ length: 10 }, (_, i) => ({
        _id: new Types.ObjectId(),
        name: `Documento ${i + 1}`,
        url: `https://example.com/doc-${i + 1}`,
        description: 'Texto de prueba con termino clave.',
        siteId,
        snapshotId,
        createdAt: new Date('2026-10-04T12:00:00Z'),
      }));

      const mockModel = (service as any).documentModel;
      mockModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockDocs),
              }),
            }),
          }),
        }),
      });
      mockModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(25),
      });

      const result = await service.search(new Types.ObjectId(), {
        q: 'termino',
        page: 2,
        limit: 10,
      } as any);

      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(3);
      expect(result.items.length).toBe(10);
    });

    it('should return snippet null when term is not present in description', async () => {
      const siteId = new Types.ObjectId();
      const snapshotId = new Types.ObjectId();
      const mockSiteService = (service as any).siteService;
      mockSiteService.findAllByUser = jest
        .fn()
        .mockResolvedValue([{ _id: siteId, name: 'Mi Sitio', publishedSnapshotId: snapshotId }]);

      const mockDoc = {
        _id: new Types.ObjectId(),
        name: 'Coincidencia en el titulo',
        url: 'https://example.com/doc',
        description: 'Descripcion sin la palabra buscada',
        siteId,
        snapshotId,
        createdAt: new Date('2026-10-04T12:00:00Z'),
      };

      const mockModel = (service as any).documentModel;
      mockModel.find = jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([mockDoc]),
              }),
            }),
          }),
        }),
      });
      mockModel.countDocuments = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(1),
      });

      const result = await service.search(new Types.ObjectId(), {
        q: 'titulo',
        page: 1,
        limit: 10,
      } as any);

      expect(result.items[0].snippet).toBeNull();
    });
  });
});
