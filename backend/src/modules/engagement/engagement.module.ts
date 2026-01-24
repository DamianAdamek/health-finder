import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { Opinion } from './entities/opinion.entity';
import { EngagementService } from './engagement.service';
import { EngagementController } from './engagement.controller';
import { UserManagementModule } from '../user-management/user-management.module';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { CompletedTraining } from '../scheduling/entities/completed-training.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Form, Opinion, CompletedTraining]), UserManagementModule, SchedulingModule],
  controllers: [EngagementController],
  providers: [EngagementService],
  exports: [EngagementService],
})
export class EngagementModule {}
