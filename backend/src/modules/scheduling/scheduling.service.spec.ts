import { Test, TestingModule } from '@nestjs/testing';
import { SchedulingService } from './scheduling.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { Window } from './entities/window.entity';
import { Training } from './entities/training.entity';
import { Room } from '../facilities/entities/room.entity';
import { Gym } from '../facilities/entities/gym.entity';
import { Trainer } from '../user-management/entities/trainer.entity';
import { Client } from '../user-management/entities/client.entity';
import { TrainingStatus } from '../../common/enums/training-status.enum';

describe('SchedulingService', () => {
  let service: SchedulingService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  const mockDataSource = {
    createQueryRunner: jest.fn().mockReturnValue({
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        save: jest.fn(),
        delete: jest.fn(),
      },
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulingService,
        {
          provide: getRepositoryToken(Schedule),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Window),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Training),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Room),
          useValue: mockRepository,
        },
        {
          provide: getRepositoryToken(Gym),
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
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<SchedulingService>(SchedulingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('cancelTraining', () => {
    beforeEach(() => {
      // Reset mockDataSource before each test
      jest.clearAllMocks();
    });

    it('should cancel training reservation successfully', async () => {
      // ARRANGE - Przygotowanie danych
      const trainingId = 1;
      const clientId = 5;
      
      // Oblicz czas startu 2 godziny w przyszłości w formacie HH:mm
      const futureDate = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
      const futureHour = String(futureDate.getHours()).padStart(2, '0');
      const futureMinute = String(futureDate.getMinutes()).padStart(2, '0');
      const futureTimeString = `${futureHour}:${futureMinute}`;

      const training = {
        trainingId,
        clientId,
        status: TrainingStatus.PLANNED,
        window: {
          windowId: 1,
          startTime: futureTimeString,
          endTime: '18:00',
        },
        trainer: { trainerId: 2, name: 'John' },
        room: { roomId: 3, name: 'Room A' },
      };

      mockRepository.findOne.mockResolvedValue(training);
      const mockQueryRunner = mockDataSource.createQueryRunner();
      mockQueryRunner.manager.save.mockResolvedValue({ ...training, status: 'CANCELLED' });

      // ACT - Wykonanie
      const result = await service.cancelTraining(trainingId, clientId);

      // EXPECT - Sprawdzenia
      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should throw NotFoundException when training does not exist', async () => {
      // ARRANGE
      mockRepository.findOne.mockResolvedValue(null);

      // ACT & EXPECT
      await expect(service.cancelTraining(999, 5))
        .rejects
        .toThrow('Training with ID 999 not found');

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when trying to cancel already cancelled training', async () => {
      // ARRANGE
      const training = {
        trainingId: 1,
        clientId: 5,
        status: TrainingStatus.CANCELLED,
        window: {
          windowId: 1,
          startTime: '16:00',
        },
      };

      mockRepository.findOne.mockResolvedValue(training);

      // ACT & EXPECT
      await expect(service.cancelTraining(1, 5))
        .rejects
        .toThrow('Cannot cancel already cancelled training');

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when training does not have window assigned', async () => {
      // ARRANGE
      const training = {
        trainingId: 1,
        clientId: 5,
        status: 'SCHEDULED',
        window: null, // Brak przypisanego window
      };

      mockRepository.findOne.mockResolvedValue(training);

      // ACT & EXPECT
      await expect(service.cancelTraining(1, 5))
        .rejects
        .toThrow('Training is not assigned to any window');
    });

    it('should throw BadRequestException when cancelling training too close to start time', async () => {
      // ARRANGE
      // Oblicz czas 30 minut od teraz
      const soonDate = new Date(new Date().getTime() + 30 * 60 * 1000);
      const soonHour = String(soonDate.getHours()).padStart(2, '0');
      const soonMinute = String(soonDate.getMinutes()).padStart(2, '0');
      const soonTimeString = `${soonHour}:${soonMinute}`;

      const training = {
        trainingId: 1,
        clientId: 5,
        status: TrainingStatus.PLANNED,
        window: {
          windowId: 1,
          startTime: soonTimeString,
        },
      };

      mockRepository.findOne.mockResolvedValue(training);

      // ACT & EXPECT
      await expect(service.cancelTraining(1, 5))
        .rejects
        .toThrow('Cannot cancel training less than 1 hour before start time');

      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should allow cancellation if minimum notice period is met (>= 1 hour)', async () => {
      // ARRANGE
      // Oblicz czas 61 minut od teraz
      const validDate = new Date(new Date().getTime() + 61 * 60 * 1000);
      const validHour = String(validDate.getHours()).padStart(2, '0');
      const validMinute = String(validDate.getMinutes()).padStart(2, '0');
      const validTimeString = `${validHour}:${validMinute}`;

      const training = {
        trainingId: 1,
        clientId: 5,
        status: TrainingStatus.PLANNED,
        window: {
          windowId: 1,
          startTime: validTimeString,
        },
      };

      mockRepository.findOne.mockResolvedValue(training);
      const mockQueryRunner = mockDataSource.createQueryRunner();
      mockQueryRunner.manager.save.mockResolvedValue({ ...training, status: 'CANCELLED' });

      // ACT
      const result = await service.cancelTraining(1, 5);

      // EXPECT
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should handle transaction rollback on save error', async () => {
      // ARRANGE
      const futureDate = new Date(new Date().getTime() + 2 * 60 * 60 * 1000);
      const futureHour = String(futureDate.getHours()).padStart(2, '0');
      const futureMinute = String(futureDate.getMinutes()).padStart(2, '0');
      const futureTimeString = `${futureHour}:${futureMinute}`;

      const training = {
        trainingId: 1,
        clientId: 5,
        status: TrainingStatus.PLANNED,
        window: {
          windowId: 1,
          startTime: futureTimeString,
        },
      };

      mockRepository.findOne.mockResolvedValue(training);

      // Mock transaction error
      const mockQueryRunner = mockDataSource.createQueryRunner();
      mockQueryRunner.manager.save.mockRejectedValue(new Error('Database error'));

      // ACT & EXPECT
      await expect(service.cancelTraining(1, 5))
        .rejects
        .toThrow('Database error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    });
  });
});
