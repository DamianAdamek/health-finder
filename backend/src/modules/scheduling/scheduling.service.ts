import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, DataSource, Not, IsNull } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { Window } from './entities/window.entity';
import { Training } from './entities/training.entity';
import { Room } from 'src/modules/facilities/entities/room.entity';
import { Gym } from 'src/modules/facilities/entities/gym.entity';
import { Trainer } from 'src/modules/user-management/entities/trainer.entity';
import { Client } from 'src/modules/user-management/entities/client.entity';
import { TrainingStatus } from '../../common/enums/training-status.enum';
import {
    CreateScheduleDto,
    UpdateScheduleDto,
    CreateWindowDto,
    UpdateWindowDto,
    CreateTrainingDto,
    UpdateTrainingDto,
} from './dto';
import { DayOfWeek } from 'src/common/enums';

@Injectable()
export class SchedulingService {
    constructor(
            @InjectRepository(Schedule)
            private scheduleRepository: Repository<Schedule>,
            @InjectRepository(Window)
            private windowRepository: Repository<Window>,
            @InjectRepository(Training)
            private trainingRepository: Repository<Training>,
            @InjectRepository(Room)
            private roomRepository: Repository<Room>,
            @InjectRepository(Gym)
            private gymRepository: Repository<Gym>,
            @InjectRepository(Trainer)
            private trainerRepository: Repository<Trainer>,
            @InjectRepository(Client)
            private clientRepository: Repository<Client>,
            private dataSource: DataSource,
    ) {}

    // Helper to check if a client has completed any training with a specific trainer
    async clientHasCompletedWithTrainer(clientId: number, trainerId: number): Promise<boolean> {
        return this.trainingRepository
            .createQueryBuilder('t')
            .innerJoin('t.clients', 'client')
            .innerJoin('t.trainer', 'trainer')
            .where('trainer.trainerId = :trainerId', { trainerId })
            .andWhere('client.clientId = :clientId', { clientId })
            .andWhere('t.status = :status', { status: TrainingStatus.COMPLETED })
            .getExists();
    }

    // Time validation helpers
    private isValidTimeFormat(time: string): boolean {
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
    }

    private compareTime(time1: string, time2: string): number {
        // Compare HH:mm format times. Returns: -1 if time1 < time2, 0 if equal, 1 if time1 > time2
        const [h1, m1] = time1.split(':').map(Number);
        const [h2, m2] = time2.split(':').map(Number);
        const totalMinutes1 = h1 * 60 + m1;
        const totalMinutes2 = h2 * 60 + m2;
        return Math.sign(totalMinutes1 - totalMinutes2);
    }

    private validateTimeWindow(startTime: string, endTime: string): void {
        if (!this.isValidTimeFormat(startTime) || !this.isValidTimeFormat(endTime)) {
            throw new BadRequestException('Time format must be HH:mm (e.g., 08:00, 16:30)');
        }
        if (this.compareTime(startTime, endTime) >= 0) {
            throw new BadRequestException('End time must be after start time');
        }
    }

    // Helper to check if two time windows overlap
    private timesOverlap(start1: string, end1: string, start2: string, end2: string): boolean {
        const [h1, m1] = start1.split(':').map(Number);
        const [h2, m2] = end1.split(':').map(Number);
        const [h3, m3] = start2.split(':').map(Number);
        const [h4, m4] = end2.split(':').map(Number);

        const minutes1Start = h1 * 60 + m1;
        const minutes1End = h2 * 60 + m2;
        const minutes2Start = h3 * 60 + m3;
        const minutes2End = h4 * 60 + m4;

        return minutes1Start < minutes2End && minutes2Start < minutes1End;
    }

    // Conflict checking helpers for time conflicts
    private async trainerHasConflict(
        trainerId: number, 
        dayOfWeek: DayOfWeek, 
        startTime: string, 
        endTime: string,
        windowId?: number
    ): Promise<boolean> {
        const trainer = await this.trainerRepository.findOne({
            where: { trainerId },
            relations: ['schedule']
        });

        if (!trainer || !trainer.schedule) {
            return false;
        }

        const existingWindows = await this.windowRepository.find({
            where: {
                dayOfWeek: dayOfWeek,
                ...(windowId ? { windowId: Not(windowId) } : {}),
                training: Not(IsNull())
            },
            relations: ['schedules', 'training']
        });

        for (const window of existingWindows) {
            // Check if this window belongs to trainer's schedule
            if (window.schedules?.some(s => s.scheduleId === trainer.schedule.scheduleId) &&
                this.timesOverlap(startTime, endTime, window.startTime, window.endTime)) {
                return true;
            }
        }

        return false;
    }

    private async roomHasConflict(
        roomId: number, 
        dayOfWeek: DayOfWeek, 
        startTime: string, 
        endTime: string,
        windowId?: number
    ): Promise<boolean> {
        const room = await this.roomRepository.findOne({ 
            where: { roomId },
            relations: ['gym', 'gym.schedule']
        });
        if (!room) throw new NotFoundException(`Room with ID ${roomId} not found`);
        
        if (!room.gym || !room.gym.schedule) {
            return false;
        }

        const qb = this.windowRepository.createQueryBuilder('window')
            .innerJoin('window.training', 'training')
            .innerJoin('training.room', 'room')
            .where('room.roomId = :roomId', { roomId })
            .andWhere('window.dayOfWeek = :dayOfWeek', { dayOfWeek })
            .andWhere('NOT (window.endTime <= :startTime OR window.startTime >= :endTime)', { startTime, endTime });

        if (windowId) {
            qb.andWhere('window.windowId != :windowId', { windowId });
        }

        const count = await qb.getCount();
        return count > 0;
    }

    private async clientHasConflict(
        clientId: number,
        dayOfWeek: DayOfWeek, 
        startTime: string, 
        endTime: string,
        windowId?: number
    ): Promise<boolean> {
        const client = await this.clientRepository.findOne({ 
            where: { clientId }, 
            relations: ['schedule'] 
        });
        if (!client || !client.schedule) return false;

        const existingClientWindows = await this.windowRepository.find({
            where: {
                dayOfWeek: dayOfWeek,
                ...(windowId ? { windowId: Not(windowId) } : {}),
                training: Not(IsNull())
            },
            relations: ['schedules', 'training']
        });

        for (const window of existingClientWindows) {
            if (window.schedules?.some(s => s.scheduleId === client.schedule.scheduleId) &&
                this.timesOverlap(startTime, endTime, window.startTime, window.endTime)) {
                return true;
            }
        }

        return false;
    }

    // Schedule CRUD
    async createSchedule(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
        const schedule = this.scheduleRepository.create(createScheduleDto);
        return this.scheduleRepository.save(schedule);
    }

    async getAllSchedules(): Promise<Schedule[]> {
        return this.scheduleRepository.find({
            relations: ['windows', 'windows.training'],
        });
    }

    async getScheduleById(id: number): Promise<Schedule> {
        const schedule = await this.scheduleRepository.findOne({
            where: { scheduleId: id },
            relations: ['windows', 'windows.training'],
        });
        if (!schedule) {
            throw new NotFoundException(`Schedule with ID ${id} not found`);
        }
        return schedule;
    }

    async updateSchedule(id: number, updateScheduleDto: UpdateScheduleDto): Promise<Schedule> {
        const schedule = await this.getScheduleById(id);
        if (updateScheduleDto.windowIds !== undefined) {
            const ids = updateScheduleDto.windowIds;
            const windows = await this.windowRepository.find({ where: { windowId: In(ids) } });
            if (windows.length !== ids.length) {
                throw new BadRequestException('One or more windowIds do not exist');
            }
            schedule.windows = windows;
        }

        return this.scheduleRepository.save(schedule);
    }

    async deleteSchedule(id: number): Promise<void> {
        const result = await this.scheduleRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Schedule with ID ${id} not found`);
        }
    }

    // Window CRUD
    async createWindow(createWindowDto: CreateWindowDto): Promise<Window> {
        this.validateTimeWindow(createWindowDto.startTime, createWindowDto.endTime);

        let training: Training | undefined;
        let schedules: Schedule[] = [];

        // If trainingId provided, auto-assign schedules from trainer, clients, and gym
        if (createWindowDto.trainingId !== undefined) {
            training = await this.getTrainingById(createWindowDto.trainingId);
            
            const scheduleIds = new Set<number>();
            
            // Add trainer's schedule
            if (training.trainer?.schedule?.scheduleId) {
                scheduleIds.add(training.trainer.schedule.scheduleId);
            }
            
            // Add gym (room) schedule
            if (training.room?.gym?.schedule?.scheduleId) {
                scheduleIds.add(training.room.gym.schedule.scheduleId);
            }
            
            // Add each client's schedule
            if (training.clients && training.clients.length > 0) {
                for (const client of training.clients) {
                    if (client.schedule?.scheduleId) {
                        scheduleIds.add(client.schedule.scheduleId);
                    }
                }
            }
            
            if (scheduleIds.size > 0) {
                schedules = await this.scheduleRepository.find({
                    where: { scheduleId: In(Array.from(scheduleIds)) }
                });
            }

            // Validate conflicts for trainer, room, and clients
            if (await this.trainerHasConflict(
                training.trainer.trainerId,
                createWindowDto.dayOfWeek,
                createWindowDto.startTime,
                createWindowDto.endTime))
            {
                throw new BadRequestException(`Trainer has a scheduling conflict at this time`);
            }

            if (await this.roomHasConflict(
                training.room.roomId,
                createWindowDto.dayOfWeek,
                createWindowDto.startTime,
                createWindowDto.endTime))
            {
                throw new BadRequestException(`Room is already occupied at this time`);
            }

            for (const client of training.clients) {
                if (await this.clientHasConflict(
                    client.clientId,
                    createWindowDto.dayOfWeek,
                    createWindowDto.startTime,
                    createWindowDto.endTime))
                {
                    throw new BadRequestException(`Client ${client.clientId} has a scheduling conflict at this time`);
                }
            }
        } else if (createWindowDto.scheduleIds && createWindowDto.scheduleIds.length > 0) {
            // Use provided scheduleIds
            schedules = await this.scheduleRepository.find({
                where: { scheduleId: In(createWindowDto.scheduleIds) }
            });
            if (schedules.length !== createWindowDto.scheduleIds.length) {
                throw new BadRequestException('One or more scheduleIds do not exist');
            }
        } else {
            throw new BadRequestException('Either trainingId or scheduleIds must be provided');
        }

        const window = this.windowRepository.create({
            startTime: createWindowDto.startTime,
            endTime: createWindowDto.endTime,
            dayOfWeek: createWindowDto.dayOfWeek,
            schedules,
            ...(training ? { training } : {}),
        });

        const saved = await this.windowRepository.save(window);
        return this.windowRepository.findOneOrFail({ where: { windowId: saved.windowId }, relations: ['schedules', 'training'] });
    }

    async getAllWindows(): Promise<Window[]> {
        return this.windowRepository.find({
            relations: ['schedules', 'training'],
        });
    }

    async getWindowById(id: number): Promise<Window> {
        const window = await this.windowRepository.findOne({
            where: { windowId: id },
            relations: ['schedules', 'training'],
        });
        if (!window) {
            throw new NotFoundException(`Window with ID ${id} not found`);
        }
        return window;
    }

    async getWindowsByScheduleId(scheduleId: number): Promise<Window[]> {
        // Fetch schedule to ensure it exists
        await this.getScheduleById(scheduleId);
        
        return this.windowRepository.find({
            relations: ['schedules', 'training'],
        }).then(windows => 
            windows.filter(w => w.schedules?.some(s => s.scheduleId === scheduleId))
        );
    }

    async updateWindow(id: number, updateWindowDto: UpdateWindowDto): Promise<Window> {
        if (updateWindowDto.startTime && updateWindowDto.endTime) {
            this.validateTimeWindow(updateWindowDto.startTime, updateWindowDto.endTime);
        }

        const window = await this.getWindowById(id);
        
        const { trainingId, scheduleIds, ...updateData } = updateWindowDto;
        Object.assign(window, updateData);

        let training = window.training;
        let schedules = window.schedules || [];

        // Handle trainingId change (re-assign schedules automatically)
        if (trainingId !== undefined) {
            training = await this.getTrainingById(trainingId);
            
            const scheduleIdSet = new Set<number>();
            
            // Add trainer's schedule
            if (training.trainer?.schedule?.scheduleId) {
                scheduleIdSet.add(training.trainer.schedule.scheduleId);
            }
            
            // Add gym (room) schedule
            if (training.room?.gym?.schedule?.scheduleId) {
                scheduleIdSet.add(training.room.gym.schedule.scheduleId);
            }
            
            // Add each client's schedule
            if (training.clients && training.clients.length > 0) {
                for (const client of training.clients) {
                    if (client.schedule?.scheduleId) {
                        scheduleIdSet.add(client.schedule.scheduleId);
                    }
                }
            }
            
            if (scheduleIdSet.size > 0) {
                schedules = await this.scheduleRepository.find({
                    where: { scheduleId: In(Array.from(scheduleIdSet)) }
                });
            }

            // Validate conflicts for trainer, room, and clients
            if (await this.trainerHasConflict(
                training.trainer.trainerId, 
                window.dayOfWeek,
                window.startTime, 
                window.endTime,
                id)) 
            {
                throw new BadRequestException(`Trainer has a scheduling conflict at this time`);
            }
            
            if (await this.roomHasConflict(
                training.room.roomId, 
                window.dayOfWeek,
                window.startTime, 
                window.endTime,
                id)) 
            {
                throw new BadRequestException(`Room is already occupied at this time`);
            }

            for (const client of training.clients) {
                if (await this.clientHasConflict(
                    client.clientId, 
                    window.dayOfWeek,
                    window.startTime, 
                    window.endTime,
                    id)) 
                {
                    throw new BadRequestException(`Client ${client.clientId} has a scheduling conflict at this time`);
                }
            }
        } else if (scheduleIds !== undefined) {
            // Use provided scheduleIds
            if (scheduleIds.length > 0) {
                schedules = await this.scheduleRepository.find({
                    where: { scheduleId: In(scheduleIds) }
                });
                if (schedules.length !== scheduleIds.length) {
                    throw new BadRequestException('One or more scheduleIds do not exist');
                }
            } else {
                schedules = [];
            }
        }

        window.training = training;
        window.schedules = schedules;

        await this.windowRepository.save(window);
        return this.getWindowById(id);
    }

    async deleteWindow(id: number): Promise<void> {
        const result = await this.windowRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Window with ID ${id} not found`);
        }
    }

    // Training CRUD
    async createTraining(createTrainingDto: CreateTrainingDto): Promise<Training> {
        const { roomId, trainerId, clientIds } = createTrainingDto;

        const room = await this.roomRepository.findOne({ where: { roomId } });
        if (!room) throw new NotFoundException(`Room with ID ${roomId} does not exist`);

        const trainer = await this.trainerRepository.findOne({ where: { trainerId } });
        if (!trainer) throw new NotFoundException(`Trainer with ID ${trainerId} does not exist`);

        let clients = [] as Client[];
        if (clientIds && clientIds.length > 0) {
            const uniqueClientIds = [...new Set(clientIds)];
            if (uniqueClientIds.length !== clientIds.length) {
                throw new BadRequestException('Duplicate clientIds are not allowed');
            }

            clients = await this.clientRepository.find({ 
                where: { clientId: In(clientIds) } 
            });
            
            if (clients.length !== clientIds.length) {
                throw new NotFoundException('One or more clientIds do not exist');
            }
        }

        return this.dataSource.transaction(async (manager) => {
            const training = manager.create(Training, {
                room,
                price: createTrainingDto.price,
                trainer,
                status: createTrainingDto.status,
                type: createTrainingDto.type,
                clients,
            });

            return manager.save(training);
        });
    }

    async getAllTrainings(): Promise<Training[]> {
        return this.trainingRepository.find({
            relations: ['room', 'trainer', 'clients', 'window'],
        });
    }

    async getTrainingById(id: number): Promise<Training> {
        const training = await this.trainingRepository.findOne({
            where: { trainingId: id },
            relations: ['room', 'trainer', 'clients', 'window'],
        });
        if (!training) {
            throw new NotFoundException(`Training with ID ${id} not found`);
        }
        return training;
    }

    async updateTraining(id: number, updateTrainingDto: UpdateTrainingDto): Promise<Training> {
        const { roomId, trainerId, clientIds } = updateTrainingDto;
        const toUpdate: any = { ...updateTrainingDto };

        if (roomId !== undefined) {
            const room = await this.roomRepository.findOne({ where: { roomId } });
            if (!room) throw new NotFoundException(`Room with ID ${roomId} does not exist`);
            toUpdate.room = room;
            delete toUpdate.roomId;
        }

        if (trainerId !== undefined) {
            const trainer = await this.trainerRepository.findOne({ where: { trainerId } });
            if (!trainer) throw new NotFoundException(`Trainer with ID ${trainerId} does not exist`);
            toUpdate.trainer = trainer;
            delete toUpdate.trainerId;
        }

        if (clientIds !== undefined) {
            const uniqueClientIds = [...new Set(clientIds)];
            if (uniqueClientIds.length !== clientIds.length) {
                throw new BadRequestException('Duplicate clientIds are not allowed');
            }

            const clients = await this.clientRepository.find({ where: { clientId: In(clientIds) } });
            if (clients.length !== clientIds.length) {
                throw new NotFoundException('One or more clientIds do not exist');
            }

            toUpdate.clients = clients;
            delete toUpdate.clientIds;
        }

        const training = await this.getTrainingById(id);
        Object.assign(training, toUpdate);

        // Validate conflicts if this training is assigned to a window
        const window = await this.windowRepository.findOne({
            where: { training: { trainingId: id } },
            relations: ['training']
        });

        if (window) {
            // Validate conflicts for trainer, room, and clients
            if (await this.trainerHasConflict(
                training.trainer.trainerId, 
                window.dayOfWeek,
                window.startTime, 
                window.endTime,
                window.windowId)) 
            {
                throw new BadRequestException(`Trainer has a scheduling conflict at this time`);
            }
            
            if (await this.roomHasConflict(
                training.room.roomId, 
                window.dayOfWeek,
                window.startTime, 
                window.endTime,
                window.windowId)) 
            {
                throw new BadRequestException(`Room is already occupied at this time`);
            }

            for (const client of training.clients) {
                if (await this.clientHasConflict(
                    client.clientId, 
                    window.dayOfWeek,
                    window.startTime, 
                    window.endTime,
                    window.windowId)) 
                {
                    throw new BadRequestException(`Client ${client.clientId} has a scheduling conflict at this time`);
                }
            }
        }

        await this.trainingRepository.save(training);
        return this.getTrainingById(id);
    }

    async deleteTraining(id: number): Promise<void> {
        const result = await this.trainingRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Training with ID ${id} not found`);
        }
    }
}
