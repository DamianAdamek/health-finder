import { Test, TestingModule } from '@nestjs/testing';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';

describe('UserManagementController', () => {
  let controller: UserManagementController;

  const mockUserManagementService = {
    registerClient: jest.fn(),
    registerTrainer: jest.fn(),
    registerGymAdmin: jest.fn(),
    login: jest.fn(),
    updateClient: jest.fn(),
    updateTrainer: jest.fn(),
    updateGymAdmin: jest.fn(),
    getUser: jest.fn(),
    getAllUsers: jest.fn(),
    deleteUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserManagementController],
      providers: [
        {
          provide: UserManagementService,
          useValue: mockUserManagementService,
        },
      ],
    }).compile();

    controller = module.get<UserManagementController>(UserManagementController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
