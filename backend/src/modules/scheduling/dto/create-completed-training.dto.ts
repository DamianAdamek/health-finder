import { IsInt, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompletedTrainingDto {
    @Type(() => Number)
    @IsInt()
    @ApiProperty({ example: 1, description: 'ID of the training to archive' })
    trainingId: number;

    @Type(() => Number)
    @IsInt()
    @ApiProperty({ example: 1, description: 'ID of the client who completed the training' })
    clientId: number;

    @IsDateString()
    @ApiProperty({ example: '2026-01-24', description: 'Date when the training was completed' })
    trainingDate: string;
}
