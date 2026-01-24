import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import { UserManagementService } from './user-management.service';
import { User } from './entities/user.entity';
import { Trainer } from './entities/trainer.entity';
import { Client } from './entities/client.entity';
import { GymAdmin } from './entities/gym-admin.entity';
import { Gym } from '../facilities/entities/gym.entity';
import { Schedule } from '../scheduling/entities/schedule.entity';
import { Location } from '../facilities/entities/location.entity';
import { Form } from '../engagement/entities/form.entity';
import { RecommendationService } from '../scheduling/recommendation.service';

describe('UserManagementService', () => {
  let service: UserManagementService;
  let userRepository: any;
  let trainerRepository: any;
  let clientRepository: any;
  let gymAdminRepository: any;
  let gymRepository: any;
  let scheduleRepository: any;
  let locationRepository: any;
  let formRepository: any;
  let consoleErrorSpy: jest.SpyInstance;

  const createMockRepository = () => ({
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
    count: jest.fn(),
  });

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockRecommendationService = {
    recommendLocations: jest.fn(),
    recommendTrainings: jest.fn(),
    recomputeRecommendationsForClient: jest.fn(),
  };

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    userRepository = createMockRepository();
    trainerRepository = createMockRepository();
    clientRepository = createMockRepository();
    gymAdminRepository = createMockRepository();
    gymRepository = createMockRepository();
    scheduleRepository = createMockRepository();
    locationRepository = createMockRepository();
    formRepository = createMockRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserManagementService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepository,
        },
        {
          provide: getRepositoryToken(Trainer),
          useValue: trainerRepository,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: clientRepository,
        },
        {
          provide: getRepositoryToken(GymAdmin),
          useValue: gymAdminRepository,
        },
        {
          provide: getRepositoryToken(Gym),
          useValue: gymRepository,
        },
        {
          provide: getRepositoryToken(Schedule),
          useValue: scheduleRepository,
        },
        {
          provide: getRepositoryToken(Location),
          useValue: locationRepository,
        },
        {
          provide: getRepositoryToken(Form),
          useValue: formRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: RecommendationService,
          useValue: mockRecommendationService,
        },
      ],
    }).compile();

    service = module.get<UserManagementService>(UserManagementService);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateClient', () => {
    const buildClient = () => ({
      clientId: 1,
      user: { id: 10 },
      location: {
        city: 'Old City',
        zipCode: '00-001',
        street: 'Old Street',
        buildingNumber: '1',
        apartmentNumber: '1A',
      },
      schedule: {},
    });

    it('recomputes recommendations when location changes', async () => {
      const baseClient = buildClient();
      const updatedLocation = { ...baseClient.location, city: 'New City' };
      const updatedClient = { ...baseClient, location: updatedLocation };

      clientRepository.findOne.mockResolvedValueOnce(baseClient).mockResolvedValueOnce(updatedClient);
      locationRepository.save.mockResolvedValue(updatedLocation);
      mockRecommendationService.recomputeRecommendationsForClient.mockResolvedValue(undefined);

      const result = await service.updateClient(baseClient.clientId, { city: 'New City' });

      expect(locationRepository.save).toHaveBeenCalledWith(updatedLocation);
      expect(mockRecommendationService.recomputeRecommendationsForClient).toHaveBeenCalledWith(baseClient.clientId);
      expect(result.location.city).toBe('New City');
    });

    it('recomputes recommendations when form assignment changes', async () => {
      const baseClient = buildClient();
      const form = { formId: 5 } as any;
      const clientWithForm = { ...baseClient, form };

      clientRepository.findOne.mockResolvedValueOnce({ ...baseClient, form: undefined }).mockResolvedValueOnce(clientWithForm);
      formRepository.findOne.mockResolvedValue(form);
      clientRepository.save.mockResolvedValue(clientWithForm);
      mockRecommendationService.recomputeRecommendationsForClient.mockResolvedValue(undefined);

      const result = await service.updateClient(baseClient.clientId, { formId: form.formId });

      expect(formRepository.findOne).toHaveBeenCalledWith({ where: { formId: form.formId } });
      expect(clientRepository.save).toHaveBeenCalledWith(expect.objectContaining({ form }));
      expect(mockRecommendationService.recomputeRecommendationsForClient).toHaveBeenCalledWith(baseClient.clientId);
      expect(result.form).toEqual(form);
    });

    it('throws when provided form does not exist', async () => {
      const baseClient = buildClient();

      clientRepository.findOne.mockResolvedValue(baseClient);
      formRepository.findOne.mockResolvedValue(null);

      await expect(service.updateClient(baseClient.clientId, { formId: 999 })).rejects.toBeInstanceOf(NotFoundException);
      expect(mockRecommendationService.recomputeRecommendationsForClient).not.toHaveBeenCalled();
    });

    it('continues when recommendation recompute fails', async () => {
      const baseClient = buildClient();
      const updatedClient = { ...baseClient };

      clientRepository.findOne.mockResolvedValueOnce(baseClient).mockResolvedValueOnce(updatedClient);
      locationRepository.save.mockResolvedValue(baseClient.location);
      mockRecommendationService.recomputeRecommendationsForClient.mockRejectedValue(new Error('fail'));

      const result = await service.updateClient(baseClient.clientId, { city: 'Another City' });

      expect(mockRecommendationService.recomputeRecommendationsForClient).toHaveBeenCalledWith(baseClient.clientId);
      expect(result).toEqual(updatedClient);
    });
  });
});
