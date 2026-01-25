import { Test, TestingModule } from '@nestjs/testing';
import { EngagementService } from './engagement.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { Opinion } from './entities/opinion.entity';
import { CompletedTraining } from '../scheduling/entities/completed-training.entity';
import { UserManagementService } from '../user-management/user-management.service';
import { SchedulingService } from '../scheduling/scheduling.service';
import { RecommendationService } from '../scheduling/recommendation.service';
import { ActivityLevel, TrainingType } from '../../common/enums';

describe('EngagementService', () => {
  let service: EngagementService;
  let mockFormRepository: any;
  let mockOpinionRepository: any;
  let mockCompletedTrainingRepository: any;
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

    mockCompletedTrainingRepository = {
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
      updateTrainer: jest.fn(),
    };

    mockSchedulingService = {
      getTraining: jest.fn(),
      clientHasCompletedWithTrainer: jest.fn(),
    };

    mockRecommendationService = {
      recommendLocations: jest.fn(),
      recommendTrainings: jest.fn(),
      recomputeRecommendationsForClient: jest.fn(),
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
          provide: getRepositoryToken(CompletedTraining),
          useValue: mockCompletedTrainingRepository,
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

  describe('updateForm', () => {
    it('should update form and recompute recommendations', async () => {
      const existingForm = {
        formId: 1,
        clientId: 5,
        activityLevel: ActivityLevel.MEDIUM,
        trainingTypes: [TrainingType.CARDIO],
        trainingGoal: 'Lose weight',
        healthProfile: 'None',
      };

      const updateDto = {
        activityLevel: ActivityLevel.HIGH,
        trainingTypes: [TrainingType.BODYBUILDING, TrainingType.CARDIO],
        trainingGoal: 'Gain muscle',
        healthProfile: 'Knees ok',
      };

      const savedForm = { ...existingForm, ...updateDto };

      mockFormRepository.findOne.mockResolvedValue(existingForm);
      mockFormRepository.save.mockResolvedValue(savedForm);
      mockRecommendationService.recomputeRecommendationsForClient.mockResolvedValue(undefined);

      const result = await service.updateForm(1, updateDto);

      expect(mockFormRepository.findOne).toHaveBeenCalledWith({ where: { formId: 1 } });
      expect(mockFormRepository.save).toHaveBeenCalledWith(savedForm);
      expect(mockRecommendationService.recomputeRecommendationsForClient).toHaveBeenCalledWith(5);
      expect(result.activityLevel).toBe(ActivityLevel.HIGH);
      expect(result.trainingTypes).toEqual([TrainingType.BODYBUILDING, TrainingType.CARDIO]);
      expect(result.trainingGoal).toBe('Gain muscle');
      expect(result.healthProfile).toBe('Knees ok');
    });

    it('should throw NotFoundException when form does not exist', async () => {
      mockFormRepository.findOne.mockResolvedValue(null);

      await expect(service.updateForm(999, { trainingGoal: 'anything' }))
        .rejects
        .toThrow('Form with ID 999 not found');

      expect(mockFormRepository.save).not.toHaveBeenCalled();
      expect(mockRecommendationService.recomputeRecommendationsForClient).not.toHaveBeenCalled();
    });

    it('should still return saved form when recommendation recompute fails', async () => {
      const existingForm = {
        formId: 1,
        clientId: 5,
        activityLevel: ActivityLevel.MEDIUM,
        trainingTypes: [TrainingType.CARDIO],
        trainingGoal: 'Lose weight',
      };

      const updateDto = { trainingGoal: 'Gain muscle' };
      const savedForm = { ...existingForm, ...updateDto };

      mockFormRepository.findOne.mockResolvedValue(existingForm);
      mockFormRepository.save.mockResolvedValue(savedForm);
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockRecommendationService.recomputeRecommendationsForClient.mockRejectedValue(new Error('Recompute failed'));

      const result = await service.updateForm(1, updateDto);

      expect(mockFormRepository.save).toHaveBeenCalledWith(savedForm);
      expect(mockRecommendationService.recomputeRecommendationsForClient).toHaveBeenCalledWith(5);
      expect(result).toEqual(savedForm);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
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

      const completedTraining = {
        completedTrainingId: 1,
        clientId: 1,
        trainerId: 2,
        price: 100,
        type: TrainingType.CARDIO,
        trainingDate: new Date(),
      };

      mockUserManagementService.clientExists.mockResolvedValue(true);
      mockUserManagementService.trainerExists.mockResolvedValue(true);
      mockUserManagementService.updateTrainer.mockResolvedValue({ trainerId: 2, rating: 5 });
      mockOpinionRepository.findOne.mockResolvedValue(null); // For checking duplicate opinions
      mockOpinionRepository.find.mockResolvedValue([savedOpinion]); // For updateTrainerRating
      mockOpinionRepository.create.mockReturnValue(createOpinionDto);
      mockOpinionRepository.save.mockResolvedValue(savedOpinion);
      // Mock the completedTrainingRepository method
      mockCompletedTrainingRepository.findOne.mockResolvedValue(completedTraining);

      const result = await service.createOpinion(createOpinionDto);

      expect(mockUserManagementService.clientExists).toHaveBeenCalledWith(1);
      expect(mockUserManagementService.trainerExists).toHaveBeenCalledWith(2);
      expect(mockOpinionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          rating: 5,
          comment: 'Excellent trainer!',
          clientId: 1,
          trainerId: 2,
        })
      );
      expect(mockOpinionRepository.save).toHaveBeenCalled();
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
      // No completed training found
      mockCompletedTrainingRepository.findOne.mockResolvedValue(null);

      await expect(service.createOpinion(createOpinionDto))
        .rejects
        .toThrow('Client must have at least one completed training with this trainer to leave an opinion');

      expect(mockOpinionRepository.save).not.toHaveBeenCalled();
    });

    it('should accept valid rating range (1-5)', async () => {
      const ratings = [1, 2, 3, 4, 5];

      const completedTraining = {
        completedTrainingId: 1,
        clientId: 1,
        trainerId: 2,
        price: 100,
        type: TrainingType.CARDIO,
        trainingDate: new Date(),
      };

      mockCompletedTrainingRepository.findOne.mockResolvedValue(completedTraining);

      for (const rating of ratings) {
        const createOpinionDto = {
          clientId: 1,
          trainerId: 2,
          rating,
          comment: `Rating ${rating}`,
        };

        mockUserManagementService.clientExists.mockResolvedValue(true);
        mockUserManagementService.trainerExists.mockResolvedValue(true);
        mockUserManagementService.updateTrainer.mockResolvedValue({ trainerId: 2, rating });
        mockOpinionRepository.create.mockReturnValue(createOpinionDto);
        mockOpinionRepository.find.mockResolvedValue([{ opinionId: 1, ...createOpinionDto }]); // For updateTrainerRating
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
      mockOpinionRepository.find.mockResolvedValue([updatedOpinion]); // For updateTrainerRating
      mockOpinionRepository.save.mockResolvedValue(updatedOpinion);
      mockUserManagementService.updateTrainer.mockResolvedValue({ trainerId: 2, rating: 5 });

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
      mockOpinionRepository.find.mockResolvedValue([]); // For updateTrainerRating - empty after removal
      mockOpinionRepository.remove.mockResolvedValue(opinion);
      mockUserManagementService.updateTrainer.mockResolvedValue({ trainerId: 2, rating: 0 });

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
