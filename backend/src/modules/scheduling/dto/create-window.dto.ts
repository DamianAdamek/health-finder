import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString, Matches, IsEnum, IsNumber, IsPositive, IsOptional, IsArray } from 'class-validator';
import { DayOfWeek } from '../../../common/enums';

@ApiSchema({ description: 'DTO for creating availability window' })
export class CreateWindowDto {
    @ApiProperty({ example: [1, 2, 3], description: 'IDs of schedules (optional; if absent, assigned automatically from trainingId)', required: false })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @IsPositive({ each: true })
    scheduleIds?: number[];

    @ApiProperty({ example: '08:00', description: 'Format HH:mm' })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, {
        message: 'startTime must be in HH:mm format',
    })
    startTime: string;

    @ApiProperty({ example: '16:30', description: 'Format HH:mm' })
    @IsString()
    @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, {
        message: 'endTime must be in HH:mm format',
    })
    endTime: string;

    @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY, description: 'Day of the week' })
    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @ApiProperty({ example: 1, description: 'Training ID (optional, null to detach training)', required: false })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    trainingId?: number;
}
