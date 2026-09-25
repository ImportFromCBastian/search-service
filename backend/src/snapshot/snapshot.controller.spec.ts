import { Test, TestingModule } from '@nestjs/testing';
import { SnapshotController } from './snapshot.controller';
import { SnapshotService } from './snapshot.service';

describe('SnapshotController', () => {
  let controller: SnapshotController;

  const mockSnapshotService = {
    create: jest.fn(),
    findOne: jest.fn(),
    cancel: jest.fn(),
    remove: jest.fn(),
    findAllBySite: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SnapshotController],
      providers: [
        {
          provide: SnapshotService,
          useValue: mockSnapshotService,
        },
      ],
    }).compile();

    controller = module.get<SnapshotController>(SnapshotController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
