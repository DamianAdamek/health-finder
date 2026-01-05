import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Gym } from './entities/gym.entity';
import { Location } from './entities/location.entity';
import { Room } from './entities/room.entity';
import { Schedule } from 'src/modules/scheduling/entities/schedule.entity';
import { FacilitiesService } from './facilities.service';
import { FacilitiesController } from './facilities.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Gym, Location, Room, Schedule])],
  controllers: [FacilitiesController],
  providers: [FacilitiesService],
})
export class FacilitiesModule {}
