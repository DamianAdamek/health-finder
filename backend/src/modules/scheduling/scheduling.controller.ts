import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
import { JwtAuthGuard } from '../user-management/guards/jwt-auth.guard';
import { RolesGuard } from '../user-management/guards/roles.guard';
import { Roles } from '../user-management/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@ApiTags('Scheduling')
@Controller('scheduling')
export class SchedulingController {
    constructor(private readonly schedulingService: SchedulingService) {}

    // Schedule endpoints
    @Post('schedules')
    @HttpCode(201)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.CLIENT, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create a new schedule - Trainer, GymAdmin, Client (personal availability) or Admin' })
    @ApiResponse({ status: 201, description: 'Schedule created', type: Schedule })
    async createSchedule(@Body() createScheduleDto: CreateScheduleDto): Promise<Schedule> {
        return this.schedulingService.createSchedule(createScheduleDto);
    }

    @Get('schedules')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.CLIENT, UserRole.GYM_ADMIN, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all schedules - Authenticated users only' })
    @ApiResponse({ status: 200, description: 'List of schedules', type: [Schedule] })
    async getAllSchedules(): Promise<Schedule[]> {
        return this.schedulingService.getAllSchedules();
    }

    @Get('schedules/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.CLIENT, UserRole.GYM_ADMIN, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get schedule by ID - Authenticated users (client/trainer/gym admin/admin)' })
    @ApiResponse({ status: 200, description: 'Schedule', type: Schedule })
    async getScheduleById(@Param('id') id: string): Promise<Schedule> {
        return this.schedulingService.getScheduleById(+id);
    }

    @Patch('schedules/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.CLIENT, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update schedule - Trainer, GymAdmin, Client (own schedule) or Admin' })
    @ApiResponse({ status: 200, description: 'Schedule updated', type: Schedule })
    async updateSchedule(
        @Param('id') id: string,
        @Body() updateScheduleDto: UpdateScheduleDto,
    ): Promise<Schedule> {
        return this.schedulingService.updateSchedule(+id, updateScheduleDto);
    }

    @Delete('schedules/:id')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.CLIENT, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete schedule - Trainer, GymAdmin, Client (own schedule) or Admin' })
    @ApiResponse({ status: 204, description: 'Schedule deleted' })
    async deleteSchedule(@Param('id') id: string): Promise<void> {
        await this.schedulingService.deleteSchedule(+id);
    }

    // Window endpoints
    @Post('windows')
    @HttpCode(201)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.CLIENT, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create availability window - Trainer, GymAdmin (room slots), Client (own availability) or Admin' })
    @ApiResponse({ status: 201, description: 'Window created', type: Window })
    async createWindow(@Body() createWindowDto: CreateWindowDto): Promise<Window> {
        return this.schedulingService.createWindow(createWindowDto);
    }

    @Get('windows')
    @ApiOperation({ summary: 'Get available windows - Public (shows only slots without booked training)' })
    @ApiResponse({ status: 200, description: 'List of available windows', type: [Window] })
    async getAllWindows(): Promise<Window[]> {
        return this.schedulingService.getAllWindows();
    }

    @Get('windows/:id')
    @ApiOperation({ summary: 'Get window by ID - Public' })
    @ApiResponse({ status: 200, description: 'Window', type: Window })
    async getWindowById(@Param('id') id: string): Promise<Window> {
        return this.schedulingService.getWindowById(+id);
    }

    @Get('windows/schedule/:scheduleId')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.CLIENT, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get windows by schedule ID - Trainer/GymAdmin/Client/Admin' })
    @ApiResponse({ status: 200, description: 'List of windows', type: [Window] })
    async getWindowsByScheduleId(@Param('scheduleId') scheduleId: string): Promise<Window[]> {
        return this.schedulingService.getWindowsByScheduleId(+scheduleId);
    }

    @Patch('windows/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.CLIENT, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update window - Trainer, GymAdmin (room slots), Client (own availability) or Admin' })
    @ApiResponse({ status: 200, description: 'Window updated', type: Window })
    async updateWindow(
        @Param('id') id: string,
        @Body() updateWindowDto: UpdateWindowDto,
    ): Promise<Window> {
        return this.schedulingService.updateWindow(+id, updateWindowDto);
    }

    @Delete('windows/:id')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.CLIENT, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete window - Trainer, GymAdmin (room slots), Client (own availability) or Admin' })
    @ApiResponse({ status: 204, description: 'Window deleted' })
    async deleteWindow(@Param('id') id: string): Promise<void> {
        await this.schedulingService.deleteWindow(+id);
    }

    // Training endpoints
    @Post('trainings')
    @HttpCode(201)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.CLIENT, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create training booking - Trainer, GymAdmin, Client or Admin' })
    @ApiResponse({ status: 201, description: 'Training created', type: Training })
    async createTraining(@Body() createTrainingDto: CreateTrainingDto): Promise<Training> {
        return this.schedulingService.createTraining(createTrainingDto);
    }

    @Get('trainings')
    @ApiOperation({ summary: 'Get all trainings - Public (shows booked/available trainings)' })
    @ApiResponse({ status: 200, description: 'List of trainings', type: [Training] })
    async getAllTrainings(): Promise<Training[]> {
        return this.schedulingService.getAllTrainings();
    }

    @Get('trainings/:id')
    @ApiOperation({ summary: 'Get training by ID - Public' })
    @ApiResponse({ status: 200, description: 'Training', type: Training })
    async getTrainingById(@Param('id') id: string): Promise<Training> {
        return this.schedulingService.getTrainingById(+id);
    }

    @Patch('trainings/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.CLIENT, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update training - Trainer, GymAdmin, Client or Admin' })
    @ApiResponse({ status: 200, description: 'Training updated', type: Training })
    async updateTraining(
        @Param('id') id: string,
        @Body() updateTrainingDto: UpdateTrainingDto,
    ): Promise<Training> {
        return this.schedulingService.updateTraining(+id, updateTrainingDto);
    }

    @Delete('trainings/:id')
    @HttpCode(204)
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.TRAINER, UserRole.GYM_ADMIN, UserRole.ADMIN)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete training - Trainer, GymAdmin or Admin only' })
    @ApiResponse({ status: 204, description: 'Training deleted' })
    async deleteTraining(@Param('id') id: string): Promise<void> {
        await this.schedulingService.deleteTraining(+id);
    }
}
