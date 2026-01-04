import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Schedule } from './entities/schedule.entity';
import { Window } from './entities/window.entity';
import { Training } from './entities/training.entity';
import {
    CreateScheduleDto,
    UpdateScheduleDto,
    CreateWindowDto,
    UpdateWindowDto,
    CreateTrainingDto,
    UpdateTrainingDto,
} from './dto';

@Injectable()
export class SchedulingService {
    constructor(
        @InjectRepository(Schedule)
        private scheduleRepository: Repository<Schedule>,
        @InjectRepository(Window)
        private windowRepository: Repository<Window>,
        @InjectRepository(Training)
        private trainingRepository: Repository<Training>,
    ) {}

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
        // Schedule sam zawiera windows, treningi są zalinkowywane przez windows.training
        return this.scheduleRepository.save(schedule);
    }

    async deleteSchedule(id: number): Promise<void> {
        const schedule = await this.getScheduleById(id);
        await this.scheduleRepository.remove(schedule);
    }

    // Window CRUD
    async createWindow(createWindowDto: CreateWindowDto): Promise<Window> {
        const window = this.windowRepository.create(createWindowDto);
        return this.windowRepository.save(window);
    }

    async getAllWindows(): Promise<Window[]> {
        return this.windowRepository.find({
            relations: ['schedule', 'training'],
        });
    }

    async getWindowById(id: number): Promise<Window> {
        const window = await this.windowRepository.findOne({
            where: { windowId: id },
            relations: ['schedule', 'training'],
        });
        if (!window) {
            throw new NotFoundException(`Window with ID ${id} not found`);
        }
        return window;
    }

    async getWindowsByScheduleId(scheduleId: number): Promise<Window[]> {
        return this.windowRepository.find({
            where: { schedule: { scheduleId } },
            relations: ['schedule', 'training'],
        });
    }

    async updateWindow(id: number, updateWindowDto: UpdateWindowDto): Promise<Window> {
        await this.windowRepository.update(id, updateWindowDto);
        return this.getWindowById(id);
    }

    async deleteWindow(id: number): Promise<void> {
        const window = await this.getWindowById(id);
        await this.windowRepository.remove(window);
    }

    // Training CRUD
    async createTraining(createTrainingDto: CreateTrainingDto): Promise<Training> {
        const training = this.trainingRepository.create(createTrainingDto);
        return this.trainingRepository.save(training);
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
        await this.trainingRepository.update(id, updateTrainingDto);
        return this.getTrainingById(id);
    }

    async deleteTraining(id: number): Promise<void> {
        const training = await this.getTrainingById(id);
        await this.trainingRepository.remove(training);
    }
}
