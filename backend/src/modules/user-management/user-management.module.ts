import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { User } from './entities/user.entity';
import { Trainer } from './entities/trainer.entity';
import { Client } from './entities/client.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Trainer, Client])],
  controllers: [UserManagementController],
  providers: [UserManagementService],
  exports: [UserManagementService, TypeOrmModule],
})
export class UserManagementModule {}