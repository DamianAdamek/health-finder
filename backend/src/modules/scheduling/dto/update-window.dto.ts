import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString, Matches, IsEnum, IsNumber, IsPositive, IsOptional, IsArray } from 'class-validator';
import { DayOfWeek } from '../../../common/enums';

@ApiSchema({ description: 'DTO for updating availability window' })
export class UpdateWindowDto {
    @ApiProperty({ example: '08:00', description: 'Time of start (HH:mm)', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, {
        message: 'startTime must be in HH:mm format',
    })
    startTime?: string;

    @ApiProperty({ example: '10:00', description: 'Time of end (HH:mm)', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, {
        message: 'endTime must be in HH:mm format',
    })
    endTime?: string;

    @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY, description: 'Day of the week', required: false })
    @IsOptional()
    @IsEnum(DayOfWeek)
    dayOfWeek?: DayOfWeek;

    @ApiProperty({ example: [1, 2, 3], description: 'IDs of schedules (optional; if absent, assigned automatically from trainingId)', required: false })
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    @IsPositive({ each: true })
    scheduleIds?: number[];

    @ApiProperty({ example: 1, description: 'Training ID (optional, null to detach training)', required: false })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    trainingId?: number;
}
