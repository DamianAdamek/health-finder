import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { DayOfWeek } from '../../../common/enums';

@ApiSchema({ description: 'DTO do tworzenia nowego okna dostępności' })
export class CreateWindowDto {
    @ApiProperty({ example: 1, description: 'ID harmonogramu' })
    scheduleId: number;

    @ApiProperty({ example: '08:00', description: 'Godzina rozpoczęcia (HH:mm)' })
    startTime: string;

    @ApiProperty({ example: '10:00', description: 'Godzina zakończenia (HH:mm)' })
    endTime: string;

    @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY, description: 'Dzień tygodnia' })
    dayOfWeek: DayOfWeek;
}
