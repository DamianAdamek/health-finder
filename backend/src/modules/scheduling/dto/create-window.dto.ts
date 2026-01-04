import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString, Matches, IsEnum, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { DayOfWeek } from '../../../common/enums';

@ApiSchema({ description: 'DTO do tworzenia nowego okna dostępności' })
export class CreateWindowDto {
    @ApiProperty({ example: 1, description: 'ID okna' })
    @IsNumber()
    @IsPositive()
    windowId: number;

    @ApiProperty({ example: 1, description: 'ID harmonogramu' })
    @IsNumber()
    @IsPositive()
    scheduleId: number;

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

    @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY, description: 'Dzień tygodnia' })
    @IsEnum(DayOfWeek)
    dayOfWeek: DayOfWeek;

    @ApiProperty({ example: 1, description: 'ID treningu (opcjonalnie)', required: false })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    trainingId?: number;
}
