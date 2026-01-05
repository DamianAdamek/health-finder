import { Module } from '@nestjs/common';
import { LocationService } from './services';

@Module({
    providers: [LocationService],
    exports: [LocationService],
})
export class CommonModule {}
