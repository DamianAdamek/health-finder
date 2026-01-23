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
  let mockFormRepository: any;
  let mockOpinionRepository: any;
  let mockUserManagementService: any;
  let mockSchedulingService: any;
  let mockRecommendationService: any;

  beforeEach(async () => {
    // Reset all mocks before each test
    mockFormRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockOpinionRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      save: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    mockUserManagementService = {
      clientExists: jest.fn(),
      updateClient: jest.fn(),
      trainerExists: jest.fn(),
    };

    mockSchedulingService = {
      getTraining: jest.fn(),
      clientHasCompletedWithTrainer: jest.fn(),
    };

    mockRecommendationService = {
      recommendLocations: jest.fn(),
      recommendTrainings: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EngagementService,
        {
          provide: getRepositoryToken(Form),
          useValue: mockFormRepository,
        },
        {
          provide: getRepositoryToken(Opinion),
          useValue: mockOpinionRepository,
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

  describe('createOpinion', () => {
    it('should create opinion when all conditions are met', async () => {
      const createOpinionDto = {
        clientId: 1,
        trainerId: 2,
        rating: 5,
        comment: 'Excellent trainer!',
      };

      const savedOpinion = {
        opinionId: 1,
        ...createOpinionDto,
        createdAt: new Date(),
      };

      mockUserManagementService.clientExists.mockResolvedValue(true);
      mockUserManagementService.trainerExists.mockResolvedValue(true);
      mockSchedulingService.clientHasCompletedWithTrainer.mockResolvedValue(true);
      mockOpinionRepository.create.mockReturnValue(createOpinionDto);
      mockOpinionRepository.save.mockResolvedValue(savedOpinion);

      const result = await service.createOpinion(createOpinionDto);

      expect(mockUserManagementService.clientExists).toHaveBeenCalledWith(1);
      expect(mockUserManagementService.trainerExists).toHaveBeenCalledWith(2);
      expect(mockSchedulingService.clientHasCompletedWithTrainer).toHaveBeenCalledWith(1, 2);
      expect(mockOpinionRepository.create).toHaveBeenCalledWith(createOpinionDto);
      expect(mockOpinionRepository.save).toHaveBeenCalledWith(createOpinionDto);
      expect(result).toEqual(savedOpinion);
    });

    it('should throw NotFoundException when client does not exist', async () => {
      const createOpinionDto = {
        clientId: 999,
        trainerId: 2,
        rating: 5,
        comment: 'Great!',
      };

      mockUserManagementService.clientExists.mockResolvedValue(false);

      await expect(service.createOpinion(createOpinionDto))
        .rejects
        .toThrow('Client with ID 999 does not exist');

      expect(mockUserManagementService.clientExists).toHaveBeenCalledWith(999);
      expect(mockUserManagementService.trainerExists).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when trainer does not exist', async () => {
      const createOpinionDto = {
        clientId: 1,
        trainerId: 999,
        rating: 5,
        comment: 'Great!',
      };

      mockUserManagementService.clientExists.mockResolvedValue(true);
      mockUserManagementService.trainerExists.mockResolvedValue(false);

      await expect(service.createOpinion(createOpinionDto))
        .rejects
        .toThrow('Trainer with ID 999 does not exist');

      expect(mockUserManagementService.clientExists).toHaveBeenCalledWith(1);
      expect(mockUserManagementService.trainerExists).toHaveBeenCalledWith(999);
    });

    it('should throw BadRequestException when client has not completed training with trainer', async () => {
      const createOpinionDto = {
        clientId: 1,
        trainerId: 2,
        rating: 5,
        comment: 'Great!',
      };

      mockUserManagementService.clientExists.mockResolvedValue(true);
      mockUserManagementService.trainerExists.mockResolvedValue(true);
      mockSchedulingService.clientHasCompletedWithTrainer.mockResolvedValue(false);

      await expect(service.createOpinion(createOpinionDto))
        .rejects
        .toThrow('Client must have at least one completed training with this trainer to leave an opinion');

      expect(mockSchedulingService.clientHasCompletedWithTrainer).toHaveBeenCalledWith(1, 2);
      expect(mockOpinionRepository.save).not.toHaveBeenCalled();
    });

    it('should accept valid rating range (1-5)', async () => {
      const ratings = [1, 2, 3, 4, 5];

      for (const rating of ratings) {
        const createOpinionDto = {
          clientId: 1,
          trainerId: 2,
          rating,
          comment: `Rating ${rating}`,
        };

        mockUserManagementService.clientExists.mockResolvedValue(true);
        mockUserManagementService.trainerExists.mockResolvedValue(true);
        mockSchedulingService.clientHasCompletedWithTrainer.mockResolvedValue(true);
        mockOpinionRepository.create.mockReturnValue(createOpinionDto);
        mockOpinionRepository.save.mockResolvedValue({ opinionId: 1, ...createOpinionDto });

        const result = await service.createOpinion(createOpinionDto);

        expect(result.rating).toBe(rating);
      }
    });
  });

  describe('updateOpinion', () => {
    it('should update opinion successfully', async () => {
      const existingOpinion = {
        opinionId: 1,
        clientId: 1,
        trainerId: 2,
        rating: 3,
        comment: 'Good',
      };

      const updateDto = {
        rating: 5,
        comment: 'Excellent after more sessions!',
      };

      const updatedOpinion = {
        ...existingOpinion,
        ...updateDto,
      };

      mockOpinionRepository.findOne.mockResolvedValue(existingOpinion);
      mockOpinionRepository.save.mockResolvedValue(updatedOpinion);

      const result = await service.updateOpinion(1, updateDto);

      expect(mockOpinionRepository.findOne).toHaveBeenCalledWith({ where: { opinionId: 1 } });
      expect(mockOpinionRepository.save).toHaveBeenCalled();
      expect(result.rating).toBe(5);
      expect(result.comment).toBe('Excellent after more sessions!');
    });

    it('should throw NotFoundException when opinion does not exist', async () => {
      mockOpinionRepository.findOne.mockResolvedValue(null);

      await expect(service.updateOpinion(999, { rating: 5 }))
        .rejects
        .toThrow('Opinion with ID 999 not found');
    });
  });

  describe('removeOpinion', () => {
    it('should remove opinion successfully', async () => {
      const opinion = {
        opinionId: 1,
        clientId: 1,
        trainerId: 2,
        rating: 5,
      };

      mockOpinionRepository.findOne.mockResolvedValue(opinion);
      mockOpinionRepository.remove.mockResolvedValue(opinion);

      await service.removeOpinion(1);

      expect(mockOpinionRepository.findOne).toHaveBeenCalledWith({ where: { opinionId: 1 } });
      expect(mockOpinionRepository.remove).toHaveBeenCalledWith(opinion);
    });

    it('should throw NotFoundException when trying to remove non-existent opinion', async () => {
      mockOpinionRepository.findOne.mockResolvedValue(null);

      await expect(service.removeOpinion(999))
        .rejects
        .toThrow('Opinion with ID 999 not found');

      expect(mockOpinionRepository.remove).not.toHaveBeenCalled();
    });
  });
});
