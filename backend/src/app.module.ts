import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { UserManagementModule } from './modules/user-management/user-management.module';
import { SchedulingModule } from './modules/scheduling/scheduling.module';
import { FacilitiesModule } from './modules/facilities/facilities.module';
import { EngagementModule } from './modules/engagement/engagement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'test' ? '.env.test' : '../.env',
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'postgres'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV === 'test' || configService.get('NODE_ENV') !== 'production',
        dropSchema: process.env.NODE_ENV === 'test',
      }),
    }),

    DatabaseModule, 
    CommonModule, 
    UserManagementModule, 
    SchedulingModule, 
    FacilitiesModule, 
    EngagementModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
