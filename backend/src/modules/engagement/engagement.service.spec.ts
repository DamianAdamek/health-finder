import { Test, TestingModule } from '@nestjs/testing';
import { EngagementService } from './engagement.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { Opinion } from './entities/opinion.entity';
import { UserManagementService } from '../user-management/user-management.service';
import { SchedulingService } from '../scheduling/scheduling.service';
import { RecommendationService } from '../scheduling/recommendation.service';

describe('EngagementService', () => {
  let service: EngagementService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockUserManagementService = {
    clientExists: jest.fn(),
    updateClient: jest.fn(),
  };

  const mockSchedulingService = {
    getTraining: jest.fn(),
  };

  const mockRecommendationService = {
    recommendLocations: jest.fn(),
    recommendTrainings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngagementService,
        {
          provide: getRepositoryToken(Form),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Opinion),
          useValue: mockRepository,
        },
        {
          provide: UserManagementService,
          useValue: mockUserManagementService,
        },
        {
          provide: SchedulingService,
          useValue: mockSchedulingService,
        },
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
      ],
    }).compile();

    service = module.get<EngagementService>(EngagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
