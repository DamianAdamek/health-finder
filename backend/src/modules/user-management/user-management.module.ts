import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserManagementService } from './user-management.service';
import { UserManagementController } from './user-management.controller';
import { User } from './entities/user.entity';
import { Trainer } from './entities/trainer.entity';
import { Client } from './entities/client.entity';
import { GymAdmin } from './entities/gym-admin.entity';
import { Gym } from '../facilities/entities/gym.entity';
import { Schedule } from 'src/modules/scheduling/entities/schedule.entity';
import { Location } from 'src/modules/facilities/entities/location.entity';
import { Form } from '../engagement/entities/form.entity';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { SchedulingModule } from '../scheduling/scheduling.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Trainer, Client, Schedule, Location, GymAdmin, Gym, Form]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '24h' },
    }),
    SchedulingModule,
  ],
  controllers: [UserManagementController],
  providers: [UserManagementService, JwtStrategy, JwtAuthGuard, RolesGuard],
  exports: [UserManagementService, TypeOrmModule, JwtAuthGuard, RolesGuard],
})
export class UserManagementModule {}