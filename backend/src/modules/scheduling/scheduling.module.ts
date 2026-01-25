import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SchedulingService } from './scheduling.service';
import { SchedulingController } from './scheduling.controller';
import { RecommendationService } from './recommendation.service';
import { Schedule } from './entities/schedule.entity';
import { Window } from './entities/window.entity';
import { Training } from './entities/training.entity';
import { CompletedTraining } from './entities/completed-training.entity';
import { Room } from '../facilities/entities/room.entity';
import { Gym } from '../facilities/entities/gym.entity';
import { Trainer } from '../user-management/entities/trainer.entity';
import { Client } from '../user-management/entities/client.entity';
import { Form } from '../engagement/entities/form.entity';
import { CommonModule } from '../../common/common.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Schedule, Window, Training, CompletedTraining, Room, Gym, Trainer, Client, Form]),
        CommonModule,
    ],
    controllers: [SchedulingController],
    providers: [SchedulingService, RecommendationService],
    exports: [SchedulingService, RecommendationService, TypeOrmModule],
})
export class SchedulingModule {}
