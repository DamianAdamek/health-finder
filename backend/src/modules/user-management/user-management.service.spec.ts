import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementService } from './user-management.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
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

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockRecommendationService = {
    recommendLocations: jest.fn(),
    recommendTrainings: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserManagementService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Trainer),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Client),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(GymAdmin),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Gym),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Schedule),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Location),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Form),
          useValue: mockRepository,
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
