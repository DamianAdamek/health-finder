import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { DayOfWeek } from '../../../common/enums';

@ApiSchema({ description: 'DTO do aktualizacji okna dostępności' })
export class UpdateWindowDto {
    @ApiProperty({ example: '08:00', description: 'Godzina rozpoczęcia (HH:mm)', required: false })
    startTime?: string;

    @ApiProperty({ example: '10:00', description: 'Godzina zakończenia (HH:mm)', required: false })
    endTime?: string;

    @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY, description: 'Dzień tygodnia', required: false })
    dayOfWeek?: DayOfWeek;
}
