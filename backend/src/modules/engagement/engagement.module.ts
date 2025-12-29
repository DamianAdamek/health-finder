import { Module } from '@nestjs/common';
import { EngagementService } from './engagement.service';
import { EngagementController } from './engagement.controller';

@Module({
  controllers: [EngagementController],
  providers: [EngagementService],
})
export class EngagementModule {}
