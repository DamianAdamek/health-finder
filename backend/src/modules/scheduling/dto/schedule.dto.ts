import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { WindowDto } from './window.dto';
import { TrainingDto } from './training.dto';

@ApiSchema({ description: 'DTO harmonogramu' })
export class ScheduleDto {
    @ApiProperty({ example: 1, description: 'ID harmonogramu' })
    ScheduleId: number;

    @ApiProperty({ type: () => [WindowDto], description: 'Lista okien dostępności' })
    windows: WindowDto[];

    @ApiProperty({ type: () => [TrainingDto], description: 'Lista trenigów' })
    trainings: TrainingDto[];
}
