import { Test, TestingModule } from '@nestjs/testing';
import { SchedulingController } from './scheduling.controller';
import { SchedulingService } from './scheduling.service';
import { RecommendationService } from './recommendation.service';

describe('SchedulingController', () => {
  let controller: SchedulingController;

  const mockSchedulingService = {
    createSchedule: jest.fn(),
    updateSchedule: jest.fn(),
    deleteSchedule: jest.fn(),
    getSchedule: jest.fn(),
    createWindow: jest.fn(),
    updateWindow: jest.fn(),
    deleteWindow: jest.fn(),
    getWindow: jest.fn(),
    createTraining: jest.fn(),
    updateTraining: jest.fn(),
    deleteTraining: jest.fn(),
    getTraining: jest.fn(),
    getAllTrainings: jest.fn(),
    getTrainingsByGym: jest.fn(),
  };

  const mockRecommendationService = {
    getRecommendationsForClient: jest.fn(),
    recomputeRecommendations: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SchedulingController],
      providers: [
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

    controller = module.get<SchedulingController>(SchedulingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
