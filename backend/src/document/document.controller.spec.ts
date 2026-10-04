import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyGuard } from '../shared/guards/api-key.guard';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';

describe('DocumentController', () => {
  let controller: DocumentController;

  const mockDocumentService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    searchPublic: jest.fn(),
    search: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentController],
      providers: [
        {
          provide: DocumentService,
          useValue: mockDocumentService,
        },
      ],
    })
      .overrideGuard(ApiKeyGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DocumentController>(DocumentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call documentService.search', async () => {
    const userId = '66f000000000000000000001' as any;
    const query = { q: 'test', page: 1, limit: 10 } as any;
    mockDocumentService.search.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
    });

    const result = await controller.search(userId, query);

    expect(mockDocumentService.search).toHaveBeenCalledWith(userId, query);
    expect(result.items).toEqual([]);
  });
});
