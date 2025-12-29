import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { CommonModule } from './common/common.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { EngagementModule } from './modules/engagement/engagement.module';

@Module({
  imports: [DatabaseModule, CommonModule, UserManagementModule, SchedulingModule, FacilitiesModule, EngagementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
