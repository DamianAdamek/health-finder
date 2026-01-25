import { Test, TestingModule } from '@nestjs/testing';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import { GymOwnershipGuard } from './guards/gym-ownership.guard';
import { RoomOwnershipGuard } from './guards/room-ownership.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GymAdmin } from '../user-management/entities/gym-admin.entity';
import { Room } from './entities/room.entity';

describe('FacilitiesController', () => {
  let controller: FacilitiesController;

  const mockFacilitiesService = {
    createGym: jest.fn(),
    updateGym: jest.fn(),
    deleteGym: jest.fn(),
    getGym: jest.fn(),
    getAllGyms: jest.fn(),
    createLocation: jest.fn(),
    updateLocation: jest.fn(),
    deleteLocation: jest.fn(),
    getLocation: jest.fn(),
    createRoom: jest.fn(),
    updateRoom: jest.fn(),
    deleteRoom: jest.fn(),
    getRoom: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FacilitiesController],
      providers: [
        {
          provide: FacilitiesService,
          useValue: mockFacilitiesService,
        },
        {
          provide: getRepositoryToken(GymAdmin),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRepository,
        },
        GymOwnershipGuard,
        RoomOwnershipGuard,
      ],
    }).compile();

    controller = module.get<FacilitiesController>(FacilitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
