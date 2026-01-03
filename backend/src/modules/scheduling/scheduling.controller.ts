import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SchedulingService } from './scheduling.service';
import {
    CreateScheduleDto,
    UpdateScheduleDto,
    CreateWindowDto,
    UpdateWindowDto,
    CreateTrainingDto,
    UpdateTrainingDto,
} from './dto';
import { Schedule } from './entities/schedule.entity';
import { Window } from './entities/window.entity';
import { Training } from './entities/training.entity';

@ApiTags('Scheduling')
@Controller('scheduling')
export class SchedulingController {
    constructor(private readonly schedulingService: SchedulingService) {}

    // Schedule endpoints
    @Post('schedule')
    @ApiOperation({ summary: 'Utwórz nowy harmonogram' })
    @ApiResponse({ status: 201, description: 'Harmonogram utworzony', type: Schedule })
    async createSchedule(@Body() createScheduleDto: CreateScheduleDto): Promise<Schedule> {
        return this.schedulingService.createSchedule(createScheduleDto);
    }

    @Get('schedule')
    @ApiOperation({ summary: 'Pobierz wszystkie harmonogramy' })
    @ApiResponse({ status: 200, description: 'Lista harmonogramów', type: [Schedule] })
    async getAllSchedules(): Promise<Schedule[]> {
        return this.schedulingService.getAllSchedules();
    }

    @Get('schedule/:id')
    @ApiOperation({ summary: 'Pobierz harmonogram po ID' })
    @ApiResponse({ status: 200, description: 'Harmonogram', type: Schedule })
    async getScheduleById(@Param('id') id: string): Promise<Schedule> {
        return this.schedulingService.getScheduleById(+id);
    }

    @Patch('schedule/:id')
    @ApiOperation({ summary: 'Aktualizuj harmonogram' })
    @ApiResponse({ status: 200, description: 'Harmonogram zaktualizowany', type: Schedule })
    async updateSchedule(
        @Param('id') id: string,
        @Body() updateScheduleDto: UpdateScheduleDto,
    ): Promise<Schedule> {
        return this.schedulingService.updateSchedule(+id, updateScheduleDto);
    }

    @Delete('schedule/:id')
    @ApiOperation({ summary: 'Usuń harmonogram' })
    @ApiResponse({ status: 204, description: 'Harmonogram usunięty' })
    async deleteSchedule(@Param('id') id: string): Promise<void> {
        return this.schedulingService.deleteSchedule(+id);
    }

    // Window endpoints
    @Post('window')
    @ApiOperation({ summary: 'Utwórz nowe okno dostępności' })
    @ApiResponse({ status: 201, description: 'Okno utworzone', type: Window })
    async createWindow(@Body() createWindowDto: CreateWindowDto): Promise<Window> {
        return this.schedulingService.createWindow(createWindowDto);
    }

    @Get('window')
    @ApiOperation({ summary: 'Pobierz wszystkie okna' })
    @ApiResponse({ status: 200, description: 'Lista okien', type: [Window] })
    async getAllWindows(): Promise<Window[]> {
        return this.schedulingService.getAllWindows();
    }

    @Get('window/:id')
    @ApiOperation({ summary: 'Pobierz okno po ID' })
    @ApiResponse({ status: 200, description: 'Okno', type: Window })
    async getWindowById(@Param('id') id: string): Promise<Window> {
        return this.schedulingService.getWindowById(+id);
    }

    @Get('window/schedule/:scheduleId')
    @ApiOperation({ summary: 'Pobierz okna dla harmonogramu' })
    @ApiResponse({ status: 200, description: 'Lista okien', type: [Window] })
    async getWindowsByScheduleId(@Param('scheduleId') scheduleId: string): Promise<Window[]> {
        return this.schedulingService.getWindowsByScheduleId(+scheduleId);
    }

    @Patch('window/:id')
    @ApiOperation({ summary: 'Aktualizuj okno' })
    @ApiResponse({ status: 200, description: 'Okno zaktualizowane', type: Window })
    async updateWindow(
        @Param('id') id: string,
        @Body() updateWindowDto: UpdateWindowDto,
    ): Promise<Window> {
        return this.schedulingService.updateWindow(+id, updateWindowDto);
    }

    @Delete('window/:id')
    @ApiOperation({ summary: 'Usuń okno' })
    @ApiResponse({ status: 204, description: 'Okno usunięte' })
    async deleteWindow(@Param('id') id: string): Promise<void> {
        return this.schedulingService.deleteWindow(+id);
    }

    // Training endpoints
    @Post('training')
    @ApiOperation({ summary: 'Utwórz nowy trening' })
    @ApiResponse({ status: 201, description: 'Trening utworzony', type: Training })
    async createTraining(@Body() createTrainingDto: CreateTrainingDto): Promise<Training> {
        return this.schedulingService.createTraining(createTrainingDto);
    }

    @Get('training')
    @ApiOperation({ summary: 'Pobierz wszystkie treningi' })
    @ApiResponse({ status: 200, description: 'Lista treningów', type: [Training] })
    async getAllTrainings(): Promise<Training[]> {
        return this.schedulingService.getAllTrainings();
    }

    @Get('training/:id')
    @ApiOperation({ summary: 'Pobierz trening po ID' })
    @ApiResponse({ status: 200, description: 'Trening', type: Training })
    async getTrainingById(@Param('id') id: string): Promise<Training> {
        return this.schedulingService.getTrainingById(+id);
    }

    @Patch('training/:id')
    @ApiOperation({ summary: 'Aktualizuj trening' })
    @ApiResponse({ status: 200, description: 'Trening zaktualizowany', type: Training })
    async updateTraining(
        @Param('id') id: string,
        @Body() updateTrainingDto: UpdateTrainingDto,
    ): Promise<Training> {
        return this.schedulingService.updateTraining(+id, updateTrainingDto);
    }

    @Delete('training/:id')
    @ApiOperation({ summary: 'Usuń trening' })
    @ApiResponse({ status: 204, description: 'Trening usunięty' })
    async deleteTraining(@Param('id') id: string): Promise<void> {
        return this.schedulingService.deleteTraining(+id);
    }
}
