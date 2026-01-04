import { ApiProperty, ApiSchema } from '@nestjs/swagger';
import { IsString, Matches, IsEnum, IsNumber, IsPositive, IsOptional } from 'class-validator';
import { DayOfWeek } from '../../../common/enums';

@ApiSchema({ description: 'DTO do aktualizacji okna dostępności' })
export class UpdateWindowDto {
    @ApiProperty({ example: '08:00', description: 'Godzina rozpoczęcia (HH:mm)', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, {
        message: 'startTime must be in HH:mm format',
    })
    startTime?: string;

    @ApiProperty({ example: '10:00', description: 'Godzina zakończenia (HH:mm)', required: false })
    @IsOptional()
    @IsString()
    @Matches(/^([01]\d|2[0-3]):?([0-5]\d)$/, {
        message: 'endTime must be in HH:mm format',
    })
    endTime?: string;

    @ApiProperty({ enum: DayOfWeek, example: DayOfWeek.MONDAY, description: 'Dzień tygodnia', required: false })
    @IsOptional()
    @IsEnum(DayOfWeek)
    dayOfWeek?: DayOfWeek;

    @ApiProperty({ example: 1, description: 'ID treningu (opcjonalnie, null aby odłączyć trening)', required: false })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    trainingId?: number;
}
