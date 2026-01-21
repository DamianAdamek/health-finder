import { Module } from '@nestjs/common';
import { LocationService } from './services';
import { EnumsService } from './enums/enums.service';
import { EnumsController } from './enums/enums.controller';

@Module({
    providers: [LocationService, EnumsService],
    exports: [LocationService],
    controllers: [EnumsController],
})
export class CommonModule {}
