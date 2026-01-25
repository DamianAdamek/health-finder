import { Test, TestingModule } from '@nestjs/testing';
import { EngagementController } from './engagement.controller';
import { EngagementService } from './engagement.service';

describe('EngagementController', () => {
  let controller: EngagementController;

  const mockEngagementService = {
    createForm: jest.fn(),
    updateForm: jest.fn(),
    deleteForm: jest.fn(),
    getFormByClient: jest.fn(),
    createOpinion: jest.fn(),
    updateOpinion: jest.fn(),
    deleteOpinion: jest.fn(),
    getOpinionsByTraining: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EngagementController],
      providers: [
        {
          provide: EngagementService,
          useValue: mockEngagementService,
        },
      ],
    }).compile();

    controller = module.get<EngagementController>(EngagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
