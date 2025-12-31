import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Form } from './entities/form.entity';
import { Opinion } from './entities/opinion.entity';
import { EngagementService } from './engagement.service';
import { EngagementController } from './engagement.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Form, Opinion])],
  controllers: [EngagementController],
  providers: [EngagementService],
})
export class EngagementModule {}
