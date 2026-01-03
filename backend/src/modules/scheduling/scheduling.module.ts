import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { Schedule } from './entities/schedule.entity';
import { Window } from './entities/window.entity';
import { Training } from './entities/training.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Schedule, Window, Training])],
    controllers: [SchedulingController],
    providers: [SchedulingService],
    exports: [SchedulingService],
})
export class SchedulingModule {}
