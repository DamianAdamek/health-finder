import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gym } from './entities/gym.entity';
import { Location } from './entities/location.entity';
import { Room } from './entities/room.entity';
import { GymAdmin } from '../user-management/entities/gym-admin.entity';
import { Schedule } from '../scheduling/entities/schedule.entity';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';
import { GymOwnershipGuard } from './guards/gym-ownership.guard';
import { RoomOwnershipGuard } from './guards/room-ownership.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Gym, Location, Room, Schedule, GymAdmin])],
  controllers: [FacilitiesController],
  providers: [FacilitiesService, GymOwnershipGuard, RoomOwnershipGuard],
})
export class FacilitiesModule {}
