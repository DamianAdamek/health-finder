import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { Schedule } from './entities/schedule.entity';
import { Window } from './entities/window.entity';
import { Training } from './entities/training.entity';
import { Room } from 'src/modules/facilities/entities/room.entity';
import { Gym } from 'src/modules/facilities/entities/gym.entity';
import { Trainer } from 'src/modules/user-management/entities/trainer.entity';
import { Client } from 'src/modules/user-management/entities/client.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Schedule, Window, Training, Room, Gym, Trainer, Client])],
    controllers: [SchedulingController],
    providers: [SchedulingService],
    exports: [SchedulingService],
})
export class SchedulingModule {}
